from django.shortcuts import render,get_object_or_404
# Create your views here.
from rest_framework import viewsets,status
from .serializers import EventSerializer,ActivitySerializer
from .models import Event,Activity
from core.models import Project
from core.serializers import ProjectSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_event(self, request):
        user = request.user
        event_data = request.data.copy() 
        event_data['user'] = user.id  

        serializer = self.get_serializer(data=event_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)

    @action(detail=False,methods=['get'],permission_classes=[IsAuthenticated])
    def get_events(self, request):
        user = request.user

        events = Event.objects.filter(user=user)

        serializer = self.get_serializer(events, many=True)

        return Response(serializer.data)    
    
    @action(detail=False,methods=['put'],permission_classes=[IsAuthenticated])
    def update_event(self,request):
        user = request.user
        event = get_object_or_404(Event,id=request.data.get('id'))
        if event.user != user:
            return Response({'error':'You are not the owner of this event'},status=403)
        event_data = request.data.copy()
        serializer = EventSerializer(event,data=event_data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=False,methods=['post','delete'],permission_classes=[IsAuthenticated])
    def delete_event(self,request):
        user = request.user
        event = get_object_or_404(Event, id=request.data.get('id'))
        if event.user!= user:
            return Response({'error':'You are not the owner of this event'},status=403)
        event.delete()
        return Response({'message':'Event deleted successfully'},status=status.HTTP_200_OK)
    
class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch the most recent activities for the authenticated user
        activities = Activity.objects.filter(user=request.user).all()[:5]
        
        # Create the response data based on the activities fetched
        activity_data = [
            {
                'activity_type': activity.activity_type,
                'description': activity.description,
                'timestamp': activity.timestamp,
                'related_model': activity.related_model,
                'related_object_id': activity.related_object_id
            }
            for activity in activities
        ]
        
        # Return the data in a Response object
        return Response(activity_data, status=200)
    
    

class PostedProjects(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        projects = Project.objects.filter(client=user)
        
        serialized_projects = ProjectSerializer(projects, many=True)
        
        return Response(serialized_projects.data, status=200)