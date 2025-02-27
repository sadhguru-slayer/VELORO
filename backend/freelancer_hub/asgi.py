import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "freelancer_hub.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import core.routing
import client.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            core.routing.websocket_urlpatterns + client.routing.websocket_urlpatterns
        )
    ),
})
