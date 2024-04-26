from rest_framework import serializers
from .models import Notifications
from authentication.models import UserProfile

class NotificationsSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(read_only=True)
    workspace_name = serializers.SerializerMethodField()

    class Meta:
        model = Notifications
        fields = ['id', 'recipient', 'workspace', 'workspace_name', 'notification_type', 'content', 'created_at', 'read', 'invitation']

    def get_workspace_name(self, obj):
        """
        Custom serializer method to get the workspace name.
        """
        if obj.workspace:
            return obj.workspace.name
        return None
    
    def get_sender_name(self, obj):
        if obj.sender:
            user_profile = obj.sender.userprofile
            if user_profile:
                name = user_profile.name
                if name:
                    return name
            return obj.sender.email