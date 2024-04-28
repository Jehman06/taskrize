from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from boards.models import Board
from lists.models import List
from .serializers import ListSerializer

# Create list
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_list(request):
    # Get the board ID from the request
    board_id = request.data.get('board_id')
    if not board_id:
        return Response({'error': 'Board ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the board instance
        board = Board.objects.get(id=board_id)
    except Board.DoesNotExist:
        return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)
    
    list_name = request.data.get('list_name')
    if not list_name:
        return Response({'error': 'List name required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Determine the position of the new list
        position = List.objects.filter(board=board).count() + 1

        # Create a new list in the corresponding board
        list_instance = List.objects.create(board=board, title=list_name, position=position)
        serializer = ListSerializer(list_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)