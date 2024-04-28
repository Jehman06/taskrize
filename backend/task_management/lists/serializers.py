from rest_framework import serializers
from lists.models import List

class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = ['id', 'title', 'position', 'description', 'created_at', 'updated_at', 'board']