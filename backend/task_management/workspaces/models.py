from django.db import models
from authentication.models import CustomUser

class Workspace(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='owned_workspaces')
    members = models.ManyToManyField(CustomUser, related_name='member_of_workspace', blank=True)

    def __str__(self):
        return self.name