from django.db import models
from authentication.models import CustomUser
from workspaces.models import Workspace, Invitation

class Notifications(models.Model):
    # Define choices for notification types
    NOTIFICATION_TYPES = [
        ('invitation', 'Invitation to Workspace'),
    ]

    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications_received')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications_sent', null=True, blank=True)
    invitation = models.ForeignKey(Invitation, on_delete=models.CASCADE, null=True, blank=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    content = models.TextField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.recipient.email} - {self.notification_type}'