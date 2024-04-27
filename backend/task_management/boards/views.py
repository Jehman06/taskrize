from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.contrib.auth import get_user_model
from workspaces.models import Workspace
from boards.models import Board
from .serializers import BoardSerializer

# Get all the boards of a user
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_boards(request):
    # Access the authenticated user
    user = request.user
    # Get workspaces where the user is a member or an owner
    workspaces = Workspace.objects.filter(Q(owner=user) | Q(members=user))
    # Query the database for relevant boards
    # Include boards where the user is the creator or the workspace is in the user's workspaces
    boards = Board.objects.filter(Q(creator=user) | Q(workspace__in=workspaces))
    # Serialize the list of boards into JSON format, allowing multiple instances
    serializer = BoardSerializer(boards, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get a single board
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_board(request, board_id):
    # Access the authenticated user
    user = request.user
    
    try:
        # Query the database for the board
        board = Board.objects.get(id=board_id)
    except Board.DoesNotExist:
        return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Serialize the board into a JSON format
    serializer = BoardSerializer(board)
    return Response(serializer.data, status=status.HTTP_200_OK)

def create_default_workspace_for_user(user):
    # Check if a default workspace already exists for the user
    default_workspace = Workspace.objects.filter(owner=user).first()
    if default_workspace:
        return default_workspace

    # If no default workspace exists, create a new one
    default_workspace = Workspace.objects.create(name='My First Workspace', owner=user)
    default_workspace.members.add(user)
    return default_workspace

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_board(request):
    # Access the authenticated user
    user = request.user
    
    # Extract the data from the request payload
    data = request.data.copy()  # Create a mutable copy of the data dictionary)

    workspace_data = data.get('workspace', {})

    if not isinstance(workspace_data, dict):
        return Response({'error': 'Workspace data must be a dictionary'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Ensure the workspace ID or name is provided in the request data
    workspace_id = workspace_data.get('id')
    workspace_name = workspace_data.get('name')
    
    if not workspace_id:
        if not workspace_name:
            # Return an error response indicating that a workspace name is required
            return Response({'error': 'Workspace name is required'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create a new workspace with the provided name for the user
            workspace = Workspace.objects.create(name=workspace_name, owner=user)
            workspace.members.add(user)
            # Update the workspace_id with the newly created workspace's ID
            workspace_id = workspace.id
    else:
        try:
            # Check if the specified workspace exists
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response({'error': 'Specified workspace does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if the authenticated user is a member of the workspace
        if user not in workspace.members.all():
            return Response({'error': 'User does not have access to the specified workspace'}, status=status.HTTP_403_FORBIDDEN)

    # Prepare the data for board creation
    board_data = request.data.copy()

    # Check if either custom_image or default_image is provided
    if not board_data.get('custom_image') and not board_data.get('default_image'):
        return Response({'error': 'Either custom_image or default_image must be provided'}, status=status.HTTP_400_BAD_REQUEST)

    board_data['workspace'] = workspace_id  # Associate the workspace with the board
    
    # Create a serializer instance with the prepared data and pass the request context
    serializer = BoardSerializer(data=board_data, context={'request': request})
    
    # Validate the serializer data
    if serializer.is_valid():
        # Save the board instance to the database
        board = serializer.save(creator=user)
        # Return the serialized board data in the response
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        # If the serializer data is invalid, return the validation errors in the response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update board
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_board(request):
    # Retrieve the data from the request
    board_id = request.data.get('board_id')
    updated_data = request.data.get('updated_data', {})

    # Check if the board is provided
    if not board_id:
        return Response({'error': 'Board ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Retrieve the board object
        board = Board.objects.get(id=board_id)
        # Update board fields with new data
        for key, value in updated_data.items():
            setattr(board, key, value)
        # Save updated board
        board.save()
        # Serialize and return the updated board
        serializer = BoardSerializer(board)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Board.DoesNotExist:
        return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)

# Add board to favorites
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def toggle_favorite_board(request):
    # Retrieve the board ID from the query parameters
    board_id = request.query_params.get('board_id')

    print(f'board_id: {board_id}')

    if not board_id:
        return Response({'error': 'Board ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Retrieve the board instance
        board = Board.objects.get(id=board_id)
        
        # Toggle the favorite status for the current user
        if board.favorite.filter(id=request.user.id).exists():
            # If the board is in favorites, remove it
            board.favorite.remove(request.user)
            action = 'removed from'
        else:
            # If the board is not in favorites, add it
            board.favorite.add(request.user)
            action = 'added to'
        
        return Response({'message': f'Board {action} favorites successfully'}, status=status.HTTP_200_OK)
    except Board.DoesNotExist:
        return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)
    
# Delete board
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
def delete_board(request):
    # Retrieve the user from the request
    user = request.user
    # Retrieve the board ID from the request
    board_id = request.data.get('board_id')
    # Check if the board is provided
    if not board_id:
        return Response({'error': 'Board ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Retrieve the board object
        board = Board.objects.get(id=board_id)
        # Retrieve the Workspace object in which the board is
        workspace = board.workspace

        if user != workspace.owner:
            return Response({'error': 'Only workspace owners can delete boards'}, status=status.HTTP_403_FORBIDDEN)
        # Delete the board from the database
        board.delete()
        return Response({'message': 'Board deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Board.DoesNotExist:
        return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)