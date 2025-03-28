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
from django.db import transaction
from .models import User  # This will point to your custom User model if defined
from dateutil import parser
from rest_framework import serializers
from .serializers import ProjectResponseSerializer, TaskResponseSerializer
import traceback
from django.utils.dateparse import parse_date

# Create your views here.
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class IsprofiledDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        got_user = request.user
        if got_user.role == 'client':
            profile_picture = ClientProfile.objects.get(user=got_user).profile_picture or None 
        else:
            profile_picture = FreelancerProfile.objects.get(user=got_user).profile_picture or None
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
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"error": "Username and Password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        
        if not user:
            return Response(
                {"error": "Invalid credentials."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Simplify role handling - map any other role to freelancer
        frontend_role = 'client' if user.role == 'client' else 'freelancer'
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Add is_talentrise only if user is a student
        response_data = {
            "message": "Login successful.",
            "access": access_token,
            "refresh": str(refresh),
            "role": frontend_role,
            "user_id": user.id
        }

        if user.role == 'student':
            response_data["is_talentrise"] = True

        response = Response(response_data, status=status.HTTP_200_OK)

        # Set cookies
        response.set_cookie(
            'accessToken', access_token,
            max_age=timedelta(days=30),
            secure=True,
            httponly=True,
            samesite='Strict'
        )

        return response

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def generate_unique_username(self, email):
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        return username

    def generate_nickname(self, email):
        # Generate a friendly nickname from the email
        name_part = email.split('@')[0]
        # Remove numbers and special characters for a cleaner nickname
        clean_name = ''.join(c for c in name_part if c.isalpha())
        # Capitalize first letter
        return clean_name.capitalize()

    def post(self, request):
        data = request.data
        
        if 'email' not in data or 'password' not in data or 'confirm_password' not in data:
            return Response(
                {"error": "Email, Password, and Confirm Password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if data['password'] != data['confirm_password']:
            return Response(
                {"error": "Password and Confirm Password must match."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validate_password(data.get('password'))
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique username and nickname from email
        username = self.generate_unique_username(data['email'])
        nickname = self.generate_nickname(data['email'])
        role = data.get('role', 'student').lower()  # Default to student if not specified
        is_talentrise = data.get('is_talentrise', False)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=data['email'],
                    username=username,
                    nickname=nickname,
                    password=data['password'],
                    role=role,
                    is_talentrise=is_talentrise
                )
                
                # Create the appropriate profile based on role
                if role == 'client':
                    ClientProfile.objects.create(user=user,primary_email = data['email'])
                else:
                    FreelancerProfile.objects.create(user=user,primary_email = data['email'])
                
                # ... rest of the registration logic ...

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                "message": "Student account created successfully!",
                "access": access_token,
                "refresh": str(refresh),
                "role": "freelancer",  # Map student to freelancer for frontend
                "is_talentrise": is_talentrise,
                "username": username,
                "nickname": nickname
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
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


from financeapp.models import Wallet

class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print("CreateProjectView.post() called")
        client = request.user
        
        tasks_data = request.data.get('tasks', [])
        project_milestones_data = request.data.get('milestones', [])
        total_auto_payment = request.data.get('total_auto_payment', 0)
        print(total_auto_payment)
        if total_auto_payment > 0:
            wallet_balance = Wallet.objects.get(user=client).balance
            if wallet_balance < total_auto_payment:
                return Response({"message": "Insufficient wallet balance."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            else:
                wallet = Wallet.objects.get(user=client)
                
                wallet.hold_balance += total_auto_payment
                wallet.save()
        
        # Validate membership limits
        max_tasks = {'free': 2, 'gold': 3, 'platinum': 5}.get(client.membership, 0)
        if len(tasks_data) > max_tasks:
            return Response({"message": f"Task limit exceeded. Max {max_tasks} tasks allowed."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Create Project with error handling
        try:
            # Parse the deadline string to a proper date object
            deadline_str = request.data.get('deadline')
            deadline = parse_date(deadline_str)
            if not deadline:
                return Response({"message": "Invalid deadline format"}, status=status.HTTP_400_BAD_REQUEST)
            
            is_collaborative = request.data.get('is_collaborative', False)
            
            # Validate task titles if collaborative
            if is_collaborative:
                for task_data in tasks_data:
                    if not task_data.get('title', '').strip():
                        return Response({"message": "Task title cannot be empty for collaborative projects"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
            
            # Create the project with proper date object
            project = Project.objects.create(
                title=request.data['title'],
                description=request.data['description'],
                budget=request.data['budget'],
                
                deadline=deadline,
                is_collaborative=is_collaborative,
                domain=Category.objects.get(id=request.data['domain']),
                client=client,
                status='pending'
            )
            
            # Handle Project Milestones
            if project_milestones_data:
                self.create_milestones(project, None, project_milestones_data)
                project.update_payment_strategy()

            # Handle Tasks only if collaborative
            task_instances = []
            if is_collaborative:
                for task_data in tasks_data:
                    # Parse task deadline
                    task_deadline_str = task_data.get('deadline')
                    task_deadline = parse_date(task_deadline_str) if task_deadline_str else deadline
                    print(task_data.get('automated_payment', False))
                    task = Task.objects.create(
                        title=task_data.get('title', ''),
                        description=task_data.get('description', ''),
                        deadline=task_deadline,
                        is_automated_payment=task_data.get('automated_payment', False),
                        project=project,
                        budget=task_data.get('budget', 0)
                    )
                    
                    # Handle Task Milestones
                    task_milestones_data = task_data.get('milestones', [])
                    if task_milestones_data:
                        self.create_milestones(None, task, task_milestones_data)
                    
                    task_instances.append(task)

            # Set skills and create events
            self.handle_skills_and_events(project, tasks_data, task_instances, client)
            
            # Use the dedicated response serializers
            try:
                print("Serializing project response...")
                print(f"Project data before serialization: {project.__dict__}")
                project_data = ProjectResponseSerializer(project).data
                print("Project serialization successful!")
                
                # Refresh all task instances before serialization
                task_instances = Task.objects.filter(project=project)
                print(f"Found {task_instances.count()} tasks for serialization")
                print(f"First task data: {task_instances.first().__dict__ if task_instances.exists() else None}")
                
                tasks_data = TaskResponseSerializer(task_instances, many=True).data
                print("Task serialization successful!")
                
                return Response({
                    "message": "Project created successfully",
                    "project": project_data,
                    "tasks": tasks_data
                }, status=status.HTTP_201_CREATED)
                
            except Exception as serialize_error:
                print(f"Serialization error: {str(serialize_error)}")
                print(traceback.format_exc())
                # Fall back to basic response if serialization fails
                return Response({
                    "message": "Project created successfully, but error in response formatting",
                    "project_id": project.id,
                    "project_title": project.title
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Project creation error: {str(e)}")
            print(traceback.format_exc())
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create_milestones(self, project, task, milestones_data):
        for milestone_data in milestones_data:
            # Handle empty due_date
            due_date = milestone_data.get('due_date')
            if not due_date:
                # Set default to 1 week from now
                due_date = timezone.now() + timezone.timedelta(weeks=1)
            else:
                try:
                    # Parse string date if provided
                    due_date = parser.parse(due_date).date()
                except (ValueError, TypeError):
                    due_date = timezone.now() + timezone.timedelta(weeks=1)

            Milestone.objects.create(
                title=milestone_data.get('title', ''),
                project=project,
                task=task,
                amount=milestone_data.get('amount', 0),
                due_date=due_date,
                milestone_type=milestone_data.get('milestone_type', 'hybrid'),
                is_automated=milestone_data.get('is_automated', True)
            )

    def handle_skills_and_events(self, project, tasks_data, task_instances, client):
        # Handle project skills
        if skills_data := self.request.data.get('skills_required'):
            # Ensure we have a list of skill IDs
            skill_ids = [skill['value'] if isinstance(skill, dict) else skill 
                        for skill in skills_data]
            project.skills_required.set(Skill.objects.filter(id__in=skill_ids))

        # Create project deadline event
        Event.objects.create(
            user=client,
            title=f"{project.title} - Deadline",
            type='Deadline',
            start=project.deadline
        )

        # Handle tasks
        for task, task_data in zip(task_instances, tasks_data):
            # Task skills
            if task_skills := task_data.get('skills_required_for_task'):
                # Ensure we have a list of skill IDs
                skill_ids = [skill['value'] if isinstance(skill, dict) else skill 
                            for skill in task_skills]
                task.skills_required_for_task.set(Skill.objects.filter(id__in=skill_ids))
            
            # Task event
            Event.objects.create(
                user=client,
                title=f"{task.title} - Deadline",
                start=task.deadline
            )
            
            # Activity logging
            Activity.objects.create(
                user=client,
                activity_type='task_created',
                description=f'Created Task: {task.title}',
                related_model='task',
                related_object_id=task.id
            )



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
