from rest_framework import serializers

from .models import Conversation, Message, PushSubscription, TOPIC_CHOICES


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'sender_is_staff', 'body', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ConversationListSerializer(serializers.ModelSerializer):
    """Used for the staff inbox list — one row per conversation."""

    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    topic_display = serializers.CharField(source='get_topic_display', read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'customer_name', 'customer_email', 'topic', 'topic_display',
            'is_closed', 'updated_at', 'unread_count', 'last_message',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def get_unread_count(self, obj):
        return obj.unread_for_staff()

    def get_last_message(self, obj):
        msg = obj.last_message()
        if not msg:
            return None
        body = msg.body if len(msg.body) <= 140 else msg.body[:137] + '…'
        return {'body': body, 'created_at': msg.created_at, 'sender_is_staff': msg.sender_is_staff}


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Used for both the customer dashboard and a staff conversation view —
    full thread included."""

    topic_display = serializers.CharField(source='get_topic_display', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_phone = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'topic', 'topic_display', 'is_closed', 'created_at', 'updated_at',
            'customer_name', 'customer_email', 'customer_phone', 'messages',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def get_customer_phone(self, obj):
        return getattr(getattr(obj.customer, 'profile', None), 'phone', '')


class NewConversationSerializer(serializers.Serializer):
    topic = serializers.ChoiceField(choices=TOPIC_CHOICES)
    body = serializers.CharField(allow_blank=False, trim_whitespace=True)


class NewMessageSerializer(serializers.Serializer):
    body = serializers.CharField(allow_blank=False, trim_whitespace=True)


class PushSubscriptionKeysSerializer(serializers.Serializer):
    p256dh = serializers.CharField()
    auth = serializers.CharField()


class PushSubscriptionSerializer(serializers.Serializer):
    """Matches the shape of PushSubscription.toJSON() from the browser:
    {"endpoint": "...", "keys": {"p256dh": "...", "auth": "..."}}"""

    endpoint = serializers.URLField(max_length=500)
    keys = PushSubscriptionKeysSerializer()
