from rest_framework import serializers
from .models import Board, Workspace, Image, CustomUser

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=Workspace.objects.all(), read_only=False)
    workspace_name = serializers.SerializerMethodField()
    default_image = serializers.PrimaryKeyRelatedField(queryset=Image.objects.all(), allow_null=True)
    creator = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)

    class Meta:
        model = Board
        fields = '__all__'

    def get_fields(self):
        fields = super().get_fields()
        if self.context.get('include_lists'):
            from lists.serializers import ListSerializer  # lazy import
            fields['lists'] = ListSerializer(many=True, read_only=True)
        return fields

    def get_workspace_name(self, obj):
        return obj.workspace.name if obj.workspace else None

    def create(self, validated_data):
        board = Board.objects.create(**validated_data)
        return board

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        default_image = instance.default_image
        if default_image is not None:
            image_representation = ImageSerializer(default_image).data
            representation['default_image'] = image_representation
        else:
            representation['default_image'] = None
        return representation
    
    def to_internal_value(self, data):
        # Ensure default_image is an integer
        default_image = data.get('default_image')
        if isinstance(default_image, dict) and 'id' in default_image:
            data['default_image'] = default_image['id']
        return super().to_internal_value(data)