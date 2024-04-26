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

class Invitation(models.Model):
    id = models.AutoField(primary_key=True)
    INVITATION_STATUS_CHOICES = {
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    }
    
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_invitations')
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_invitations')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=INVITATION_STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Invitation from {self.sender} to {self.recipient} for {self.workspace}'