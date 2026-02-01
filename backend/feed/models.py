from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation # Add GenericRelation
from django.contrib.contenttypes.models import ContentType

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # ADD THIS LINE:
    likes = GenericRelation('KarmaLedger') 

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # ADD THIS LINE:
    likes = GenericRelation('KarmaLedger')

class KarmaLedger(models.Model):
    # (Keep the rest of your KarmaLedger model exactly the same)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_karma')
    actor = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['actor', 'content_type', 'object_id'], name='unique_like')
        ]
        indexes = [models.Index(fields=['created_at'])]