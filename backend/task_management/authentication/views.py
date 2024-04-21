from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import NotFound, APIException
import secrets
from authentication.models import CustomUser, UserProfile
from authentication.serializers import UserProfileSerializer

# Signup function
@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    password_confirmation = request.data.get('password_confirmation')

    if not email or not password or not password_confirmation:
        return Response({'error': 'Please provide email, password, and password_confirmation'}, status=status.HTTP_400_BAD_REQUEST)
    
    if password != password_confirmation:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    
    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
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
    
# Update user password
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_user_password(request):
    try:
        # Extract the email and user from the request
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return JsonResponse({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate the user
        user = authenticate(request, email=email, password=password)

        # Check if authentication is successful
        if user is not None:
            # Proceed with the password change operation
            updated_password = request.data.get('updated_password')

            # Check if the updated password is provided
            if not updated_password:
                return JsonResponse({'error': 'New password required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Retrieve the corresponding CustomUser instance
            custom_user = CustomUser.objects.get(email=email)
            
            # Update the user's password
            custom_user.set_password(updated_password)
            custom_user.save()
            return JsonResponse({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
        else:
            # Invalid credentials
            return JsonResponse({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Change email function
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_user_email(request):
    try:
        # Get user credentials from request
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if email and password are provided
        if not email or not password:
            return JsonResponse({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        # Check if authentication is successful
        if user is not None:
            # Proceed with email change operation
            updated_email = request.data.get('updated_email')

            # Check if the updated email address is provided
            if not updated_email:
                return JsonResponse({'error': 'New email address required'}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve the corresponding CustomUser instance
            custom_user = CustomUser.objects.get(email=email)

            # Check if the provided email is unique
            if CustomUser.objects.exclude(pk=user.pk).filter(email=updated_email).exists():
                return JsonResponse({'error': 'This email address is already in use.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update the user's email address
            custom_user.email = updated_email
            custom_user.save()

            return JsonResponse({'message': 'Email address updated successfully'}, status=status.HTTP_200_OK)
        else:
            # Invalid credentials
            return JsonResponse({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_profile(request):
    try:
        # Retrieve the UserProfile instance
        profile = get_object_or_404(UserProfile, user=request.user)

        # Serialize the profile data
        serializer = UserProfileSerializer(profile)

        # Construct the response
        profile_data = serializer.data
        profile_data['id'] = profile.id
        return Response(profile_data)
    except ObjectDoesNotExist:
        raise NotFound('User profile not found')
    except Exception as e:
        raise APIException(str(e))

# Update the user profile
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
def update_profile(request, pk):
    try:
        # Access the authenticated user
        user = request.user

        # Retrieve the data from the request
        updated_data = request.data

        # Retrieve the user profile associated with the authenticated user
        profile = get_object_or_404(UserProfile, user=user)

        # Update the profile with the new data
        for key, value in updated_data.items():
            setattr(profile, key, value)
        profile.save()

        # Serialize and return the updated profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

# Logout function
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
def delete_account(request):
    if request.method == 'DELETE':
        # Retrieve the user's email and password from the request
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate the user using the provided credentials
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # User is authenticated, proceed with deleting the account
            user.delete()
            return JsonResponse({'message': 'Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        else:
            # Authentication failed, return error response
            return JsonResponse({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)