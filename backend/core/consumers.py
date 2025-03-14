import json
import jwt  # For decoding JWT
from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.cache import cache
from core.models import User, Project, Category
from Profile.models import ClientProfile,FreelancerProfile
from core.serializers import ProjectSerializer, CategorySerializer
from django.core.serializers import serialize


User = get_user_model()

class SearchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connection received")
        await self.accept()
        print("WebSocket connection accepted")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)

        # 🔹 Step 1: Authenticate user if token is sent
        if data.get("type") == "auth":
            token = data.get("token", None)
            self.user = await self.authenticate_user(token)

            if self.user:
                await self.send(json.dumps({"message": "Authenticated"}))
            else:
                await self.send(json.dumps({"error": "Invalid token"}))
                await self.close()
            return

        # 🔹 Step 2: Ensure the user is authenticated before searching
        if not self.user:
            await self.send(json.dumps({"error": "Unauthorized"}))
            await self.close()
            return

        query = data.get("query", "").strip()

        if len(query) < 2:
            await self.send(json.dumps({"users": [], "projects": [], "categories": []}))
            return

        users, projects, categories = await self.perform_search(query)

        response_data = {
            "users": users,
            "projects": projects,
            "categories": categories
        }

        await self.send(json.dumps(response_data))

    @sync_to_async
    def authenticate_user(self, token):
        """Decode JWT Token and return the authenticated user"""
        if not token:
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return User.objects.get(id=payload["user_id"])
        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return None


    @sync_to_async
    def perform_search(self, query):
        """Perform search asynchronously using authenticated user"""
        if not self.user:
            return [], [], []  # Return empty results if not authenticated

        user = self.user
        projects = []
        seen_project_ids = set()
        
        # Query to get users
        users = User.objects.filter(
            Q(username__icontains=query) | Q(role__icontains=query)
        ).values("id", "username", "role")[:10]  # No need to use list()

        # Prepare users data
        user_data_list = []
        for fuser in users:
            
            # Fetch the User instance using fuser['id']
            user_instance = User.objects.get(id=fuser['id'])
            
            user_data = {
                'id': fuser['id'],
                'username': fuser['username'],
                'role': fuser['role'],
                'profile_picture': None,  # Default value for profile_picture
            }
        
            if fuser["role"] == "client":
                try:
                    # Fetch the ClientProfile using the actual user_instance
                    client_profile = ClientProfile.objects.get(user=user_instance)
                    user_data['profile_picture'] = client_profile.profile_picture.url if client_profile.profile_picture else None
                except ClientProfile.DoesNotExist:
                    user_data['profile_picture'] = None  # Handle the case where the ClientProfile doesn't exist
            else:
                try:
                    # Fetch the FreelancerProfile using the actual user_instance
                    freelancer_profile = FreelancerProfile.objects.get(user=user_instance)
                    user_data['profile_picture'] = freelancer_profile.profile_picture.url if freelancer_profile.profile_picture else None
                except FreelancerProfile.DoesNotExist:
                    user_data['profile_picture'] = None  # Handle the case where the FreelancerProfile doesn't exist
            
            user_data_list.append(user_data)

        # 🔹 Search Projects (Filter based on user role)
        
        if user.role == "client":
            # For clients, search projects where the client is the user and match the query in the title or description
            projects = Project.objects.filter(client=user).filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            ).values("id", "title", "description")
        else:
            # For freelancers, search projects where the user is assigned and match the query in the title or description
            projects = Project.objects.filter(assigned_to=user).filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            ).values("id", "title", "description")
        
        # 🔹 Search Categories
        categories = Category.objects.filter(Q(name__icontains=query)).values("id", "name")

        # Return the results as lists (serialization)
        return list(user_data_list), list(projects), list(categories)


