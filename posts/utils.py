from .models import Like, Repost, Bookmark


def attach_comment_threads(posts):
    for post in posts:
            all_comments = list(post.comments.select_related('user').all())
            comment_map = {comment.id: comment for comment in all_comments}


            for comment in all_comments:
                comment.direct_replies = []

            for comment in all_comments:
                comment.reply_to = comment_map.get(comment.parent_id) if comment.parent_id else None
                if comment.parent_id:
                    parent = comment_map.get(comment.parent_id)
                    if parent:
                        parent.direct_replies.append(comment)

            for comment in all_comments:
                comment.direct_replies.sort(key=lambda x: x.created_at)

            top_comments = [comment for comment in all_comments if comment.parent_id is None]
            top_comments.sort(key=lambda x: x.created_at)

            post.top_comments = top_comments


def attach_engagement_state(posts, user):
    if not user.is_authenticated:
        for post in posts:
            post.user_has_liked = False
            post.user_has_reposted = False
            post.user_has_bookmarked = False
        return

    liked_ids = set(Like.objects.filter(user=user).values_list('post_id', flat=True))
    reposted_ids = set(Repost.objects.filter(user=user).values_list('post_id', flat=True))
    bookmarked_ids = set(Bookmark.objects.filter(user=user).values_list('post_id', flat=True))

    for post in posts:
        post.user_has_liked = post.id in liked_ids
        post.user_has_reposted = post.id in reposted_ids
        post.user_has_bookmarked = post.id in bookmarked_ids