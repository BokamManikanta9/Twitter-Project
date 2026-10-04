from django.contrib import admin
from .models import User, VerificationRequest


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "created_at")
    list_filter = ("status",)
