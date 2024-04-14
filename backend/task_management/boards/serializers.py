from rest_framework import serializers
from .models import Board, Workspace

class BoardSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all(), read_only=False)
    workspace_name = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'favorite', 'custom_image', 'default_image', 'workspace', 'workspace_name']

    def get_workspace_name(self, obj):
        return obj.workspace.name if obj.workspace else None

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)