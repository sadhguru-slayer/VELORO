from django.shortcuts import render,get_object_or_404
# Create your views here.
from .serializers import EventSerializer,ActivitySerializer
from core.serializers import ProjectSerializer,TaskSerializer,SpendingDistributionByProjectSerializer
from .models import Event,Activity
from core.models import Project,Task,Payment
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework import viewsets,status,generics
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncWeek, TruncYear,ExtractWeekDay
import calendar
from datetime import timedelta

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

            # Create Activity for event creation
            Activity.objects.create(
                user=user,
                activity_type='event_created',
                description=f'Created Event: {serializer.validated_data["title"]}',
                related_model='event',
                related_object_id=serializer.instance.id
            )

            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def get_events(self, request):
        user = request.user
        events = Event.objects.filter(user=user)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)    
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_event(self, request):
        user = request.user
        event = get_object_or_404(Event, id=request.data.get('id'))
        
        if event.user != user:
            return Response({'error': 'You are not the owner of this event'}, status=403)

        event_data = request.data.copy()
        serializer = EventSerializer(event, data=event_data, partial=True)
        
        if serializer.is_valid():
            serializer.save()

            # Create Activity for event update
            Activity.objects.create(
                user=user,
                activity_type='event_updated',
                description=f'Updated Event: {serializer.validated_data["title"]}',
                related_model='event',
                related_object_id=serializer.instance.id
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=False, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def delete_event(self, request):
        user = request.user
        event = get_object_or_404(Event, id=request.data.get('id'))

        if event.user != user:
            return Response({'error': 'You are not the owner of this event'}, status=403)

        # Create Activity for event deletion before deleting
        Activity.objects.create(
            user=user,
            activity_type='event_deleted',
            description=f'Deleted Event: {event.title}',
            related_model='event',
            related_object_id=event.id
        )

        event.delete()

        return Response({'message': 'Event deleted successfully'}, status=status.HTTP_200_OK)
    
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


class ActivityListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Activity.objects.filter(user=self.request.user)
        
        # Exclude activities with activity_type 'project' or 'payment'
        queryset = queryset.exclude(related_model__in=['project', 'payment']).order_by('-timestamp')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class SpecifiedActivityListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Activity.objects.filter(user=self.request.user)
        # Filter by activity type if specified
        activity_type = self.request.query_params.get('activity_type', None)
        if activity_type:
            queryset = queryset.filter(related_model=activity_type).order_by('-timestamp')
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    

class PostedProjects(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        projects = Project.objects.filter(client=user).order_by('-created_at')
        
        serialized_projects = ProjectSerializer(projects, many=True)
        
        return Response(serialized_projects.data, status=200)
    
class DashBoard_Overview(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        projects = Project.objects.filter(client=user).order_by('-created_at')
        project_summary = ProjectSerializer(projects[:8], many=True).data 
        pending_tasks_count = 0
        total_spent = 0
        total_projects_last_month = 0
        completed_ahead_of_deadline = 0
        today = timezone.now()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        end_of_last_month = today.replace(day=1) - timedelta(days=1)
        for project in projects:
            pending_tasks_count += project.get_pending_tasks()
            total_spent += project.total_spent        
            tasks_last_month = Task.objects.filter(
                project=project, 
                deadline__gte=start_of_last_month, 
                deadline__lte=end_of_last_month,
                status='completed'
            )
            total_projects_last_month += 1
            for task in tasks_last_month:
                if task.completed_date and task.completed_date < task.deadline:
                    completed_ahead_of_deadline += 1
        if total_projects_last_month > 0:
            projects_ahead_percentage = (completed_ahead_of_deadline / total_projects_last_month) * 100
        else:
            projects_ahead_percentage = 0
        active_projects_count = Project.get_active_projects(client=user)       
        nearest_deadlines = get_nearest_deadlines(user)
        recent_activities = get_recent_activities(user,5)
        client_username = {
            'username': user.username,
        }        
        data = {
            'active_projects': active_projects_count,
            'pending_tasks': pending_tasks_count,
            'total_spent': total_spent,
            'project_summary': project_summary,
            'nearest_deadlines': nearest_deadlines,
            'recent_activities': recent_activities,
            'tasks_due_this_week': Task.objects.filter(
                project__client=user, 
                deadline__gte=start_of_week, 
                deadline__lte=start_of_week + timedelta(days=7)
            ).count(),
            'projects_completed_ahead_last_month': projects_ahead_percentage,
            'client_username':client_username,
        }
        
        return Response(data)

# Get nearest deadlines function
def get_nearest_deadlines(client):
    projects_with_deadlines = Project.objects.filter(client=client, deadline__gte=timezone.now()).order_by('deadline').values('id', 'title','deadline')[:4]
    tasks_with_deadlines = Task.objects.filter(
            project__client=client,
            deadline__gte=timezone.now()
        ).order_by('deadline').values('id', 'title','deadline')[:4]
    
    deadlines = []

    if projects_with_deadlines:
        for project in projects_with_deadlines:
            deadlines.append({
                'id': project['id'],
                'title':project['title'],
                'deadline': project['deadline'],
                'type': 'project',
            })
    if tasks_with_deadlines:
        for task in tasks_with_deadlines:
            deadlines.append({
                'id': task['id'],
                'title':task['title'],
                'deadline': task['deadline'],
                'type': 'task',
            })
    deadlines.sort(key=lambda x: x['deadline'])
    return deadlines

# Get recent activities function
def get_recent_activities(user, limit=None):
    if limit:
        recent_activities = Activity.objects.filter(user=user).order_by('-timestamp')[:limit]
    else:
        recent_activities = Activity.objects.filter(user=user).order_by('-timestamp')
    
    activities_data = []
    for activity in recent_activities:
        activities_data.append(ActivitySerializer(activity).data)
    
    return activities_data


class SpendingDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        time_frame = request.GET.get('time_frame', 'monthly')
        data = get_spending_data(user, time_frame)
        return Response(data)
    
class SpendingDistributionByProject(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SpendingDistributionByProjectSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(from_user=user).order_by('-payment_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=200)



def get_spending_data(user, time_frame='monthly'):
    if time_frame == 'weekly':
        start_of_week = timezone.now() - timezone.timedelta(days=timezone.now().weekday())
        payments = Payment.objects.filter(from_user=user, payment_date__gte=start_of_week)

        spending_data = (
            payments.annotate(weekday=ExtractWeekDay('payment_date'))
                    .values('weekday')
                    .annotate(total_spent=Sum('amount')) 
                    .order_by('weekday')
        )

        labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        chart_data = {
            'labels': labels,
            'datasets': [
                {
                    'label': 'Spend Over Time',
                    'data': [0] * 7, 
                    'borderColor': 'rgba(75,192,192,1)',
                    'fill': False,
                },
            ],
        }

        for entry in spending_data:
            day_index = entry['weekday'] - 1
            chart_data['datasets'][0]['data'][day_index] = entry['total_spent'] or 0

        weekly = chart_data

        return weekly

    elif time_frame == 'monthly':
        payments = Payment.objects.filter(from_user=user)

        spending_data = (
            payments.annotate(month=TruncMonth('payment_date'))
                    .values('month')
                    .annotate(total_spent=Sum('amount'))
                    .order_by('month')
        )

        months = [calendar.month_name[i] for i in range(1, 13)]

        chart_data = {
            'labels': months,
            'datasets': [
                {
                    'label': 'Spend Over Time',
                    'data': [0] * 12, 
                    'borderColor': 'rgba(75,192,192,1)',
                    'fill': False,
                },
            ],
        }

        for entry in spending_data:
            month_name = entry['month'].strftime('%B')
            month_index = months.index(month_name)
            chart_data['datasets'][0]['data'][month_index] = entry['total_spent'] or 0

        monthly = chart_data

        return monthly


    elif time_frame == 'yearly':
        payments = Payment.objects.filter(from_user=user)

        spending_data = (
            payments.annotate(year=TruncYear('payment_date')) 
                    .values('year')
                    .annotate(total_spent=Sum('amount'))  # Sum the payment amounts for each year
                    .order_by('year')
        )
        # Extract the starting year and the current year as integers
        start_year = min([entry['year'].year for entry in spending_data])  # Extract year from datetime
        current_year = timezone.now().year  # Get the current year
        labels = [str(year) for year in range(start_year, current_year + 1)]  # Use year range

    else:
        return {'error': 'Invalid time frame. Choose from "weekly", "monthly", or "yearly."'}

    chart_data = {
        'labels': labels,
        'datasets': [
            {
                'label': 'Spend Over Time',
                'data': [entry['total_spent'] or 0 for entry in spending_data],
                'borderColor': 'rgba(75,192,192,1)',
                'fill': False,
            },
        ],
    }

    return chart_data
