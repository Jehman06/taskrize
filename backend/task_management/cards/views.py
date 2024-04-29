from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from boards.models import Board
from lists.models import List
from .serializers import CardSerializer

# Create a new card
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_card(request):
    # Get the list ID and card name from the request
    list_id = request.data.get('list_id')
    card_title = request.data.get('card_title')
    if not list_id:
        return Response({'error': 'List ID required'}, status=status.HTTP_400_BAD_REQUEST)
    if not card_title:
        return Response({'error': 'Card title required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Retrieve the list instance
        list_instance = List.objects.get(id=list_id)
    except List.DoesNotExist:
        return Response({'error': 'List not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Determine the position of the new card
        position = list_instance.cards.count() + 1
        
        # Create a new card in the corresponding list
        card_instance = list_instance.cards.create(title=card_title, position=position)
        serializer = CardSerializer(card_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)