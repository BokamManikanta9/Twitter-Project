from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from posts.models import Post, Comment, Repost, Like, Bookmark
from itertools import chain
from django.core.paginator import Paginator, EmptyPage

# Create your views here.

def landingpage(request):
    return render(request, 'landingpage.html')


@login_required
def homepage(request):
    tab = request.GET.get('tab', 'for_you')

    if tab == 'following':
        following_users = request.user.following.all()
        posts = Post.objects.filter(user__in=following_users)
        reposts = Repost.objects.filter(user__in=following_users)
    else:
        posts = Post.objects.all()
        reposts = Repost.objects.all()

    posts = posts.select_related('user')
    reposts = reposts.select_related('user', 'post')

    feed = sorted(
        chain(
            [{"type": "post", "post": p} for p in posts],
            [{"type": "repost", "post": r.post, "reposted_by": r.user, "created_at": r.created_at}
             for r in reposts]
        ),
        key=lambda x: x.get("created_at", x["post"].created_at),
        reverse=True
    )

    paginator = Paginator(feed, 10)

    page_number = request.GET.get("page")

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        try:
            feed = paginator.page(page_number or 1)
        except EmptyPage:
            feed = []

    else:
        feed = paginator.get_page(page_number)

    liked_ids = set(
        Like.objects.filter(user=request.user)
        .values_list('post_id', flat=True)
    )

    reposted_ids = set(
        Repost.objects.filter(user=request.user)
        .values_list('post_id', flat=True)
    )

    bookmarked_ids = set(
        Bookmark.objects.filter(user=request.user)
        .values_list('post_id', flat=True)
    )

    for item in feed:
        post = item["post"]

        post.user_has_liked = post.id in liked_ids
        post.user_has_reposted = post.id in reposted_ids
        post.user_has_bookmarked = post.id in bookmarked_ids

        all_comments = list(
            post.comments.select_related("user")
        )

        comment_map = {comment.id: comment for comment in all_comments}

        for comment in all_comments:
            comment.direct_replies = []

        for comment in all_comments:
            comment.reply_to = (
                comment_map.get(comment.parent_id)
                if comment.parent_id
                else None
            )

            if comment.parent_id:
                parent = comment_map.get(comment.parent_id)

                if parent:
                    parent.direct_replies.append(comment)

        for comment in all_comments:
            comment.direct_replies.sort(
                key=lambda x: x.created_at
            )

        top_comments = [
            comment for comment in all_comments
            if comment.parent_id is None
        ]

        top_comments.sort(
            key=lambda x: x.created_at
        )

        post.top_comments = top_comments

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":

        response = render(
            request,
            "feed.html",
            {"feed": feed},
        )

        if isinstance(feed, list):
            response["X-Has-Next"] = "false"
        else:
            response["X-Has-Next"] = str(
                feed.has_next()
            ).lower()

        return response

    return render(
        request,
        "homepage.html",
        {
            "feed": feed,
            "tab": tab,
        },
    )