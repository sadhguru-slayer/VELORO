from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from rest_framework.exceptions import NotFound
from core.serializers import (
    ProjectSerializer, 
    TaskSerializer, 
    SpendingDistributionByProjectSerializer,
    UserSerializer,
    ConnectionSerializer
)
from Profile.models import (
    ClientProfile,Project,User
)
from core.models import Connection
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action,api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework import viewsets, status, generics
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Sum,Avg
from django.db.models.functions import (
    TruncMonth, 
    TruncWeek, 
    TruncYear, 
    ExtractWeekDay
)
import calendar
from datetime import timedelta

from Profile.models import (
    ClientProfile, 
    Feedback, 
    FreelancerProfile, 
    FreelancerReview
)
from Profile.serializers import (
    ClientProfileSerializer, 
    FreelancerProfileSerializer,
    ClientFeedbackSerializer,
    ClientProfilePartialUpdateSerializer,
    ConnectionSendinSerializer
)
from .models import Activity

from django.http import JsonResponse

class ClientReviewsandRatings(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(sefl,request):
        user = request.user
        reviews_ratings = Feedback.objects.filter(to_user=user)
        average_rating = reviews_ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        serialized_reviews = ClientFeedbackSerializer(reviews_ratings, many=True).data

        return Response(
            {
                'reviews': serialized_reviews,
                'average_rating': average_rating,
            },status=200
        )

@api_view(['POST'])
def post_reply(request):
    user = request.user
    review_id = request.data.get('review_id')
    reply_text = request.data.get('reply_text')

    if not review_id or not reply_text:
        return Response({'error': 'Review ID and reply text are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        review = Feedback.objects.get(id=review_id, to_user=user)
    except Feedback.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    # Create the reply
    reply = Feedback.objects.create(
        from_user=user,
        to_user=review.from_user,  # The reply goes to the original reviewer
        project=review.project,
        rating=review.rating,
        feedback=reply_text,
        parent_feedback=review,  # This makes it a reply
        is_reply=True,  # Mark as a reply
    )

    # Serializing the reply
    serialized_reply = ClientFeedbackSerializer(reply).data
    return Response(serialized_reply, status=status.HTTP_201_CREATED)


class ClientViews(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        auth_user = request.user
        user_id = request.GET.get('userId')

        # Retrieve the user object for the requested userId
        user = get_object_or_404(User, id=user_id)
        role = user.role
        
        # Get connection count and connection status
        connection_count = user.get_client_connections()
        connection_status = None
        is_connected = None
        connection_id = None

        try:
        # Check if there is an 'accepted' connection between users
            is_connected = Connection.objects.filter(
                Q(from_user=auth_user, to_user=user) | Q(from_user=user, to_user=auth_user),
                status='accepted'
            ).exists()

            # Fetch the connection for the given users (if any)
            connection = Connection.objects.filter(
                Q(from_user=auth_user, to_user=user) | Q(from_user=user, to_user=auth_user)
            ).first()

            # If a connection exists, retrieve the status
            if connection:
                # Check if the connection is from user -> auth_user and is pending
                if connection.from_user == user and connection.to_user == auth_user:
                    connection_status = 'not_accepted' if connection.status == 'pending' else connection.status
                # Check if the connection is from auth_user -> user and is pending
                elif connection.from_user == auth_user and connection.to_user == user:
                    connection_status = 'pending' if connection.status == 'pending' else connection.status
                else:
                    # For any other status (like accepted)
                    connection_status = connection.status

                connection_id = connection.id
            else:
                # No connection exists
                connection_status = 'notset'

        except Exception as e:
            # Handle any other errors
            connection_status = 'notset'
            print(f"Error: {e}")


        # Get the profile data based on user role
        if role == 'client':
            profile = get_object_or_404(ClientProfile, user=user)
        else:
            profile = get_object_or_404(FreelancerProfile, user=user)
        
        # Profile details response
        profile_details = {
            'id': user.id,
            'connection_id':connection_id,
            'name': user.username,
            'email': user.email,
            'bio': profile.bio,
            'role':user.role,
            'location': profile.location,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
        }

        # Fetching completed projects based on the user's role
        if role == 'client':
            projects = Project.objects.filter(client=user)
        else:
            projects = Project.objects.filter(assigned_to=user)

        # Serializing the projects data
        serialized_projects = ProjectSerializer(projects, many=True)

        # Fetching reviews and calculating average rating
        reviews_ratings = Feedback.objects.filter(to_user=user,is_reply=False)
        average_rating = reviews_ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        serialized_reviews = ClientFeedbackSerializer(reviews_ratings, many=True).data

        # Preparing the final response data
        result = {
            'client_profile': profile_details,
            'projects': serialized_projects.data,
            'is_connected': is_connected,
            'connection_status': connection_status,
            'connection_count': connection_count,
            'reviews_and_ratings': {
                'reviews': serialized_reviews,
                'average_rating': average_rating,
            }
        }


        return Response(result, status=200)


@api_view(['PUT'])
@csrf_exempt
def update_profile(request):
    try:
        client_profile = get_object_or_404(ClientProfile, user=request.user)
        user = request.user

        if request.method == 'PUT':
            serializer = ClientProfilePartialUpdateSerializer(client_profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                updated_fields = ", ".join([key for key, value in request.data.items()])
                description = f"Updated Profile: {user.username} - Changed fields: {updated_fields}"

                Activity.objects.create(
                    user=user,
                    activity_type='profile_updated',
                    description=description,
                    related_model='client_profile',
                    related_object_id=client_profile.id
                )

                return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ConnectionManageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    # Accept connection
    @action(detail=True, methods=['post'])
    def accept_connection(self, request, pk=None):
        connection = get_object_or_404(Connection, id=pk)
        print(connection)
        if connection.to_user == request.user:
            connection.accept()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'])
    def establish_connection(self, request, pk=None):
        from_user = request.user
        to_user = get_object_or_404(User, id=pk)
        if from_user == to_user:
            return Response({"error": "You cannot connect to yourself"}, status=status.HTTP_400_BAD_REQUEST)
        if Connection.objects.filter(from_user=from_user, to_user=to_user).exists():
            return Response({"error": "You are already connected"}, status=status.HTTP_400_BAD_REQUEST)
        connection = Connection(from_user=from_user, to_user=to_user)
        connection.save()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)

    # Reject connection
    @action(detail=True, methods=['post'])
    def reject_connection(self, request, pk=None):
        connection = get_object_or_404(Connection, id=pk)
        if connection.to_user == request.user:
            connection.reject()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)
    

class ConnectionView(generics.ListAPIView):
    serializer_class = ConnectionSendinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
    
        # Fetch connections where the user is either 'from_user' or 'to_user' with status 'accepted'
        connections1 = Connection.objects.filter(to_user=user, status='accepted')
        
        connections2 = Connection.objects.filter(from_user=user, status='accepted')

        # Combine both querysets using union (| operator)
        connections = connections1 | connections2
        print(connections)
        return connections

    def list(self, request, *args, **kwargs):
        # Get the queryset for connections
        queryset = self.get_queryset()

        # Serialize the connections
        connection_serializer = self.get_serializer(queryset, many=True)

        # Return the response with the connection data and profiles of both users in each connection
        return Response(connection_serializer.data, status=200)
class ConnectionRequestView(generics.ListAPIView):
    serializer_class = ConnectionSendinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
    
        # Fetch connections where the user is either 'from_user' or 'to_user' with status 'accepted'
        connections1 = Connection.objects.filter(to_user=user, status='pending')
        print(connections1)
        # Combine both querysets using union (| operator)
        connections = connections1
        return connections

    def list(self, request, *args, **kwargs):
        # Get the queryset for connections
        queryset = self.get_queryset()

        # Serialize the connections
        connection_serializer = self.get_serializer(queryset, many=True)

        # Return the response with the connection data and profiles of both users in each connection
        return Response(connection_serializer.data, status=200)



