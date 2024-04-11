from rest_framework import serializers
from .models import Board, Workspace

class BoardSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all(), read_only=False)

    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'favorite', 'custom_image', 'default_image', 'workspace']

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)