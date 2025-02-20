from django.db import models
from django.contrib.auth.models import AbstractUser

# User Model
class User(AbstractUser):
    ROLE_CHOICES = [
        ('freelancer', 'Freelancer'),
        ('client', 'Client'),
    ]
    
    MEMBERSHIP_CHOICES = [
        ('free', 'Free'),
        ('premium', 'Premium'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='freelancer')
    membership = models.CharField(max_length=10, choices=MEMBERSHIP_CHOICES, default='free')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_profiled = models.BooleanField(default=False)

# Connection Model
class Connection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    from_user = models.ForeignKey(User, related_name='connections_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='connections_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Category Model
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
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

# Project Model
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

    title = models.CharField(max_length=255)
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
    assigned_to = models.ForeignKey(User, related_name='assigned_tasks', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='not_initiated')
    is_payment_updated = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    skills_required_for_task = models.ManyToManyField(Skill, related_name='tasks', blank=True)

# Payment Model
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('GPAY', 'Google Pay'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    STATUS_CHOICES = [
        ('paid', 'Paid'),
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
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    invoice_number = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=10, default='INR')
    installment_period = models.CharField(max_length=50, blank=True, null=True)
    discount_promo = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
