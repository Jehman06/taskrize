from rest_framework import serializers
from lists.models import List

class ListSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()

    class Meta:
        model = List
        fields = ['id', 'title', 'position', 'description', 'created_at', 'updated_at', 'board', 'cards']

    def get_cards(self, obj):
        from cards.serializers import CardSerializer
        cards = obj.cards.all()
        return CardSerializer(cards, many=True).data