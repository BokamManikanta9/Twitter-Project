from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True)
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True)
    banner_pic = models.ImageField(upload_to='banner/', blank=True,null=True)
    dob = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', blank=True)

    VERIFICATION_STATUS = [
        ('none', 'None'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    verification_status = models.CharField(
        max_length=10,
        choices=VERIFICATION_STATUS,
        default='none'
    )

class VerificationRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.status == "approved":
            self.user.verification_status = "approved"
            self.user.save()

        elif self.status == "rejected":
            self.user.verification_status = "rejected"
            self.user.save()