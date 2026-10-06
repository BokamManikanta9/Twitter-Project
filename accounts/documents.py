from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from django.contrib.auth import get_user_model

User = get_user_model()

@registry.register_document
class UserDocument(Document):
    class Index:
        name = "users"

    class Django:
        model = User
        fields = [
            "username",
            "bio",
            "first_name",
            "last_name",
            "verification_status",
        ]