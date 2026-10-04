from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from elasticsearch_dsl import Keyword
from .models import Post


@registry.register_document
class PostDocument(Document):
    
    hashtags = Keyword(multi=True)
    class Index:
        name = "posts"

    class Django:
        model = Post
        fields = [
            "content",
            "created_at",
        ]

    def prepare_hashtags(self, instance):
        return list(instance.hashtags or [])
    def prepare_id(self, instance):
        return str(instance.id)