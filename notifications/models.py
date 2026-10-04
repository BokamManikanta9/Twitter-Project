from django.conf import settings
from django.db import models
from posts.models import Post


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        LIKE = "LIKE", "Like"
        COMMENT = "COMMENT", "Comment"
        FOLLOW = "FOLLOW", "Follow"
        MESSAGE = "MESSAGE", "Message"
        REPOST = "REPOST", "Repost"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
    )

    notification_type = models.CharField(
        max_length=10,
        choices=NotificationType.choices,
    )

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    link = models.CharField(
        max_length=255,
        blank=True,
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender} -> {self.recipient} ({self.notification_type})"