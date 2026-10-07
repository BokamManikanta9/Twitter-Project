from django.urls import path
from . import views

urlpatterns = [
    path("start/<int:user_id>/", views.start_conversation, name="start_conversation"),
    path("<int:conversation_id>/", views.chat_view, name="chat"),
    path("", views.inbox, name="inbox"),
]