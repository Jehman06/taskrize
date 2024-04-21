from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from workspaces.models import Workspace, Invitation
from boards.models import Board
from workspaces.serializers import WorkspaceSerializer
from authentication.serializers import UserSerializer

# Get the workspaces for the user
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_workspaces(request):
    # Access the authenticated user
    user = request.user
    # Query the database for relevant workspaces
    # Include workspaces where the user is the owner or a member
    workspaces = Workspace.objects.filter(Q(owner=user) | Q(members=user))
    # Serialize the list of workspaces into JSON format, allowing multiple instances
    serializer = WorkspaceSerializer(workspaces, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get boards associated with a workspace
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_workspace_boards(request, workspace_id):
    # Retrieve the workspace instance from the database using the provided workspace_id
    workspace = get_object_or_404(Workspace, id=workspace_id)

    # Retrieve all boards associated with the workspace
    boards = Board.objects.filter(workspace=workspace)

    # Serialize the list of boards into JSON format
    board_data = [{'id': board.id, 'title': board.title, 'description': board.description, 'default_image': board.default_image, 'favorite': list(board.favorite.values_list('id', flat=True))} for board in boards]

    # Return the serialized board data as a JSON response
    return Response(board_data, status=status.HTTP_200_OK)

# Create a new workspace
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_workspace(request):
    # Access the authenticated user
    user = request.user
    # Extract the data from the request payload
    data = request.data.copy()  # Create a mutable copy of the data dictionary
    # Extract owner's id
    owner_id = user.id
    # Add the owner's id to the data dictionary
    data['owner'] = owner_id
    # Validate the data using the WorkspaceSerializer
    serializer = WorkspaceSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        # Create a new workspace instance associated with the user
        workspace = serializer.save()
        # Since members is a many-to-many field, set the owner as the initial member
        workspace.members.set([user])
        return Response(WorkspaceSerializer(workspace).data, status=status.HTTP_201_CREATED)
    else:
        print("Validation errors:", serializer.errors)  # Print validation errors for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_workspace(request):
    # Retrieve the data from the request
    workspace_id = request.data.get('workspace_id')
    updated_data = request.data.get('updated_data', {})
    
    # Check if workspace_id is provided
    if not workspace_id:
        return Response({'error': 'Workspace ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        workspace = Workspace.objects.get(id=workspace_id)
        
        # Update individual fields if provided
        for key, value in updated_data.items():
            if hasattr(workspace, key):
                setattr(workspace, key, value)
            else:
                return Response({'error': f'Field "{key}" does not exist in Workspace model'}, 
                                status=status.HTTP_400_BAD_REQUEST)

        # Save the updated workspace
        workspace.save()

        # Serialize and update the workspace
        serializer = WorkspaceSerializer(workspace)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Workspace.DoesNotExist:
        return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)
    
# Delete workspace
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
def delete_workspace(request):
    # Retrieve the workspace ID from the request
    workspace_id = request.data.get('workspace_id')
    if not workspace_id:
        return Response({'error': 'Workspace ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        workspace = Workspace.objects.get(id=workspace_id)
        # Delete the workspace
        workspace.delete()
        return Response({'message': 'Workspace deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Workspace.DoesNotExist:
        return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)

# Invite members to workspace
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def invite_members(request):
    # Get the data from the request payload
    data = request.data

    # Extract the workspace and user IDs from the data
    workspace_id = data.get('workspace_id')
    selected_user_ids = data.get('selected_user_ids', [])

    # Get the sender (authenticated user) from the request
    sender = request.user

    try:
        # Get the workspace based on the provided ID
        workspace = Workspace.objects.get(id=workspace_id)

        # Check if the sender is the owner of the workspace
        if sender != workspace.owner:
            return Response({'error': 'Only the workspace owner can invite members'}, status=status.HTTP_403_FORBIDDEN)

        # Create a list to hold the invitation objects
        invitations = []

        # Iterate over the selected user IDs
        for user_id in selected_user_ids:
            # Get the recipient (user being invited) based on the ID
            recipient = get_user_model().objects.get(id=user_id)

            # Create an Invitation object with sender, recipient and workspace
            invitation = Invitation(sender=sender, recipient=recipient, workspace=workspace)

            # Add the invitation to the list
            invitations.append(invitation)

        # Bulk create all invitations in the list and return the response
        Invitation.objects.bulk_create(invitations)
        return Response({'message': 'Invitation sent successfully'}, status=status.HTTP_200_OK)
    except Workspace.DoesNotExist:
        return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)