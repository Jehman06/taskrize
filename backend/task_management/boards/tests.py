from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from workspaces.models import Workspace
from boards.models import Board
from authentication.models import CustomUser

class BoardAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Register and login a new user
        register_url = reverse('register')
        user_data = {'email': 'testuser@gmail.com', 'password': 'password', 'password_confirmation': 'password'}
        response = self.client.post(register_url, user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        login_url = reverse('login')
        login_data = {'email': 'testuser@gmail.com', 'password': 'password'}
        response = self.client.post(login_url, login_data, format='json')
        self.token = response.json().get('access_token')

        # Retrieve the user object and workspace_id for future tests
        self.user = CustomUser.objects.get(email='testuser@gmail.com')

    def test_create_board_and_workspace(self):
        # Make a POST request to create a board within a specified workspace
        create_board_url = reverse('board-create')
        data = {
            'title': 'New Board',
            'default_image': 'cherryBlossom',
            'workspace': {
                'name': 'Test Workspace'
            }
        }
        response = self.client.post(create_board_url, data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Ensure that the board is created successfully
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check if a workspace with the provided name was created for the user
        self.assertTrue(Workspace.objects.filter(owner=self.user, name='Test Workspace').exists())
        # Check that the board is associated with the created workspace
        created_workspace = Workspace.objects.get(owner=self.user, name='Test Workspace')
        board = Board.objects.get(id=response.data['id'])
        self.assertEqual(board.workspace.id, created_workspace.id)

    def test_create_board_in_existing_workspace(self):
        # Create a new Workspace
        workspace_url = reverse('workspace-create')
        workspace_data = {
            'name': 'Test Workspace',
        }
        workspace_response = self.client.post(workspace_url, workspace_data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(workspace_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Workspace.objects.filter(owner=self.user, name='Test Workspace').exists())
        
        # Extracting the workspace ID from the response
        test_workspace_id = workspace_response.data['id']

        # Create a new board in the new workspace
        board_url = reverse('board-create')
        board_data = {
            'title': 'Test Board in Test Workspace',
            'default_image': 'mountainLake',
            'workspace': {
                'id': test_workspace_id,
            }
        }
        board_response = self.client.post(board_url, board_data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(board_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Board.objects.filter(creator=self.user, title='Test Board in Test Workspace').exists())
        # Check if the board is in the correct workspace
        created_board = Board.objects.get(title='Test Board in Test Workspace')
        self.assertEqual(created_board.workspace.id, test_workspace_id)

        # Create a board in a not existing workspace
        wrong_board_data = {
            'title': 'Wrong workspace',
            'workspace': {
                'id': 9999
            }
        }
        wrong_board_response = self.client.post(board_url, wrong_board_data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(wrong_board_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Board.objects.filter(creator=self.user, title='Wrong workspace').exists())

    def test_toggle_favorite(self):
        # Create a new board
        board_url = reverse('board-create')
        board_data = {
            'title': 'Favorite',
            'default_image': 'cherryBlossom',
            'workspace': {
                'name': 'Test'
            }
        }
        board_response = self.client.post(board_url, board_data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(board_response.status_code, status.HTTP_201_CREATED)
        # Extract the board id from the request
        board_id = board_response.data['id']
        
        # Toggle favorite status to favorite
        favorite_url = reverse('toggle-favorite-board') + f'?board_id={board_id}'
        favorite_response = self.client.post(favorite_url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(favorite_response.status_code, status.HTTP_200_OK)

        # Check if the board is favorited after toggling
        user = CustomUser.objects.get(email='testuser@gmail.com')
        board = Board.objects.get(id=board_id)
        board_favorited = user.board_favorite.filter(id=board_id).exists()
        self.assertTrue(board_favorited)

        # Toggle favorite status back
        favorite_response = self.client.post(favorite_url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(favorite_response.status_code, status.HTTP_200_OK)

        # Check if the board is unfavorited after toggling back
        board_favorited = user.board_favorite.filter(id=board_id).exists()
        self.assertFalse(board_favorited)

    def test_get_boards(self):
        # Ensure no boards exist initially
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

        # Fetch boards for user
        get_url = reverse('board-list')
        get_response = self.client.get(get_url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        # Extract the board data from the response
        boards = get_response.data
        # Check if the user is the creator of each board
        for board in boards:
            # Get the board object from the database
            board_obj = Board.objects.get(id=board['id'])
            # Ensure the user is the creator of the board
            self.assertEqual(board_obj.creator, self.user)

    def test_update_board(self):
        # Create a board
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

        # Extract the board ID from the response
        board_id = create_response.data['id']

        # Update the board
        update_url = reverse('board-update')
        updated_data = {
            'board_id': board_id,
            'updated_data': {
                'title': 'Test Board'
            }
        }
        update_response = self.client.put(update_url, updated_data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertTrue(Board.objects.filter(id=board_id, title='Test Board').exists())

    def test_delete_board(self):
        # Create a board
        self.assertFalse(Board.objects.filter(creator=self.user).exists())
        create_url = reverse('board-create')
        data = {
            'title': 'Board',
            'default_image': 'cherryBlossom',
            'workspace': {
                'name': 'Test'
            }
        }
        create_response = self.client.post(create_url, data, format='json', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        # Extract the board ID from the response
        board_id = create_response.data['id']
        # Delete the board
        delete_url = reverse('board-delete')
        delete_data = {'board_id': board_id}
        delete_response = self.client.delete(delete_url, delete_data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Board.objects.filter(id=board_id, title='Board').exists())