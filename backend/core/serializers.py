from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ConnectionSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField()

    to_user = serializers.StringRelatedField()

    class Meta:
        model = Connection
        fields = ['from_user', 'to_user', 'status']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Optional: Include additional user fields in the JWT token, e.g., role
        user = self.user
        data['role'] = user.role  # Add role to the response payload
        return data
    

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'  # Assuming Skill has fields 'id' and 'name'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'  # Assuming Category has fields 'id' and 'name'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Assuming User has fields 'id', 'username', 'email'

class ProjectSerializer(serializers.ModelSerializer):
    # Assuming the serializers for User, Category, and Skill are correct
    client = UserSerializer(read_only=True)
    domain = CategorySerializer(read_only=True)
    skills_required = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'budget', 'deadline', 
            'client', 'domain', 'is_collaborative', 'skills_required','status'
        ]


class TaskSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    skills_required_for_task = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'title', 'description', 'budget', 'deadline', 
            'assigned_to', 'created_at', 'status', 'payment_status', 
            'is_payment_updated', 'completed_at', 'skills_required_for_task'
        ]




class TaskCreateSerializer(serializers.ModelSerializer):
    skills_required_for_task = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)

    class Meta:
        model = Task
        fields = ['title', 'description', 'budget', 'deadline', 'status', 'skills_required_for_task']



class ProjectCreateSerializer(serializers.ModelSerializer):
    tasks = TaskCreateSerializer(many=True, required=False)
    skills_required = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)

    class Meta:
        model = Project
        fields = ['title', 'description', 'budget', 'deadline', 'domain', 'is_collaborative', 'skills_required', 'tasks']

    def create(self, validated_data):
        tasks_data = validated_data.pop('tasks', [])
        skills_data = validated_data.pop('skills_required', [])
        
        # Create the project instance
        project = Project.objects.create(**validated_data)

        # Now create the tasks if provided
        for task_data in tasks_data:
            Task.objects.create(project=project, **task_data)

        return project

class SpendingDistributionByProjectSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.title')  # Get the project title
    task_title = serializers.CharField(source='task.title', required=False)  # Get the task title (may not exist)
    task_id = serializers.IntegerField(source='task.id', required=False)  # Get the task ID (may not exist)
    project_id = serializers.IntegerField(source='project.id')  # Get the project ID
    
    from_user = serializers.StringRelatedField()  # or use PrimaryKeyRelatedField if only ID is needed
    to_user = serializers.StringRelatedField()    # same as above
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    status = serializers.ChoiceField(choices=Payment.STATUS_CHOICES)
    payment_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")  # Customize as needed
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=10)
    installment_period = serializers.CharField(max_length=50, required=False)
    discount_promo = serializers.CharField(max_length=50, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Payment
        fields = [
            'from_user', 'to_user', 'project_name', 'task_title', 'task_id', 'project_id', 'amount', 
            'payment_method', 'status', 'payment_date', 'currency', 'installment_period', 'discount_promo', 
            'notes', 'invoice_number', 'transaction_id'
        ]
