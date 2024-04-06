from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from workspaces.models import Workspace
from authentication.models import CustomUser
from authentication.views import register_user

class WorkspaceAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Make a POST request to register a new user
        register_url = reverse('register')
        user_data = {'email': 'testuser@gmail.com', 'password': 'password', 'password_confirmation': 'password'}
        response = self.client.post(register_url, user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Make a POST request to login and retrieve the access token
        login_url = reverse('login')
        login_data = {'email': 'testuser@gmail.com', 'password': 'password'}
        response = self.client.post(login_url, login_data, format='json')
        self.token = response.json().get('access_token')

        # Retrieve the user object
        self.user = CustomUser.objects.get(email='testuser@gmail.com')

    def test_create_default_workspace(self):
        # Ensure no default workspace exists initially
        self.assertFalse(Workspace.objects.filter(owner=self.user).exists())
        # Make a POST request to create a default workspace
        url = reverse('default-workspace-create')
        response = self.client.post(url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check that a default workspace is created
        self.assertTrue(Workspace.objects.filter(owner=self.user).exists())
    
    def test_get_workspaces(self):
        # Ensure no workspaces exist initially
        self.assertFalse(Workspace.objects.filter(owner=self.user).exists())
        # Create some workspaces
        Workspace.objects.create(name='Workspace 1', owner=self.user)
        Workspace.objects.create(name='Workspace 2', owner=self.user)
        # Send a GET request to retrieve workspaces
        url = reverse('workspace-list')
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response contains the created workspaces
        self.assertEqual(len(response.data), 2)

    def test_create_workspace(self):
        # Ensure no workspaces exist initially
        self.assertFalse(Workspace.objects.filter(owner=self.user).exists())
        # Send a POST request to create a workspace
        data = {'name': 'New Workspace'}
        url = reverse('workspace-create')
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check that a new workspace is created
        self.assertTrue(Workspace.objects.filter(owner=self.user, name='New Workspace').exists())