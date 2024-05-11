from boards.models import Board
from authentication.models import CustomUser
from lists.models import List
from lists.serializers import ListSerializer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
from channels.db import database_sync_to_async
from django.db import transaction
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
import datetime
import json
from cards.views import DateTimeEncoder

class DateTimeEncoder(DjangoJSONEncoder):
    def default(set, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)

# Websocket consumer for handling list operations
class ListConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, dispatcher):
        self.dispatcher = dispatcher

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, content):
        action = content.get('action')
        if action == 'create_list':
            await self.create_list(content)
        elif action == 'delete_list':
            await self.handle_delete_list(content)
        elif action == 'update_list':
            await self.update_list(content)
        elif action == 'list_moved':
            await self.list_moved(content)
    
    # Include the lists in the response
    @database_sync_to_async
    def get_all_lists_with_cards(self, board_id):
        lists = List.objects.filter(board_id=board_id).prefetch_related('cards')
        all_lists_with_cards = []
        encoder = DateTimeEncoder()
        for list_obj in lists:
            list_dict = model_to_dict(list_obj)  # Convert the list model to a dictionary
            cards = list_obj.cards.all()
            list_dict['cards'] = [json.loads(encoder.encode(model_to_dict(card))) for card in cards]
            all_lists_with_cards.append(list_dict)
        return all_lists_with_cards
    
    @database_sync_to_async
    def get_list_instance(self, list_id):
        return List.objects.get(id=list_id)


    # CREATE LIST
    async def create_list(self, content):
        board_id = content.get('board_id')
        list_name = content.get('list_name')
        user_id = content.get('user_id')

        # Use database_sync_to_async to run the synchronous ORM code
        list_data = await self.create_new_list(board_id, list_name, user_id)
        if 'error' in list_data:
            await self.dispatcher.send_json({
                'error': 'List could not be created'
            })
        else:
            all_lists = await self.get_all_lists_with_cards(board_id)
            await self.dispatcher.send_json({
                'action': 'list_created',
                'list': all_lists,
            })

    @database_sync_to_async
    def create_new_list(self, board_id, list_name, user_id):
        try:
            board = Board.objects.get(id=board_id)
            user = CustomUser.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return {'error': 'board or user not found'}

        try:
            position = List.objects.filter(board=board).count() + 1
            list_instance = List.objects.create(board=board, title=list_name, position=position, created_by=user)
        except Exception as e:
            return {'error': f'error creating list: {str(e)}'}

        serializer = ListSerializer(list_instance)
        return serializer.data
    

    # DELETE LIST
    async def handle_delete_list(self, content):
        list_id = content.get('list_id')
        user_id = content.get('user_id')
        board_id = content.get('board_id')

        list_data = await self.delete_list(list_id, user_id)
        if list_data and 'status' in list_data:
            all_lists_data = await self.get_all_lists_with_cards(board_id)
            await self.dispatcher.send_json({
                'action': 'list_deleted',
                'list': all_lists_data,
            })
        elif list_data:
            await self.dispatcher.send_json({
                'error': list_data['error']
            })
        else:
            await self.dispatcher.send_json({
                'error': 'An error occurred while deleting the list'
            })

    @database_sync_to_async
    def delete_list(self, list_id, user_id):
        try:
            # Retrieve the user from the user_id
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return {'error': 'Invalid user ID'}

        try:
            # Retrieve the list instance
            list_instance = List.objects.get(id=list_id)
        except List.DoesNotExist:
            return {'error': 'List not found'}
            
        try:
            # Retrieve the board instance
            board = list_instance.board
            # Retrieve the workspace instance
            workspace = board.workspace

            # Check if the user is the owner of the workspace
            if workspace.owner != user:
                return {'error': 'Permission denied'}
                
            # If the user is authorized, delete the list
            deleted_list_position = list_instance.position
            list_instance.delete()

            # Update the positions of the lists that come after the deleted list
            lists_after_deleted = List.objects.filter(board=board, position__gt=deleted_list_position)
            for list_obj in lists_after_deleted:
                list_obj.position -= 1
                list_obj.save()

            return {'status': 'List deleted successfully'}  # Return a status message when the list is deleted successfully
        except Exception as e:
            return {'error': str(e)}


    # UPDATE LIST
    async def update_list(self, content):
        updated_data = content.get('updated_data')
        list_id = content.get('list_id')
        user_id = content.get('user_id')
        board_id = content.get('board_id')

        list_data = await self.update_new_list(updated_data, list_id, user_id)
        if 'error' in list_data:
            await self.dispatcher.send_json({
                'error': list_data['error']
            })
        else:
            all_lists_data = await self.get_all_lists_with_cards(board_id)
            await self.dispatcher.send_json({
                'action': 'list_updated',
                'list': all_lists_data,
            })

    @database_sync_to_async
    def update_new_list(self, updated_data, list_id, user_id):
        try:
            list_instance = List.objects.get(id=list_id)
            workspace = list_instance.board.workspace
            user = CustomUser.objects.get(id=user_id)

            if workspace.owner != user:
                return {'error': f'Permission denied for user {user_id} on workspace {workspace.id}'}
                
            for field, value in updated_data.items():
                if hasattr(list_instance, field):
                    setattr(list_instance, field, value)

            list_instance.save()
            return model_to_dict(list_instance)  # Return the updated list data
        except List.DoesNotExist:
            return {'error': f'List with id {list_id} not found'}
        except Exception as e:
            return {'error': f'Unexpected error: {str(e)}'}



    # MOVE LIST AROUND
    async def list_moved(self, content):
        list_id = content.get('listId')
        new_position = content.get('newPosition')

        # Use database_sync_to_async to run the synchronous ORM code
        list_data = await self.update_list_position(list_id, new_position)
        if 'error' in list_data:
            await self.dispatcher.send_json({
                'error': 'List not found'
            })
        else:
            # Fetch the list instance and get its board_id
            list_instance = await self.get_list_instance(list_id)
            board_id = list_instance.board_id

            all_lists_data = await self.get_all_lists_with_cards(board_id)
            if isinstance(all_lists_data, list):
                all_lists_data_encoded = [{k: v.isoformat() if isinstance(v, datetime.datetime) else v for k, v in list_data.items()} for list_data in all_lists_data]

                await self.dispatcher.send_json({
                    'action': 'list_moved',
                    'list': all_lists_data_encoded,
                })
            else:
                await self.dispatcher.send_json({
                    'error': 'No lists found for the given board_id'
                })

    @database_sync_to_async
    def update_list_position(self, list_id, new_position):
        list_instance = None
        try:
            with transaction.atomic():
                try:
                    list_instance = List.objects.get(id=list_id)
                except List.DoesNotExist:
                    return {'error': 'list not found'}

                # Ensure new_position is an integer
                new_position = int(new_position)

                # Ensure new_position is within the expected range
                max_position = List.objects.count()
                new_position = max(1, min(new_position, max_position))

                # If the new position is greater than the current position, increment the positions of lists in between
                if new_position > list_instance.position:
                    lists_in_between = List.objects.filter(position__gt=list_instance.position, position__lte=new_position)
                    for list_item in lists_in_between:
                        list_item.position -= 1
                        list_item.save()

                # If the new position is less than the current position, decrement the positions of lists in between
                elif new_position < list_instance.position:
                    lists_in_between = List.objects.filter(position__lt=list_instance.position, position__gte=new_position)
                    for list_item in lists_in_between:
                        list_item.position += 1
                        list_item.save()

                # Update the position of the moved list
                list_instance.position = new_position
                list_instance.save()

            serializer = ListSerializer(list_instance)
            return serializer.data
        except ObjectDoesNotExist:
            if list_instance is None:
                return {'error': 'List not found'}
            else:
                return {'error': 'List instance is not None but there is a problem'}