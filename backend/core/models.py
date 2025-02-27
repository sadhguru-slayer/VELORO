from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db import models, transaction
from decimal import Decimal, ROUND_HALF_UP
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
# User Model
from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.db.models import Q

class User(AbstractUser):
    ROLE_CHOICES = [
        ('freelancer', 'Freelancer'),
        ('client', 'Client'),
    ]
    
    MEMBERSHIP_CHOICES = [
        ('free', 'Free'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='freelancer',db_index=True)
    membership = models.CharField(max_length=10, choices=MEMBERSHIP_CHOICES, default='free')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_profiled = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    
    def get_client_connections(self):
        # Get the total number of accepted connections (both sent and received)
        sent_connections = Connection.objects.filter(from_user=self, status='accepted')
        received_connections = Connection.objects.filter(to_user=self, status='accepted')

        return sent_connections.count() + received_connections.count()

class Connection(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
        ordering = ['-created_at']

    def __str__(self):
        return f"Connection from {self.from_user.username} to {self.to_user.username} ({self.status})"

    def clean(self):
        # Ensure a user cannot connect to themselves
        if self.from_user == self.to_user:
            raise ValidationError("You cannot connect to yourself.")
        
        # Ensure reverse connections do not exist (e.g., A -> B and B -> A)
        if Connection.objects.filter(from_user=self.to_user, to_user=self.from_user, status='pending').exists():
            raise ValidationError("You cannot send a connection request to a user who has already sent you one.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Call the clean method to ensure validation
        super().save(*args, **kwargs)

    def accept(self):
        self.status = 'accepted'
        self.save()

    def reject(self):
        self.status = 'rejected'
        self.save()

    def cancel(self):
        self.delete()  # Cancel and delete the connection request

# Category Model
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True,db_index=True)
    description = models.TextField()

    def __str__(self):
        return self.name
    

# Skill Model
class Skill(models.Model):
    category = models.ForeignKey(Category, related_name='skills', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()

    def __str__(self):
        return f'{self.name} in {self.category.name}' 

class Project(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('not_initiated', 'Not Initiated'),
        ('paid', 'Paid'),
    ]

    title = models.CharField(max_length=255,db_index=True)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    client = models.ForeignKey(User, related_name='projects', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    domain = models.ForeignKey(Category, related_name='projects', on_delete=models.CASCADE)
    is_collaborative = models.BooleanField(default=False)
    isSubscribed = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='not_initiated')
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    skills_required = models.ManyToManyField(Skill, related_name='projects', blank=True)
    assigned_to = models.ManyToManyField(User,related_name='projects_assigned',blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['description']),
        ]

    def get_pending_tasks(self):
        """
        Returns all tasks that are currently 'pending' and not 'completed' for this project.
        """
        tasks = Task.objects.filter(project=self.id, status='pending').count()
        return tasks

    def __str__(self):
        return self.title

    def get_pending_projects(self):
        """
        Returns all projects that are currently 'pending' for this client.
        """
        return Project.objects.filter(status='pending', client=self.client)

# Task Model
class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('not_initiated', 'Not Initiated'),
        ('completed', 'Completed'),
    ]
    
    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    assigned_to = models.ManyToManyField(User, related_name='assigned_tasks',  blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='not_initiated')
    is_payment_updated = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    skills_required_for_task = models.ManyToManyField(Skill, related_name='tasks', blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == 'completed' and not self.is_payment_updated:
            self.completed_at = timezone.now()  # Mark the time when the task is completed
        super().save(*args, **kwargs)

# Payment Model
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('GPAY', 'Google Pay'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
    ]
    
    from_user = models.ForeignKey(User, related_name='payments_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='payments_received', on_delete=models.CASCADE)
    payment_for = models.CharField(max_length=50)  # e.g., task, project
    project = models.ForeignKey(Project, related_name='payments', on_delete=models.SET_NULL, null=True, blank=True)
    task = models.ForeignKey(Task, related_name='payments', on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='initiated')
    invoice_number = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=10, default='INR')
    installment_period = models.CharField(max_length=50, blank=True, null=True)
    discount_promo = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Ensure atomicity of the payment process
        with transaction.atomic():
            # Handle 'paid' status
            if self.status == 'paid':
                if self.task and self.task.status == "completed" and self.amount <= self.task.budget:
                    print("hiii")
                    self.task.is_payment_updated = True
                    self.task.payment_status = "completed"
                    self.task.save()

                    # Update the project's total spent
                    self.project.total_spent += self.amount
                    self.project.save()

                elif self.project and self.project.status == 'completed' and self.amount <= self.project.budget:
                    self.project.payment_status = "completed"
                    self.project.total_spent += self.amount
                    self.project.save()

            # Always call the parent save method after all logic is processed
            super().save(*args, **kwargs)

class UserFeedback(models.Model):
    from_user = models.ForeignKey(User, related_name='given_feedback', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_feedback', on_delete=models.CASCADE)

    rating = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)], default=5)
    feedback_type = models.CharField(max_length=50, choices=[
        ('collaboration', 'Collaboration'),
        ('work_quality', 'Work Quality'),
        ('communication', 'Communication'),
        ('timeliness', 'Timeliness'),
        ('professionalism', 'Professionalism'),
    ])
    
    # Detailed comment or review
    comment = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optionally, approval or flagging of feedback (e.g., for moderation purposes)
    is_approved = models.BooleanField(default=True)
    
    # Reference to parent feedback if it's a reply to another feedback
    parent = models.ForeignKey('self', related_name='replies', null=True, blank=True, on_delete=models.CASCADE)
    
    # Method to return a readable string representation of the feedback
    def __str__(self):
        return f"Feedback from {self.from_user.username} to {self.to_user.username} ({self.feedback_type})"
    
    class Meta:
        unique_together = ('from_user', 'to_user', 'feedback_type')  # Enforce one feedback per user pair and type
        ordering = ['-created_at']  # Order feedback by most recent
    


class Notification(models.Model):
    TYPE_CHOICES = [
        ('Messages', 'Messages'),
        ('Payments', 'Payments'),
        ('Projects', 'Projects'),
        ('Events', 'Events'),
        ('Projects & Tasks', 'Projects & Tasks'),
        ('Connections', 'Connections'),
        ('System', 'System'),
        ('Collaborations', 'Collaborations'),
    ]
    title = models.CharField(null=True,max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    related_model_id = models.PositiveIntegerField()
    notification_text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.notification_text}"

    def mark_as_read(self):
        self.is_read = True
        self.save()

