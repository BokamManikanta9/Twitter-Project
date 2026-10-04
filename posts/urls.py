from django.urls import path
from . import views
app_name = 'posts'
urlpatterns =[
    path('create/',views.create_post,name = 'create_post'),
    path('like/<int:post_id>/',views.like_post,name = 'like_post'),
    path("repost/<int:post_id>/",views.repost_post,name="repost_post",),
    path('comment/<int:post_id>/',views.comment_post,name = 'comment_post'),
    path('delete/<int:post_id>/',views.delete_post,name= 'delete_post'),
    path("comments/delete/<int:comment_id>/",views.delete_comment,name="delete_comment",),
    path("comments/edit/<int:comment_id>/",views.edit_comment,name="edit_comment",),
    path('bookmark/<int:post_id>/', views.toggle_bookmark, name='toggle_bookmark'),
    path('trending/', views.trending_view, name='trending'),
    path("<int:post_id>/", views.post_detail, name="post_detail"),
    path('bookmarks/', views.bookmarks, name='bookmarks'),
    path('edit/<int:post_id>/', views.edit_post, name='edit_post'),
]