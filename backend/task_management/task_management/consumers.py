from channels.generic.websocket import AsyncJsonWebsocketConsumer
from lists.views import ListConsumer
from cards.views import CardConsumer

class DispatcherConsumer(AsyncJsonWebsocketConsumer):
    async def receive_json(self, content):
        action = content.get('action')

        if not action:
            print("Error: No action in message")
            return

        if action in ['create_list', 'delete_list', 'update_list', 'list_moved']:
            await ListConsumer(self).receive_json(content)
        elif action in ['create_card', 'delete_card', 'update_card', 'move_card']:
            await CardConsumer(self).receive_json(content)
        else:
            print(f"Error: Unknown action {action}")