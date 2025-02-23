from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from core.models import User
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the token from the query parameters
        query_string = self.scope["query_string"].decode("utf-8")
        token = query_string.split("token=")[1] if "token=" in query_string else None

        if not token:
            print("No token provided")
            await self.close()
            return

        # Authenticate the user using the token
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            print(f"Authenticated user: {self.user}")
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            print(f"Token validation failed: {e}")
            await self.close()
            return

        if self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print("WebSocket connection accepted")
        else:
            print("User is not authenticated")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "user") and self.user.is_authenticated:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print("WebSocket connection closed")

    async def receive(self, text_data):
        pass

    async def send_notification(self, event):
        if "count" in event:
            await self.send(text_data=json.dumps({"notifications_count": event["count"]}))
        elif "message" in event:
            await self.send(text_data=json.dumps(event["message"]))