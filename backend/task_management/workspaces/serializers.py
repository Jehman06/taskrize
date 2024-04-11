from rest_framework import serializers
from .models import Workspace

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'description', 'owner', 'members']

    def create(self, validated_data):
        # Extract and remove members data from validated data
        members_data = validated_data.pop('members', [])
        # Create workspace instance
        workspace = Workspace.objects.create(**validated_data)
        # Set members for the workspace
        for member_data in members_data:
            workspace.members.add(member_data)
        return workspace