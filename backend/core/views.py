from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status, views, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import *
from django.middleware.csrf import get_token
from datetime import timedelta
from client.models import Activity
from Profile.models import *
from .serializers import *

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

# Create your views here.
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class IsprofiledDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        got_user = request.user
        is_profiled = got_user.is_profiled
        role = got_user.role
        result = {
            "user":{
            "is_profiled": is_profiled,
            "role": role
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
            return Response({"error": "Username and Password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
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
            "role": user.role  # Add role in the response
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
        # Add the client (user) to the project
        client = request.user
        
        # Extract data from request
        skills_data = request.data.get('skills_required', [])
        is_collaborative = request.data.get('is_collaborative', False)
        tasks = request.data.get('tasks', [])
        
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

        # Now handle the skills for the project
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

