from django.contrib import admin

# Register your models here.
from .models import Conversation
from .models import Message

admin.site.register(Conversation)
admin.site.register(Message)