from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message, PushSubscription
from .serializers import (
    ConversationDetailSerializer,
    ConversationListSerializer,
    NewConversationSerializer,
    NewMessageSerializer,
    PushSubscriptionSerializer,
)
from .push import notify_user

User = get_user_model()


def _notify_staff(sender, msg):
    """Ping every staff ('Robert') account when a customer messages in."""
    name = sender.get_full_name() or sender.username
    preview = msg.body if len(msg.body) <= 120 else msg.body[:117] + '…'
    for staff_user in User.objects.filter(is_staff=True, is_active=True):
        notify_user(
            staff_user,
            title=f'New message from {name}',
            body=preview,
            url=f'/admin/conversations/{msg.conversation_id}',
        )


class MyConversationView(APIView):
    """The logged-in customer's single conversation.
    GET  — fetch it (returns null if they haven't messaged yet).
    POST — start it with a first message (topic + body)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            return Response({'detail': 'Staff accounts use /api/conversations/.'}, status=400)
        conversation = Conversation.objects.filter(customer=request.user).first()
        if conversation is None:
            return Response(None)
        conversation.messages.filter(sender_is_staff=True, is_read=False).update(is_read=True)
        return Response(ConversationDetailSerializer(conversation).data)

    def post(self, request):
        if request.user.is_staff:
            return Response({'detail': 'Staff accounts cannot start a customer conversation.'}, status=400)
        if Conversation.objects.filter(customer=request.user).exists():
            return Response(
                {'detail': 'You already have a conversation — send a message to it instead.'},
                status=400,
            )
        serializer = NewConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = Conversation.objects.create(
            customer=request.user, topic=serializer.validated_data['topic']
        )
        msg = Message.objects.create(
            conversation=conversation, sender=request.user, body=serializer.validated_data['body']
        )
        _notify_staff(request.user, msg)
        return Response(ConversationDetailSerializer(conversation).data, status=201)


class MyMessagesView(APIView):
    """POST a follow-up message to the customer's own (already-started)
    conversation."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        conversation = Conversation.objects.filter(customer=request.user).first()
        if conversation is None:
            return Response({'detail': 'Start a conversation first.'}, status=400)
        serializer = NewMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = Message.objects.create(
            conversation=conversation, sender=request.user, body=serializer.validated_data['body']
        )
        _notify_staff(request.user, msg)
        return Response(ConversationDetailSerializer(conversation).data, status=201)


class ConversationListView(APIView):
    """Staff inbox: every conversation, newest activity first. Supports
    ?q=name-or-email for search."""

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = Conversation.objects.select_related('customer').prefetch_related('messages')
        q = request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(customer__username__icontains=q)
                | Q(customer__first_name__icontains=q)
                | Q(customer__email__icontains=q)
            ).distinct()
        return Response(ConversationListSerializer(qs, many=True).data)


class ConversationDetailView(APIView):
    """Staff: view the full thread with a specific customer and reply."""

    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        conversation = get_object_or_404(Conversation.objects.select_related('customer'), pk=pk)
        conversation.messages.filter(sender_is_staff=False, is_read=False).update(is_read=True)
        return Response(ConversationDetailSerializer(conversation).data)

    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
        serializer = NewMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = Message.objects.create(
            conversation=conversation, sender=request.user, body=serializer.validated_data['body']
        )
        preview = msg.body if len(msg.body) <= 120 else msg.body[:117] + '…'
        notify_user(
            conversation.customer,
            title=settings.BUSINESS['name'],
            body=preview,
            url='/dashboard',
        )
        return Response(ConversationDetailSerializer(conversation).data, status=201)


class PushSubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        PushSubscription.objects.update_or_create(
            endpoint=data['endpoint'],
            defaults={
                'user': request.user,
                'p256dh': data['keys']['p256dh'],
                'auth': data['keys']['auth'],
                'user_agent': request.META.get('HTTP_USER_AGENT', '')[:255],
            },
        )
        return Response({'ok': True}, status=201)


class PushUnsubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        if endpoint:
            PushSubscription.objects.filter(endpoint=endpoint, user=request.user).delete()
        return Response({'ok': True})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def vapid_public_key(request):
    return Response({'vapid_public_key': settings.VAPID_PUBLIC_KEY})
