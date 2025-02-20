from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import NotFound
from core.serializers import (
    ProjectSerializer, 
    TaskSerializer, 
    SpendingDistributionByProjectSerializer,
    UserSerializer
)
from Profile.models import (
    ClientProfile,Project
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
    ClientProfilePartialUpdateSerializer
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
        user = request.user
        connection_Count = user.get_client_connections()
        
        client_profile = get_object_or_404(ClientProfile, user=user)
        client_profile_details = {
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'bio': client_profile.bio,
            'location': client_profile.location,
            'profile_picture': client_profile.profile_picture.url if client_profile.profile_picture else None,
        }
        # client_connections_count = User.get_client_connections(user).count()
        projects = Project.objects.filter(client=user)
        serialized_projects = ProjectSerializer(projects, many=True)
        reviews_ratings = Feedback.objects.filter(to_user=user)
        average_rating = reviews_ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        serialized_reviews = ClientFeedbackSerializer(reviews_ratings, many=True).data


        result = {
            'client_profile': client_profile_details,
            'projects': serialized_projects.data,
            'connection_Count':connection_Count,
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
    

def accept_connection(request, connection_id):
    connection = get_object_or_404(Connection, id=connection_id)
    if connection.to_user == request.user:  # Ensure the logged-in user is the recipient
        connection.accept()
    return redirect('connections')

def reject_connection(request, connection_id):
    connection = get_object_or_404(Connection, id=connection_id)
    if connection.to_user == request.user:  # Ensure the logged-in user is the recipient
        connection.reject()
    return redirect('connections')
