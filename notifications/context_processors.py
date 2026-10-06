from .models import Notification


def unread_notification_count(request):
    if not request.user.is_authenticated:
        return {
            "notification_count": 0
        }

    notification_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()

    return {
        "notification_count": notification_count
    }