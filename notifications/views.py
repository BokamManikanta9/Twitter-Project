from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .models import Notification


@login_required
def notifications(request):
    notifications = Notification.objects.filter(
        recipient=request.user
    ).select_related("sender")

    notifications.filter(is_read=False).update(is_read=True)

    return render(
        request,
        "notifications.html",
        {
            "notifications": notifications
        }
    )