# views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Conversation, Message
from notifications.utils import create_notification
from notifications.models import Notification
from django.contrib.auth.decorators import login_required

User = get_user_model()

@login_required
def start_conversation(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    current_user = request.user

    if current_user == other_user:
        return redirect("home")

    is_mutual = (
        current_user.following.filter(id=other_user.id).exists()
        and other_user.following.filter(id=current_user.id).exists()
    )
    if not is_mutual:
        return redirect("home")  

    conversation = Conversation.objects.filter(
        user1=current_user, user2=other_user
    ).first()
    if not conversation:
        conversation = Conversation.objects.filter(
            user1=other_user, user2=current_user
        ).first()
    if not conversation:
        conversation = Conversation.objects.create(
            user1=current_user, user2=other_user
        )

    return redirect("chat", conversation_id=conversation.id)

@login_required
def chat_view(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id)

    if request.user not in [conversation.user1, conversation.user2]:
        return redirect("home")

    other_user = conversation.user2 if conversation.user1 == request.user else conversation.user1

    if request.method == "POST":
        text = request.POST.get("text")
        if text:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                text=text
            )
            create_notification(
                recipient=other_user,
                sender=request.user,
                notification_type=Notification.NotificationType.MESSAGE,
                link=f"/messages/{conversation.id}/",
            )
            conversation.save()
        return redirect("chat", conversation_id=conversation.id)

    
    messages = conversation.messages.all()
    return render(request, "chat.html", {
        "conversation": conversation,
        "other_user": other_user,
        "messages": messages
    })


def inbox(request):
    user = request.user
    conversations = Conversation.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).order_by("-updated_at")

    for c in conversations:
        c.other_user = c.user2 if c.user1 == user else c.user1
        last = c.messages.last()
        c.last_message = last.text if last else ""

    # people you can start a new chat with: mutual follows only
    following_ids = set(user.following.values_list('id', flat=True))
    follower_ids = set(user.followers.values_list('id', flat=True))
    mutual_ids = following_ids & follower_ids

    users = User.objects.filter(id__in=mutual_ids)

    return render(request, "inbox.html", {
        "conversations": conversations,
        "users": users
    })