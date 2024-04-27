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
from authentication.models import UserProfile
from notifications.models import Notifications

# Get the workspaces for the user
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_workspaces(request):
    # Access the authenticated user
    user = request.user
    # Query the database for relevant workspaces
    # Include workspaces where the user is the owner or a member
    owned_workspaces = Workspace.objects.filter(owner=user)
    member_workspaces = Workspace.objects.filter(members=user)
    # Combine the querysets into a single list of unique workspaces
    workspaces = owned_workspaces | member_workspaces
    # Serialize the list of workspaces into JSON format, allowing multiple instances
    serializer = WorkspaceSerializer(workspaces.distinct(), many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get boards associated with a workspace
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_workspace_boards(request, workspace_id):
    # Retrieve the workspace instance from the database using the provided workspace_id
    workspace = get_object_or_404(Workspace, id=workspace_id)

    # Check if the user is an owner or a member of the workspace
    if request.user != workspace.owner and request.user not in workspace.members.all():
        return Response({'error': 'You do not have permission to view this workspace'}, status=status.HTTP_403_FORBIDDEN)

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
                return Response({'error': f'Field "{key}" does not exist in Workspace model'}, status=status.HTTP_400_BAD_REQUEST)

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
    user = request.user
    # Retrieve the workspace ID from the request
    workspace_id = request.data.get('workspace_id')
    if not workspace_id:
        return Response({'error': 'Workspace ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        workspace = Workspace.objects.get(id=workspace_id)
        print(f'workspace.owner = {workspace.owner}')
        # Check whether the user is the workspace's owner
        if user != workspace.owner:
            return Response({'error': 'You are not authorized to delete the workspace'}, status=status.HTTP_403_FORBIDDEN)
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

    if not workspace_id:
        return Response({'error': 'Workspace ID required'}, status=status.HTTP_400_BAD_REQUEST)
    if not selected_user_ids:
        return Response({'error': 'At least 1 selected user ID required'}, status=status.HTTP_400_BAD_REQUEST)

    
    # Get the sender (authenticated user) from the request
    sender = request.user
    try:
        # Get their name from UserProfile
        profile = UserProfile.objects.get(email=sender.email)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User Profile not found'}, status=status.HTTP404_NOT_FOUND)

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
            try:
                # Get the recipient (user being invited) based on the ID
                recipient = get_user_model().objects.get(id=user_id)
            except Exception as e:
                return Response({'error': f'User with {user_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if an invitation already exists for the same sender, recipient, and workspace
            existing_invitation = Invitation.objects.filter(sender=sender, recipient=recipient, workspace=workspace, status='pending').first()
            if existing_invitation:
                # If an invitation already exists and is pending, skip creating a new one
                continue
            
            # Create an Invitation object with sender, recipient and workspace
            invitation = Invitation(sender=sender, recipient=recipient, workspace=workspace, status='pending')
            # Add the invitation to the list
            invitations.append(invitation)
            try:
                # Bulk create all invitations in the list and return the response
                Invitation.objects.bulk_create(invitations)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                # Create a Notification object for the recipient
                notification = Notifications(
                    notification_type='invitation',
                    recipient=recipient,
                    content = f"{(profile.name + ' (' + profile.nickname + ')' if profile.nickname else profile.name) if profile.name else profile.email} has invited you to their workspace {workspace.name}.",
                    workspace_id=workspace_id,
                    invitation_id=invitation.id
                )
                notification.save()
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': 'Invitation sent successfully'}, status=status.HTTP_200_OK)
    except Workspace.DoesNotExist:
        return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def accept_invitation(request):
    # Extract the invitation ID from the request payload
    invitation_id = request.data.get('invitation_id')
    notification_id = request.data.get('notification_id')

    try:
        # Retrieve the invitation object from the database
        invitation = Invitation.objects.get(id=invitation_id)

        # Ensure that the authenticated user is the recipient of the invitation
        if invitation.recipient != request.user:
            return Response({'error': 'You are not authorized to accept this invitation'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update the invitation status to 'accepted'
        invitation.status = 'accepted'
        invitation.save()

        # Add the recipient user to the workspace
        print(invitation.workspace)
        invitation.workspace.members.add(request.user)
        print(invitation.workspace)

        try:
            notification = Notifications.objects.get(id=notification_id)       
            # Set the 'read' field of the notification to True
            notification.read = True
            notification.save()
        except Notifications.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'message': 'Invitation accepted successfully'}, status=status.HTTP_200_OK)
    except Invitation.DoesNotExist:
        return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def reject_invitation(request):
    # Extract the invitation ID from the request
    invitation_id = request.data.get('invitation_id')
    notification_id = request.data.get('notification_id')

    try:
        # Retrieve the invitation from the database
        invitation = Invitation.objects.get(id=invitation_id)

        # Ensure that the authenticated user is the recipient of the invitation
        if invitation.recipient != request.user:
            return Response({'error': 'You are not authorized to refuse this invitation'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update the invitation status to 'rejected'
        invitation.status = 'rejected'
        invitation.delete()

        try:
            notification = Notifications.objects.get(id=notification_id)       
            # Set the 'read' field of the notification to True
            notification.read = True
            notification.save()
        except Notifications.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'message': 'Invitation rejected successfully'}, status=status.HTTP_200_OK)
    except Invitation.DoesNotExist:
        return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)