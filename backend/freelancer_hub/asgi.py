import os
import django

django.setup()  # Ensure Django is initialized
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import client.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "freelancer_hub.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(client.routing.websocket_urlpatterns)
    ),
})