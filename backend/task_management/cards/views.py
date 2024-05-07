from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from boards.models import Board
from lists.models import List
from .serializers import CardSerializer
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
from cards.models import Card
import datetime

class CardConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, dispatcher):
        self.dispatcher = dispatcher

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, content):
        print('receive_json function called')
        action = content.get('action').strip()
        print(f'Received action: {action}')  # Print the received action
        print(f'Type of action: {type(action)}')
        print(f'ASCII values of action: {[ord(c) for c in action]}')
        if action == 'move_card':
            await self.card_moved(content)
        elif action == 'create_card':
            await self.create_card(content)
        elif action == 'delete_card':
            await self.handle_delete_card(content)
        elif action == 'update_card':
            await self.update_card(content)

    # Include the lists in the response
    @database_sync_to_async
    def get_all_lists_with_cards(self, board_id):
        lists = List.objects.filter(board_id=board_id).prefetch_related('cards')
        all_lists_with_cards = []
        for list_obj in lists:
            list_dict = model_to_dict(list_obj)  # Convert the list model to a dictionary
            list_dict['cards'] = list(list_obj.cards.all().values())  # Add the related cards to the dictionary
            all_lists_with_cards.append(list_dict)
        return all_lists_with_cards

    async def create_card(self, content):
        list_id = content.get('list_id')
        card_title = content.get('title')
        board_id = content.get('board_id')

        card_data = await self.create_new_card(list_id, card_title)
        if 'error' in card_data:
            await self.dispatcher.send_json({
                'error': card_data['error']
            })
        else:
            all_lists = await self.get_all_lists_with_cards(board_id)
            await self.dispatcher.send_json({
                'action': 'card_created',
                'list': all_lists,
            })

    @database_sync_to_async
    def create_new_card(self, list_id, card_title):
        try:
            list_instance = List.objects.get(id=list_id)
        except List.DoesNotExist:
            return {'error': 'List not found'}

        try:
            position = Card.objects.filter(list=list_instance).count() + 1
            card = Card.objects.create(title=card_title, position=position, list=list_instance)
            serializer = CardSerializer(card)
            return serializer.data
        except Exception as e:
            return {'error': str(e)}
        
    async def card_moved(self, content):
        card_id = content.get('card_id')
        new_position = content.get('new_position')
        board_id = content.get('board_id')
        new_list_id = content.get('new_list_id')

        card_data = await self.update_card_position(card_id, new_position, new_list_id)
        if 'error' in card_data:
            await self.dispatcher.send_json({
                'error': card_data['error']
            })
        else:
            all_lists = await self.get_all_lists_with_cards(board_id)
            await self.dispatcher.send_json({
                'action': 'card_moved',
                'list': all_lists,
            })

    @database_sync_to_async
    def update_card_position(self, card_id, new_position, new_list_id):
        try:
            with transaction.atomic():
                try:
                    card = Card.objects.get(id=card_id)
                except Card.DoesNotExist:
                    return {'error': 'Card not found'}

                # Ensure the new position is an integer
                new_position = int(new_position)

                # If the card is moving to a different list
                if card.list_id != new_list_id:
                    # Decrement the positions of cards in the old list that are after the card
                    cards_in_old_list = Card.objects.filter(list_id=card.list_id, position__gt=card.position)
                    for card_item in cards_in_old_list:
                        card_item.position -= 1
                        card_item.save()

                    # Update the list of the card
                    card.list_id = new_list_id

                # Ensure the new position is within expected range
                max_position = List.objects.get(id=new_list_id).cards.count() + 1
                new_position = max(1, min(new_position, max_position))

                # Increment the positions of cards in the new list that are after the new position
                cards_in_new_list = Card.objects.filter(list_id=new_list_id, position__gte=new_position).exclude(id=card_id)
                for card_item in cards_in_new_list:
                    card_item.position += 1
                    card_item.save()

                # Update the position of the moved card
                card.position = new_position
                card.save()

                serializer = CardSerializer(card)
                return serializer.data
        except ObjectDoesNotExist:
            if card is None:
                return {'error': 'List not found'}
            else:
                return {'error': 'List instance is not None but there is a problem'}