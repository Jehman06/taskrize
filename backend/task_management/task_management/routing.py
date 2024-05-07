from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from task_management.consumers import DispatcherConsumer

websocket_urlpatterns = [
    path('ws/board/', DispatcherConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(
        websocket_urlpatterns
    ),
})