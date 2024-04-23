from rest_framework import serializers
from .models import Notifications

class NotificationsSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Notifications
        fields = ['id', 'recipient', 'sender', 'workspace', 'notification_type', 'content', 'created_at', 'read']