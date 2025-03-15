from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import status, views, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import *
from django.middleware.csrf import get_token
from datetime import timedelta
from client.models import Activity,Event
from Profile.models import *
from .serializers import *
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import User, Project, Category
from .serializers import UserSerializer, ProjectSerializer, CategorySerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from .models import Task, Notification
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()  # This will point to your custom User model if defined

# Create your views here.
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class IsprofiledDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        got_user = request.user
        if got_user.role == 'client':
            profile_picture = ClientProfile.objects.get(user=got_user).profile_picture
        else:
            profile_picture = FreelancerProfile.objects.get(user=got_user).profile_picture
        is_profiled = got_user.is_profiled
        role = got_user.role
        usename = got_user.username
        email = got_user.email
        if is_profiled:
            profile_picture = profile_picture.url
        else:
            profile_picture = None
        
        result = {
            "user":{
             "id":got_user.id,   
            "is_profiled": is_profiled,
            "role": role,
            "username": usename,
            "email": email,
            "profile_picture": profile_picture
            }
        }
        return Response(result,status=200)




class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Step 1: Get credentials from the request body
        username = request.data.get('username')
        password = request.data.get('password')

        # Step 2: Validate email and password
        if not username or not password:
            return Response(
                {
                    "error": "Username and Password are required."
                }
                , status=status.HTTP_400_BAD_REQUEST)
        
        # Step 3: Authenticate the user
        user = authenticate(request, username=username, password=password)
        
        if not user:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Step 4: Generate JWT Tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Step 5: Set the CSRF token in a secure, HttpOnly cookie
        csrf_token = get_token(request)  # CSRF token to prevent CSRF attacks

        # Set cookies with a longer lifespan (e.g., 30 days)
        response = Response({
            "message": "Login successful.",
            "access": access_token,
            "refresh": str(refresh),
            "role": user.role,  # Add role in the response
            "user_id": user.id  # Add role in the response
        }, status=status.HTTP_200_OK)

        # Set CSRF token in cookie
        response.set_cookie(
            'csrftoken', csrf_token, 
            max_age=timedelta(days=30),  # Set the lifespan of the CSRF cookie to 30 days
            secure=True,  # Ensures cookies are only sent over HTTPS
            httponly=True,  # Prevent JavaScript access to the cookie (mitigates XSS attacks)
            samesite='Strict'  # CSRF protection - cookies will only be sent in first-party contexts
        )

        # Also, set JWT cookies (if needed)
        response.set_cookie(
            'accessToken', access_token,
            max_age=timedelta(days=30),  # Set the lifespan of the JWT access token cookie
            secure=True,  # Ensure cookies are only sent over HTTPS
            httponly=True,  # Prevent JavaScript access to the cookie
            samesite='Strict'  # CSRF protection
        )

        response.set_cookie(
            'refreshToken', str(refresh),
            max_age=timedelta(days=30),  # Set the lifespan of the JWT refresh token cookie
            secure=True,  # Ensure cookies are only sent over HTTPS
            httponly=True,  # Prevent JavaScript access to the cookie
            samesite='Strict'  # CSRF protection
        )

        return response

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        print(data)
        
        # Step 1: Email, Password, and Confirm Password
        if 'email' not in data or 'password' not in data or 'confirm_password' not in data:
            return Response({"error": "Email, Password, and Confirm Password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if data['password'] != data['confirm_password']:
            return Response({"error": "Password and Confirm Password must match."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(data.get('password'))
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Step 2: Role (Client or Freelancer)
        if 'role' not in data:
            return Response({"error": "Role is required. Choose either 'Client' or 'Freelancer'."}, status=status.HTTP_400_BAD_REQUEST)

        role = data['role']
        if role not in ['Client', 'Freelancer']:
            return Response({"error": "Role must be 'Client' or 'Freelancer'."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Create user (email and password only)
        user = User.objects.create_user(email=data['email'], username=data['username'],password=data['password'],role=role.lower())
        
        # Step 4: Transaction Block to ensure atomicity
        with transaction.atomic():
            # Step 5: Category and Skills for Freelancer
            if role == 'Freelancer':  
                
                # Create Freelancer Profile
                freelancer_profile = FreelancerProfile(user=user)
                freelancer_profile.save()

                # Set additional fields if provided
                if 'location' in data:
                    freelancer_profile.location = data['location']
                if 'dob' in data:
                    freelancer_profile.dob = data['dob']
                if 'payment_info' in data:
                    freelancer_profile.payment_info = data['payment_info']
                freelancer_profile.save()

            # Step 6: Create Client Profile if the role is Client
            elif role == 'Client':
                client_profile = ClientProfile(user=user)
                client_profile.save()

                # Set additional fields if provided
                if 'location' in data:
                    client_profile.location = data['location']
                if 'dob' in data:
                    client_profile.dob = data['dob']
                client_profile.save()

        # Generate JWT Token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "User and Profile created successfully!",
            "access": access_token,
            "refresh": str(refresh),
            "role": user.role  # Add role information in response
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        """
        Handle user logout by blacklisting the refresh token and clearing the session.
        """
        refresh_token = request.data.get('refreshToken')

        if not refresh_token:
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Clear the session (optional)
        request.session.flush()

        return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)




class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can create projects
    
    def post(self, request):
        # Get the client (user) creating the project
        client = request.user

        # Extract data from the request
        skills_data = request.data.get('skills_required', [])
        is_collaborative = request.data.get('is_collaborative', False)
        tasks = request.data.get('tasks', [])
        
        # Check the user's membership and set the max task limit
        if client.membership == 'free':
            max_tasks = 2
        elif client.membership == 'gold':
            max_tasks = 3
        elif client.membership == 'platinum':
            max_tasks = 5
        else:
            max_tasks = 0  # Handle the case where the user doesn't have a valid membership

        # Validate the number of tasks based on the membership
        if is_collaborative and len(tasks) > max_tasks:
            return Response({
                "message": f"Task limit exceeded. You can create up to {max_tasks} tasks based on your membership level."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate and get the domain
        try:
            domain = Category.objects.get(id=request.data['domain'])
        except Category.DoesNotExist:
            return Response({"message": "Domain not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the Project instance but don't save yet
        temp_project = Project(
            title=request.data['title'],
            description=request.data['description'],
            budget=request.data['budget'],
            deadline=request.data['deadline'],
            is_collaborative=is_collaborative,
            domain=domain,
            client=client,
            status='pending',
        )

        # Save the project instance first to get an ID (necessary for Many-to-Many relationships)
        temp_project.save()

        # Create an event based on the project deadline
        event = Event(
            user=client,
            title=f"{temp_project.title} - Deadline",
            type='Deadline',
            start=temp_project.deadline
        )
        event.save()

        # Handle the skills for the project
        if skills_data:
            try:
                skills_required = Skill.objects.filter(id__in=[skill['value'] for skill in skills_data])
                temp_project.skills_required.set(skills_required)
            except Skill.DoesNotExist:
                return Response({"message": "Some skills not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle tasks if it's a collaborative project
        if is_collaborative and tasks:
            task_instances = []
            for task in tasks:
                task_skill_data = task.get('skills_required_for_task', [])
                try:
                    # Create the task instance
                    temp_task = Task(
                        title=task['title'],
                        description=task['description'],
                        deadline=task['deadline'],
                        project=temp_project,
                        budget=task['budget']
                    )
                    temp_task.save()

                    # Create an event for each task based on its deadline
                    task_event = Event(
                        user=client,
                        title=f"{temp_task.title} - Deadline",
                        start=temp_task.deadline
                    )
                    task_event.save()

                    # Set skills required for the task
                    if task_skill_data:
                        skills_required_task = Skill.objects.filter(id__in=[skill['value'] for skill in task_skill_data])
                        temp_task.skills_required_for_task.set(skills_required_task)

                    task_instances.append(temp_task)
                except KeyError as e:
                    return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
                except Skill.DoesNotExist:
                    return Response({"message": "Some skills not found for the task"}, status=status.HTTP_400_BAD_REQUEST)

            # Serialize the tasks and project data
            task_serializer = TaskSerializer(task_instances, many=True)
            project_serializer = ProjectSerializer(temp_project)

            # Activity log for project creation
            Activity.objects.create(
                user=client,
                activity_type='project_created',
                description=f'Created Project: {temp_project.title}',
                related_model='project',
                related_object_id=temp_project.id
            )

            # Activity log for each task creation
            for task in task_instances:
                Activity.objects.create(
                    user=client,
                    activity_type='task_created',
                    description=f'Created Task: {task.title} for Project: {temp_project.title}',
                    related_model='task',
                    related_object_id=task.id
                )

            return Response({
                "message": "Project and tasks created successfully.",
                "project": project_serializer.data,
                "tasks": task_serializer.data
            }, status=status.HTTP_201_CREATED)

        # Serialize only the project if no tasks were provided
        project_serializer = ProjectSerializer(temp_project)

        # Activity log for project creation
        Activity.objects.create(
            user=client,
            activity_type='project_created',
            description=f'Created Project: {temp_project.title}',
            related_model='project',
            related_object_id=temp_project.id
        )

        return Response({
            "message": "Project created successfully.",
            "project": project_serializer.data
        }, status=status.HTTP_201_CREATED)


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        """
        Returns a list of all categories (domains).
        """
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class SkillsByCategoryView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request, category_id):
        """
        Returns a list of skills that belong to the selected category (domain).
        """
        skills = Skill.objects.filter(category_id=category_id)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)



# Custom pagination class
from .models import User
class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([])  # Open API, modify as needed
def search_partial(request):
    query = request.GET.get('query', '').strip()
    if not query:
        return Response({"error": "Search query is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check cache first
    cached_results = cache.get(query)
    if cached_results:
        return Response(cached_results)

    paginator = CustomPagination()
    # Search Users (by username & role)
    users = User.objects.filter(
        Q(username__icontains=query) | Q(role__icontains=query)
    ).order_by('id')

    # Paginate Users
    paginated_users = paginator.paginate_queryset(users, request)

    # Manually serialize the users with a Python dict
    serialized_users = []
    projects = []
    seen_project_ids = set()  # To track unique project IDs

    for user in paginated_users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'profile_picture': None,  # Default value for profile_picture
        }

        # Add the profile_picture based on the role
        if user.role == 'client':
            try:
                client_profile = ClientProfile.objects.get(user=user)
                user_data['profile_picture'] = client_profile.profile_picture.url if client_profile.profile_picture else None
                # Query for projects assigned to this client
                client_projects = Project.objects.filter(
                    Q(client=user) |  # Projects assigned to this client
                    Q(title__icontains=query) | 
                    Q(description__icontains=query) | 
                    Q(domain__name__icontains=query)
                ).distinct().order_by('id')

                # Add only unique projects by ID
                for project in client_projects:
                    if project.id not in seen_project_ids:
                        seen_project_ids.add(project.id)
                        projects.append(project)

            except ClientProfile.DoesNotExist:
                user_data['profile_picture'] = None
        elif user.role == 'freelancer':
            try:
                freelancer_profile = FreelancerProfile.objects.get(user=user)
                # Query for projects assigned to this freelancer
                freelancer_projects = Project.objects.filter(
                    Q(assigned_to=user) |  # Correct for ManyToManyField lookup
                    Q(title__icontains=query) | 
                    Q(description__icontains=query) | 
                    Q(domain__name__icontains=query)
                ).distinct().order_by('id')

                # Add only unique projects by ID
                for project in freelancer_projects:
                    if project.id not in seen_project_ids:
                        seen_project_ids.add(project.id)
                        projects.append(project)

                user_data['profile_picture'] = freelancer_profile.profile_picture.url if freelancer_profile.profile_picture else None
            except FreelancerProfile.DoesNotExist:
                user_data['profile_picture'] = None

        serialized_users.append(user_data)

    # Paginate Projects
    if projects:
        paginated_projects = paginator.paginate_queryset(projects, request)
        serialized_projects = ProjectSerializer(paginated_projects, many=True)
        project_count = len(projects)  # Count the total number of projects
    else:
        project_count = 0

    # Search Categories (by name)
    categories = Category.objects.filter(
        Q(name__icontains=query)
    ).order_by('id')

    # Paginate Categories
    paginated_categories = paginator.paginate_queryset(categories, request)
    serialized_categories = CategorySerializer(paginated_categories, many=True)

    # Prepare the final response data, including pagination info
    response_data = {
        "users": {
            "count": users.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "results": serialized_users
        },
        "projects": {
            "count": project_count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "results": serialized_projects.data if projects else []
        },
        "categories": {
            "count": categories.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "results": serialized_categories.data
        }
    }
    print(response_data)

    # Cache the results for 15 minutes
    cache.set(query, response_data, timeout=60*15)

    # Return the paginated response
    return Response(response_data)



class NotificationListView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


# Mark a specific notification as read
class MarkNotificationAsRead(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# Delete a specific notification
class DeleteNotification(APIView):
    permission_classes=[IsAuthenticated]

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(user, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.id}",
        {
            "type": "send_notification",
            "message": {"message": message}
        }
    )


class UnmarkedNotificationListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        # Filter notifications by the current logged-in user and those that are unread
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        
        # Serialize the notifications
        serializer = NotificationSerializer(notifications, many=True)
        
        # Return the serialized data as the response
        return Response(serializer.data)


from django.core.exceptions import ObjectDoesNotExist

@method_decorator(csrf_exempt, name='dispatch')
class NotifyFreelancerView(View):
    permission_classes = [IsAuthenticated]

    def post(self, request, object_id, type):
        try:
            task = None
            project = None
            notification_text = ''
            users_to_notify = []

            try:
                # Try to fetch task
                print(type)
                if type == 'task':
                    task = Task.objects.get(id=object_id)
                    project = task.project  # If task found, get associated project
                    notification_text = _(
                        f"{task.title} - The task you have been assigned by {project.client.username} is pending. "
                        f"Deadline: {task.deadline}. Project: {project.title}."
                    )
                    users_to_notify = task.assigned_to.all()

                elif type == 'project':
                    project = Project.objects.get(id=object_id)
                    notification_text = _(
                        f"{project.title} - The project you have been assigned by {project.client.username} is pending. "
                        f"Deadline: {project.deadline}."
                    )
                    users_to_notify = project.assigned_to.all()
                    print(users_to_notify)

                # Include the client in the notification list
                

            except ObjectDoesNotExist:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid task or project ID."
                }, status=400)

            # Check if user has already been notified within the last 24 hours
            
            for user in users_to_notify:
                recent_notification = Notification.objects.filter(
                    user=user,
                    related_model_id=task.id if task else project.id,
                    created_at__gte=timezone.now() - timezone.timedelta(hours=24)
                ).first()

                print("recent_notification",recent_notification)

                if recent_notification:
                    return JsonResponse({
                        "status": "error",
                        "message": "User already notified. Please try again in 24 hours."
                    }, status=400)

                # Send new notification
                Notification.objects.create(
                    user=user,
                    type='Projects & Tasks' if task else 'Projects',
                    related_model_id=task.id if task else project.id,
                    notification_text=notification_text
                )

            return JsonResponse({"status": "success", "message": "Notifications sent successfully."})

        except Exception as e:
            # Log exception here
            return JsonResponse({"status": "error", "message": str(e)}, status=500)


def get_upcoming_notifications(request):
    if request.method == 'GET':
        # Get notifications due within the next week
        upcoming_notifications = Notification.objects.filter(
            created_at__gte=timezone.now(),
            created_at__lt=timezone.now() + timezone.timedelta(weeks=1)
        ).values('id', 'notification_text', 'created_at')

        return JsonResponse(list(upcoming_notifications), safe=False)
