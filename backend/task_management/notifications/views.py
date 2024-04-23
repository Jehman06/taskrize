from rest_framework.decorators import api_view, authentication_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from notifications.models import Notifications
from notifications.serializers import NotificationsSerializer
from authentication.models import CustomUser

# Send notification
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def send_notification(request):
    # Extract the data from the request payload
    recipient = request.data.get('recipient_id')
    content = request.data.get('content')

    try:
        # Get the recipient user instance
        recipient = CustomUser.objects.get(id=recipient)

        # Create a new notification object
        notification = Notifications(recipient=recipient, content=content)

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