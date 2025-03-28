from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Project, User
from core.models import Skill
from .models import Event
from django.db.models import Count, Avg
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from Profile.models import VerificationDocument
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from Profile.serializers import ClientProfilePartialUpdateSerializer

class CHomePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        active_projects = Project.objects.filter(client=user, status='ongoing').count()
        total_spent = sum(project.total_spent for project in Project.objects.filter(client=user))
        pending_tasks = sum(project.get_pending_tasks() for project in Project.objects.filter(client=user))

        # Fetch trending skills
        trending_skills = Skill.objects.annotate(
            demand=Count('projects') + Count('tasks')  # Count projects and tasks associated with each skill
        ).order_by('-demand')[:5]
        # Fetch top freelancers
        top_freelancers = User.objects.filter(role='freelancer').annotate(avg_rating=Avg('freelancer_profile__average_rating')).order_by('-avg_rating')[:5]

        # Fetch recent success stories
        success_stories = Project.objects.filter(status='completed').order_by('-created_at')[:5]
        
        response_data = {
            'active_projects': active_projects,
            'total_spent': total_spent,
            'pending_tasks': pending_tasks,
            'trending_skills': [{'name': skill.name, 'demand': skill.demand} for skill in trending_skills],
            'top_freelancers': [
                {
                    'id': freelancer.id,
                    'name': freelancer.username,
                    'rating': freelancer.freelancer_profile.average_rating,
                    'avatar': freelancer.freelancer_profile.profile_picture.url if freelancer.freelancer_profile.profile_picture else None
                } for freelancer in top_freelancers
            ],
            'success_stories': [
                {
                    'title': project.title,
                    'description': project.description,
                    'budget': project.budget,
                    'freelancers': [{'id': freelancer.id, 'username': freelancer.username} for freelancer in project.assigned_to.all()]
                } for project in success_stories
            ],
        }

        return Response(response_data)
