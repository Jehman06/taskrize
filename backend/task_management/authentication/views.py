from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
import secrets
from .models import CustomUser

# Signup function
@api_view(['POST'])
def register_user(request):
    # Extract email, password and password_confirmation from the request
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
    # Extract the email and password from the request
    email = request.data.get('email')
    password = request.data.get('password')

    # Authenticate the user
    user = authenticate(request, email=email, password=password)

    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Extract user ID
        user_id = user.id

        # Set tokens as HTTP-only cookies
        response = JsonResponse({'user_id': user_id, 'access_token': access_token, 'refresh_token': str(refresh)})

        # Set the content-type explicitly
        response['Content-Type'] = 'application/json'
        
        # Set tokens as cookies in the response
        response.set_cookie(key='access_token', value=access_token, httponly=False, samesite='None', secure=True)
        response.set_cookie(key='refresh_token', value=str(refresh), httponly=False, samesite='None', secure=True)
        
        # Set CORS headers
        response["Access-Control-Allow-Origin"] = "http://127.0.0.1:3000"
        response["Access-Control-Allow-Credentials"] = "true"

        return response
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Forgot Password function  
@api_view(['POST'])
def reset_password_request(request):
    # Extract the email and user from the request
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
@authentication_classes([JWTAuthentication])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)