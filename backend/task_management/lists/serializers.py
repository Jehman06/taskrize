from rest_framework import serializers
from lists.models import List

class ListSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S")
    updated_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S")

    class Meta:
        model = List
        fields = ['id', 'title', 'position', 'description', 'created_at', 'updated_at', 'board', 'cards']

    def get_cards(self, obj):
        from cards.serializers import CardSerializer
        cards = obj.cards.all()
        return CardSerializer(cards, many=True).data