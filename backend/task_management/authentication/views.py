from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
import secrets
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser

# Signup function
@api_view(['POST'])
def register_user(request):
    """
    Registers a new user.

    Checks if the provided password matches the confirmation.
    Verifies if the email is not already in use.
    Creates a new user with the provided email and password.

    Args:
        request: HTTP request containing user data (email, password, password_confirmation).

    Returns:
        HTTP response with a success message if the user is created successfully,
        otherwise returns an error response.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    password_confirmation = request.data.get('password_confirmation')

    if password != password_confirmation:
        raise ValidationError({'error': 'Passwords do not match'})
    
    if not email or not password:
        return Response({'error': 'Please provide email and password'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if the email is already in use
    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create the user
    CustomUser.objects.create_user(email=email, password=password)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

# Login function
@api_view(['POST'])
def login_user(request):
    """
    Logs in a user.

    Authenticates the user with provided email and password.
    If authentication is successful, creates a session for the user.

    Args:
        request: HTTP request containing user credentials (email, password).

    Returns:
        HTTP response with user data and a success message if login is successful,
        otherwise returns an error response.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)

    if user is not None:
        # Log the user in
        login(request, user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({'email': email, 'refresh': str(refresh), 'access': str(refresh.access_token), 'message': 'Login successful'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Forgot Password function  
@api_view(['POST'])
def reset_password_request(request):
    """
    Initiates the process of resetting the user's password.

    Generates a reset code and sends it to the user's email address.
    Stores the reset code along with the user for verification.

    Args:
        request: HTTP request containing user email.

    Returns:
        HTTP response with user ID, reset code, and a success message if email is sent successfully,
        otherwise returns an error response.
    """
    email = request.data.get('email')
    user = CustomUser.objects.filter(email=email).first()
    if user:
        # Generate a random code
        reset_code = secrets.token_hex(5)
        # Save the code along with the user in the database
        user.reset_code = reset_code
        user.save()
        # Send an email with the reset code
        send_mail(
            'Reset your password',
            f'Your reset code is: {reset_code}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return Response({'user_id': user.id, 'reset_code': reset_code, 'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'User with the provided email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

# Reset Password function
@api_view(['POST'])
def reset_password_confirm(request, user_id, reset_code=None):
    """
    Resets the user's password using the provided reset code.

    Verifies the reset code and updates the user's password.

    Args:
        request: HTTP request containing user ID and new password.
        user_id: ID of the user whose password needs to be reset.
        reset_code: Optional reset code for verification.

    Returns:
        HTTP response with a success message if password is reset successfully,
        otherwise returns an error response.
    """
    try:
        if reset_code is not None:
            # Check if the reset_code matches the one stored in the database
            user = CustomUser.objects.get(pk=user_id, reset_code=reset_code)
        else:
            # If reset_code is None, just retrieve the user by user_id
            user = CustomUser.objects.get(pk=user_id)

        # Reset code is valid, allow the user to reset their password
        new_password = request.data.get('new_password')
        user.set_password(new_password)
        user.reset_code = None  # Clear the reset code after using it
        user.save()
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found or invalid reset code.'}, status=status.HTTP_404_NOT_FOUND)

# Logout function
@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)