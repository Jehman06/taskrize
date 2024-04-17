from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser, UserProfile

# Register User Tests
class APITestRegisterUser(APITestCase):
    def test_register_user(self):
        url = reverse('register')
        data = {'email': 'newuser@example.com', 'password': 'newpassword', 'password_confirmation': 'newpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_user_invalid_password_confirmation(self):
        url = reverse('register')
        data = {'email': 'newuser@example.com', 'password': 'newpassword', 'password_confirmation': 'differentpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# Other Authentication API tests
class APITests(APITestCase):

    def setUp(self):
        self.test_user = CustomUser.objects.create_user(email='test@example.com', password='password123')

    def test_register_user_existing_email(self):
        url = reverse('register')
        data = {'email': 'test@example.com', 'password': 'newpassword', 'password_confirmation': 'newpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_user(self):
        url = reverse('login')
        data = {'email': 'test@example.com', 'password': 'password123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_user_invalid_credentials(self):
        url = reverse('login')
        data = {'email': 'test@example.com', 'password': 'wrongpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reset_password_request(self):
        url = reverse('reset-password-request')
        data = {'email': 'test@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_confirm(self):
        url = reverse('reset-password-confirm', args=[self.test_user.id])
        data = {'new_password': 'newpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_confirm_invalid_user(self):
        url = reverse('reset-password-confirm', args=[999])  # Invalid user ID
        data = {'new_password': 'newpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_logout_user(self):
        url = reverse('logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_profile(self):
        # First, authenticate the user and obtain the access token
        url_login = reverse('login')
        login_data = {'email': 'test@example.com', 'password': 'password123'}
        login_response = self.client.post(url_login, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        # Extract the access token from the response content
        login_content = login_response.json()
        access_token = login_content.get('access_token')

        # Next, make a request to the user profile endpoint using the obtained access token
        url_profile = reverse('user-profile')
        headers = {'Authorization': f'Bearer {access_token}'}
        profile_response = self.client.get(url_profile, headers=headers)
        
        # Retrieve the user profile
        profile = UserProfile.objects.get(user=self.test_user)

        # Assert that the response status code is 200 (OK) indicating a successful request
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        # Check if the email field exists in the UserProfile model
        self.assertTrue(hasattr(profile, 'email'), 'UserProfile model does not have an email field')
        # Verify that the email field is populated with the user's email
        self.assertEqual(profile.email, self.test_user.email, 'Email in UserProfile does not match user email')