from rest_framework import serializers
from .models import CustomUser, UserProfile

class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = CustomUser
        fields = ['email']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'name', 'nickname', 'bio']

    def update(self, instance, validated_data):
        # Update only the fields provided in the validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Save the instance to update the database
        instance.save()

        return instance