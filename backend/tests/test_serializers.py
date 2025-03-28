from django.test import TestCase
from core.models import Project, Task, Milestone, Skill, Category, User
from core.serializers import ProjectSerializer, TaskSerializer

class SerializerTests(TestCase):
    def test_project_serializer(self):
        user = User.objects.create(username="testuser")
        category = Category.objects.create(name="Test Category")
        project = Project.objects.create(
            title="Test Project",
            description="Test Description",
            budget=100,
            deadline="2025-01-01",
            client=user,
            domain=category
        )
        serializer = ProjectSerializer(project)
        print(serializer.data)  # Should trigger debug prints 