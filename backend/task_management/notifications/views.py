from rest_framework.decorators import api_view, authentication_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from notifications.models import Notifications
from notifications.serializers import NotificationsSerializer
from authentication.models import CustomUser
from workspaces.models import Workspace

# Send notification
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def send_notification(request):
    # Get the data from the request
    recipient_ids = request.data.get('recipient_ids')
    content = request.data.get('content')
    workspace_id = request.data.get('workspace_id')
    user = request.user

    if not recipient_ids or not isinstance(recipient_ids, list):
        return Response({'error': 'Recipient IDs required'}, status=status.HTTP_400_BAD_REQUEST)

    if not workspace_id:
        return Response({'error': 'Workspace ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get the workspace instance
        workspace = Workspace.objects.get(id=workspace_id)
    except Workspace.DoesNotExist:
        return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)

    notifications = []
    for recipient_id in recipient_ids:
        try:
            # Get the recipient user instance
            recipient = CustomUser.objects.get(id=recipient_id)
        except CustomUser.DoesNotExist:
            continue  # Skip this recipient if not found

        # Create a new notification object
        notification = Notifications(recipient=recipient, content=content, sender=user, workspace=workspace)

        # Save the notification to the database
        notification.save()

        # Add the notification to the list
        notifications.append(notification)

    # Serialize the notification data
    serializer = NotificationsSerializer(notifications, many=True)

    # Return a success response
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# Get notifications
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_notifications(request):
    # Extract the user ID from the authenticated user
    user_id = request.user.id

    try:
        # Query notifications for the user
        notifications = Notifications.objects.filter(recipient_id=user_id)

        # Serialize notifications data
        serializer =  NotificationsSerializer(notifications, many=True)

        # Return serialized notifications as response
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        # Return an error response
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Read notification
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def read_notification(request):
    # Extract the notification ID from the request
    notification_id = request.data.get('notification_id')

    try:
        # Get the Notification instance
        notification = Notifications.objects.get(id=notification_id)

        # Turn the notification from unread to read
        notification.read = True
        notification.save()

        return Response({'message': 'Notification read'}, status=status.HTTP_200_OK)
    except Notifications.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)