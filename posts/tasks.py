from celery import shared_task
from django.db.models import Count
from django.utils import timezone

from .models import Post


@shared_task
def update_trending_scores():
    posts = Post.objects.annotate(
        like_count=Count("likes"),
        comment_count=Count("comments"),
    )

    now = timezone.now()

    for post in posts:
        age = now - post.created_at
        hours_old = age.total_seconds() / 3600

        post.trending_score = (
            post.like_count * 3
            + post.comment_count * 5
            - hours_old * 0.2
        )

        post.save(update_fields=["trending_score"])

    return f"Updated trending scores for {posts.count()} posts"