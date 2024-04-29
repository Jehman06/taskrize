from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
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
    
# Delete list
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
def delete_list(request, list_id):
    try:
        # Retrieve the list instance
        list_instance = List.objects.get(id=list_id)
    except List.DoesNotExist:
        return Response({'error': 'List not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Retrieve the board instance
        board = list_instance.board
        # Retrieve the workspace instance
        workspace = board.workspace

        # Check if the user is the owner of the workspace
        if workspace.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # If the user is authorized, delete the list
        list_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Update list
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_list(request, list_id):
    # Get the updated data from the request
    updated_data = request.data.get('updated_data')

    try:
        # Retrieve the list instance
        list_instance = List.objects.get(id=list_id)
        # Retrieve the workspace instance
        workspace = list_instance.board.workspace

        # Check if the user is the owner of the workspace
        if workspace.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # If the user is authorized, update the list
        for field, value in updated_data.items():
            if hasattr(list_instance, field):
                setattr(list_instance, field, value)

        # Save the updated list
        list_instance.save()
        return Response({'message': 'List updated successfully'}, status=status.HTTP_200_OK)
    except List.DoesNotExist:
        return Response({'error': 'List not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)