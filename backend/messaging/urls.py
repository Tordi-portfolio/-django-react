from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('conversations/me/', views.MyConversationView.as_view(), name='my_conversation'),
    path('conversations/me/messages/', views.MyMessagesView.as_view(), name='my_messages'),
    path('conversations/', views.ConversationListView.as_view(), name='conversation_list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('push/subscribe/', views.PushSubscribeView.as_view(), name='push_subscribe'),
    path('push/unsubscribe/', views.PushUnsubscribeView.as_view(), name='push_unsubscribe'),
    path('push/vapid-public-key/', views.vapid_public_key, name='vapid_public_key'),
]
