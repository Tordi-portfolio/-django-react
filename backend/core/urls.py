from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('business/', views.business_info, name='business_info'),
]
