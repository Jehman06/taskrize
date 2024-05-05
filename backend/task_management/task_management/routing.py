from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from lists.views import ListConsumer

websocket_urlpatterns = [
    path('ws/lists/', ListConsumer.as_asgi()),
    # path('ws/cards/', CardConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(
        websocket_urlpatterns
    ),
})