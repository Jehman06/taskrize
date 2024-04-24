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
    user = request.user
    # Extract the data from the request payload
    recipient_id = request.data.get('recipient_id')
    content = request.data.get('content')
    workspace_id = request.data.get('workspace_id')

    try:
        if not recipient_id:
            return Response({'error': 'Recipient ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the recipient user instance
            recipient = CustomUser.objects.get(id=recipient_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)

        if not workspace_id:
            return Response({'error': 'Workspace ID required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the workspace instance
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create a new notification object
        notification = Notifications(recipient=recipient, content=content, sender=user, workspace=workspace)

        # Save the notification to the database
        notification.save()

        # Serialize the notification data
        serializer = NotificationsSerializer(notification)

        # Return a success response
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Return error response
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    # Extract the user ID from the authenticated user
    user_id = request.user.id
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