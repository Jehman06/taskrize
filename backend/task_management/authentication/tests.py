from django.urls import reverse
from django.test import Client
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

    def test_update_user_profile(self):
        # Authenticate the user
        login_url = reverse('login')
        login_data = {'email': 'test@example.com', 'password': 'password123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        login_content = login_response.json()
        access_token = login_content.get('access_token')

        # Set authentication headers
        headers = {'Authorization': f'Bearer {access_token}'}

        # Retrieve the user profile
        profile_url = reverse('user-profile-get')
        profile_response = self.client.get(profile_url, headers=headers, format='json')

        # Assert the status code
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)

        profile_data = profile_response.json()

        # Get the user profile ID
        profile_id = profile_data['id']

        # Make a PUT request to update the user profile
        update_profile_url = reverse('user-profile-update', kwargs={'pk': profile_id})
        update_data = {
            'name': 'New name',
            'nickname': 'New Nickname',
            'bio': 'New Bio'
        }
        update_profile_response = self.client.put(update_profile_url, update_data, headers=headers, format='json')

        # Check that the update was successful
        self.assertEqual(update_profile_response.status_code, status.HTTP_200_OK)

        # Retrieve the updated profile from the database
        updated_profile = UserProfile.objects.get(pk=profile_id)

        # Check if all fields have been updated
        self.assertEqual(updated_profile.name, update_data['name'])
        self.assertEqual(updated_profile.nickname, update_data['nickname'])
        self.assertEqual(updated_profile.bio, update_data['bio'])

    def test_update_email(self):
        # Create an account to test if email is already in use
        sign_up_url = reverse('register')
        sign_up_data = {'email': 'hello@world.com', 'password': 'helloworld', 'password_confirmation': 'helloworld'}
        sign_up_response = self.client.post(sign_up_url, sign_up_data, format='json')
        self.assertEqual(sign_up_response.status_code, status.HTTP_201_CREATED)
        
        # Log in user that will update their email
        login_url = reverse('login')
        login_data = {'email': 'test@example.com', 'password': 'password123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        login_content = login_response.json()
        access_token = login_content.get('access_token')

        self.assertTrue(CustomUser.objects.filter(email='test@example.com').exists())

        # Change user's email to a unique email address using PUT request
        update_email_url = reverse('email-update')
        headers = {'Authorization': f'Bearer {access_token}'}
        unique_email_update_data = {'email': 'test@example.com', 'password': 'password123', 'updated_email': 'world@hello.com'}
        unique_email_update_response = self.client.put(update_email_url, unique_email_update_data, headers=headers, format='json')

        self.assertEqual(unique_email_update_response.status_code, status.HTTP_200_OK)

        # Verify that the updated email address exists and the old one does not
        self.assertTrue(CustomUser.objects.filter(email='world@hello.com').exists())
        self.assertFalse(CustomUser.objects.filter(email='test@example.com').exists())

    def test_update_password(self):
        # Log the user in
        login_url = reverse('login')
        login_data = {'email': 'test@example.com', 'password': 'password123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        login_content = login_response.json()
        access_token = login_content.get('access_token')

        # Update the password
        update_password_url = reverse('password-update')
        update_password_data = {'email': 'test@example.com', 'password': 'password123', 'updated_password': '123password'}
        headers = {'Authorization': f'Bearer {access_token}'}
        update_password_response = self.client.put(update_password_url, update_password_data, headers=headers, format='json')
        self.assertEqual(update_password_response.status_code, status.HTTP_200_OK)
        updated_user = CustomUser.objects.get(email='test@example.com')
        self.assertTrue(updated_user.check_password('123password'))
        
        # Log the user out to make sure they can log back in with their updated password
        logout_url = reverse('logout')
        logout_response = self.client.post(logout_url, headers=headers, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        # Log the user back in
        updated_login_data = {'email': 'test@example.com', 'password': '123password'}
        updated_login_response = self.client.post(login_url, updated_login_data, format='json')
        self.assertEqual(updated_login_response.status_code, status.HTTP_200_OK)

    def test_delete_account(self):
        # Login the user
        login_url = reverse('login')
        login_data = login_data = {'email': 'test@example.com', 'password': 'password123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        login_content = login_response.json()
        access_token = login_content.get('access_token')

        # Delete the account with wrong credentials
        delete_url = reverse('account-delete')
        unsuccessful_delete_data = {'email': 'example@test.com', 'password': 'wrongpassword'}
        # Set authentication headers
        headers = {'Authorization': f'Bearer {access_token}'}
        unsuccessful_delete_response = self.client.delete(delete_url, unsuccessful_delete_data, headers=headers, format='json')
        self.assertEqual(unsuccessful_delete_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Delete account with the right credentials
        successful_delete_data = {'email': 'test@example.com', 'password': 'password123'}
        successful_delete_response = self.client.delete(delete_url, successful_delete_data, headers=headers, format='json')
        self.assertEqual(successful_delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CustomUser.objects.filter(email='test@example.com').exists())