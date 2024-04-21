from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from workspaces.models import Workspace
from boards.models import Board
from authentication.models import CustomUser

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

        # Create a test Workspace
        self.workspace = Workspace.objects.create(name='Test Workspace', owner_id=self.user.id)
    
    def test_get_workspaces(self):
        # Create some workspaces
        Workspace.objects.create(name='Workspace 1', owner=self.user)
        Workspace.objects.create(name='Workspace 2', owner=self.user)
        # Send a GET request to retrieve workspaces
        url = reverse('workspace-list')
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response contains the created workspaces
        self.assertEqual(len(response.data), 3)

    def test_create_workspace(self):
        # Send a POST request to create a workspace
        data = {'name': 'New Workspace'}
        url = reverse('workspace-create')
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check that a new workspace is created
        self.assertTrue(Workspace.objects.filter(owner=self.user, name='New Workspace').exists())

    def test_update_workspace(self):
        # Send a POST request to create a workspace
        data = {'name': 'New Workspace'}
        url = reverse('workspace-create')
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Extract the workspace ID from the response
        workspace_id = response.data['id']

        # Send a PUT request to update the workspace
        updated_data = {
            'workspace_id': workspace_id,
            'updated_data': {
                'name': 'Test Workspace'
            }
        }
        update_url = reverse('workspace-update')
        update_response = self.client.put(update_url, updated_data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertTrue(Workspace.objects.filter(id=workspace_id, name='Test Workspace').exists())

    def test_delete_workspace(self):
        # Send a POST request to create a workspace
        data = {'name': 'New Workspace'}
        url = reverse('workspace-create')
        response = self.client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Extract the workspace ID from the response
        workspace_id = response.data['id']
        # Check that the response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Workspace.objects.filter(id=workspace_id, name='New Workspace').exists())

        # Send a DELETE request to delete the workspace
        delete_data = {
            'workspace_id': workspace_id
        }
        delete_url = reverse('workspace-delete')
        delete_response = self.client.delete(delete_url, delete_data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Workspace.objects.filter(id=workspace_id, name='New Workspace').exists())

    # Make sure that the Board is deleted too when deleting the workspace
    def test_delete_board_and_workspace(self):
        # Create a board and a default workspace
        self.assertFalse(Board.objects.filter(creator=self.user).exists())
        create_url = reverse('board-create')
        data = {
            'title': 'Board',
            'default_image': 'mountainLake',
            'workspace': {
                'name': 'Test'
            }
        }
        create_response = self.client.post(create_url, data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        # Get the Board and Workspace id
        workspace_id = create_response.data['workspace']
        board_id = create_response.data['id']

        # Delete the workspace
        delete_url = reverse('workspace-delete')
        delete_data = {
            'workspace_id': workspace_id
        }
        delete_response = self.client.delete(delete_url, delete_data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Workspace.objects.filter(id=workspace_id, name='Test').exists())
        self.assertFalse(Board.objects.filter(id=board_id, title='Board').exists())

    def test_invite_members(self):
        # Create 2 tests users to invite them to the workspace
        user1 = CustomUser.objects.create(email='user1@test.com', password='password123')
        user2 = CustomUser.objects.create(email='user2@test.com', password='password123')

        # Define the data for the request payload
        data = {
            'workspace_id': self.workspace.id,
            'selected_user_ids': [user1.id, user2.id]
        }

        # Make a POST request to invite members
        invite_url = reverse('workspace-invite')
        response = self.client.post(invite_url, data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Invitation sent successfully')