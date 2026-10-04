from django.db import models
from django.conf import settings
from cloudinary_storage.validators import validate_video
from .storage import ImageStorage, VideoStorage
class Post(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    trending_score = models.FloatField(default=0, db_index=True)
    content = models.TextField(max_length=500)
    hashtags = models.JSONField(default=list, blank=True)
    image = models.ImageField( upload_to="", storage=ImageStorage(), blank=True, null=True ) 
    video = models.FileField( upload_to="", storage=VideoStorage(), blank=True, null=True, validators=[validate_video] )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"
    
class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,
    related_name = 'likes')
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user','post')

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='comments')
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name='comments')
    text = models.TextField(max_length=400)
    parent = models.ForeignKey('self',null=True,blank=True,on_delete=models.CASCADE,related_name = 'replies')
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:20]

class Repost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="reposts")
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name="reposts"
)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        return f"{self.user.username} reposted {self.post.id}"
    
class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')