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
from django.db.models import Q, Sum
from django.core.validators import MinValueValidator


class User(AbstractUser):
    ROLE_CHOICES = [
        ('freelancer', 'Freelancer'),
        ('client', 'Client'),
        ('student', 'Student'),
    ]
    
    MEMBERSHIP_CHOICES = [
        ('free', 'Free'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student', db_index=True)
    membership = models.CharField(max_length=10, choices=MEMBERSHIP_CHOICES, default='free')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_profiled = models.BooleanField(default=False)
    is_talentrise = models.BooleanField(default=True)
    nickname = models.CharField(max_length=150, blank=True)

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
        ('draft', 'Draft'),
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

    # Add TalentRise specific fields
    is_talentrise_friendly = models.BooleanField(default=False, 
        help_text="Flag to mark projects suitable for TalentRise students")
    complexity_level = models.CharField(max_length=15, choices=[
        ('entry', 'Entry Level'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ], default='intermediate', 
        help_text="Project complexity level to match with appropriate freelancers")

    payment_strategy = models.CharField(max_length=20, default='automatic')

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

    def get_upcoming_deadlines(self):
        """
        Returns all projects with deadlines within the next week.
        """
        return Project.objects.filter(deadline__lt=timezone.now() + timezone.timedelta(weeks=1)).order_by('deadline')

    def update_payment_strategy(self):
        """Determine payment handling strategy based on milestones"""
        has_task_payment_milestones = self.tasks.filter(
            milestones__milestone_type__in=['payment', 'hybrid']
        ).exists()
        
        has_project_payment_milestones = self.milestones.filter(
            milestone_type__in=['payment', 'hybrid']
        ).exists()

        if has_task_payment_milestones:
            self.payment_strategy = 'task_milestones'
        elif has_project_payment_milestones:
            self.payment_strategy = 'project_milestones'
        else:
            self.payment_strategy = 'lump_sum'
        self.save()

    def get_total_paid(self):
        if self.payment_strategy == 'task_milestones':
            return Milestone.objects.filter(
                task__project=self, 
                status='paid',
                milestone_type__in=['payment', 'hybrid']
            ).aggregate(total=Sum('amount'))['total'] or 0
        elif self.payment_strategy == 'project_milestones':
            return self.milestones.filter(
                status='paid',
                milestone_type__in=['payment', 'hybrid']
            ).aggregate(total=Sum('amount'))['total'] or 0
        else:
            return self.total_spent if self.status == 'completed' else 0

    def get_progress(self):
        """Calculate progress based on completed milestones"""
        total_milestones = self.milestones.filter(milestone_type__in=['progress', 'hybrid']).count()
        completed_milestones = self.milestones.filter(
            status='paid',
            milestone_type__in=['progress', 'hybrid']
        ).count()
        
        # Add task-based milestones if no project milestones
        if total_milestones == 0:
            task_milestones = Milestone.objects.filter(
                task__project=self,
                milestone_type__in=['progress', 'hybrid']
            )
            total_milestones = task_milestones.count()
            completed_milestones = task_milestones.filter(status='paid').count()

        return (completed_milestones / total_milestones * 100) if total_milestones else 0

    def handle_payment(self):
        """Handle automatic payments based on strategy"""
        if self.payment_strategy == 'lump_sum' and self.status == 'completed':
            self._process_lump_sum_payment()
            
    def _process_lump_sum_payment(self):
        """Automatically process final payment for lump-sum projects"""
        if not self.payments.filter(status='paid').exists():
            Payment.objects.create(
                from_user=self.client,
                to_user=self.assigned_to.first(),  # Simplified for example
                payment_for='project',
                project=self,
                amount=self.budget,
                status='paid'
            )
            self.total_spent = self.budget
            self.save()

    @property
    def allows_project_bids(self):
        """Check if bidding on project level is allowed"""
        return not self.tasks.exists()
        
    def get_bidable_tasks(self):
        """Get tasks available for bidding"""
        return self.tasks.filter(
            Q(bids__isnull=True) | 
            Q(task_bids__state__in=['rejected', 'withdrawn'])
        )

# Task Model
class Task(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
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
    is_automated_payment = models.BooleanField(default=False)
    def __str__(self):
        return self.title

    def update_payment_status(self):
        """Update payment status based on milestones or completion"""
        if self.milestones.exists():
            total_due = self.milestones.filter(
                milestone_type__in=['payment', 'hybrid']
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            paid_amount = self.milestones.filter(
                status='paid',
                milestone_type__in=['payment', 'hybrid']
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            self.payment_status = 'completed' if paid_amount >= total_due else 'not_initiated'
        else:
            # Auto-complete payment if no milestones and task is done
            self.payment_status = 'completed' if self.status == 'completed' else 'not_initiated'
            
        self.save()

    def save(self, *args, **kwargs):
        # Original completion logic
        if self.status == 'completed' and not self.milestones.exists():
            self.completed_at = timezone.now()
            if self.payment_status == 'not_initiated':
                self.payment_status = 'completed'
        
        super().save(*args, **kwargs)
        
        # New payment automation logic
        if self.status == 'completed' and not self.milestones.exists():
            self._process_automatic_payment()
        elif self.milestones.exists():
            # If milestones exist, ensure task payment status matches milestone payments
            total_due = self.milestones.aggregate(total=Sum('amount'))['total'] or 0
            paid_amount = self.milestones.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
            self.payment_status = 'completed' if paid_amount >= total_due else 'not_initiated'
            self.save()

        self.project.update_payment_strategy()

    def _process_automatic_payment(self):
        """Handle automatic payment when no milestones exist"""
        if self.payment_status == 'completed' and not self.payments.exists():
            Payment.objects.create(
                from_user=self.project.client,
                to_user=self.assigned_to.first(),
                payment_for='task',
                task=self,
                amount=self.budget,
                status='paid'
            )

    @property
    def open_for_bidding(self):
        """Check if task is available for new bids"""
        return not self.bids.filter(
            state__in=['submitted', 'under_review', 'negotiation']
        ).exists()

class BidManager(models.Manager):
    """
    Custom manager for bid-related queries
    """
    def active_bids(self):
        return self.get_queryset().exclude(
            state__in=['withdrawn', 'rejected', 'archived']
        )

    def for_project(self, project_id):
        return self.filter(project_id=project_id).select_related(
            'freelancer',
            'project'
        ).prefetch_related(
            'items',
            'attachments'
        )

    def freelancer_bids(self, freelancer_id):
        return self.filter(freelancer_id=freelancer_id).order_by('-created_at')

class Bid(models.Model):
    BID_TYPES = (
        ('fixed', 'Fixed Price'),
        ('hourly', 'Hourly Rate'),
        ('milestone', 'Milestone-Based'),
        ('hybrid', 'Hybrid Model'),
    )

    BID_STATES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('negotiation', 'In Negotiation'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    )

    # Core Relationships
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='project_bids'
    )
    tasks = models.ManyToManyField(
        'Task',
        related_name='task_bids',
        blank=True
    )
    freelancer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submitted_bids'
    )
    invited_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='invited_bids'
    )

    # Bid Metadata
    bid_type = models.CharField(max_length=20, choices=BID_TYPES, default='fixed')
    version = models.PositiveIntegerField(default=1)
    parent_bid = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='revisions'
    )
    state = models.CharField(max_length=20, choices=BID_STATES, default='draft')
    is_archived = models.BooleanField(default=False)

    # Financial Details
    total_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='INR')
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    hourly_rate = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Timeline
    proposed_start = models.DateField()
    proposed_end = models.DateField()
    delivery_buffer_days = models.PositiveIntegerField(default=0)

    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_edited_by = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name='modified_bids'
    )

    # Custom Manager
    objects = BidManager()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    Q(project__isnull=False) | Q(project__isnull=True)
                ),
                name='single_bid_target'
            )
        ]
        unique_together = ('project', 'freelancer', 'version')
        indexes = [
            models.Index(fields=['state', 'project', 'freelancer']),
            models.Index(fields=['total_value', 'currency']),
            models.Index(fields=['proposed_start', 'proposed_end']),
        ]

    def __str__(self):
        return f"Bid #{self.id} - {self.get_bid_type_display()} ({self.state})"

    def submit(self):
        """Submit bid with automatic project/task validation"""
        if self.state != 'draft':
            raise ValidationError("Only draft bids can be submitted.")
        
        # Auto-set project from tasks if not set
        if not self.project and self.tasks.exists():
            self.project = self.tasks.first().project
            
        # Final validation before submission
        if self.project and self.project.tasks.exists() and not self.tasks.exists():
            raise ValidationError("Project has tasks - must bid on specific tasks")
            
        if self.tasks.exists() and not self.project:
            raise ValidationError("Tasks must belong to a project")
            
        self.state = 'submitted'
        self.version += 1
        self.save()

    def mark_under_review(self):
        """Mark bid as being reviewed by client"""
        if self.state != 'submitted':
            raise ValidationError("Only submitted bids can be marked as under review.")
        self.state = 'under_review'
        self.save()

    def accept(self):
        """Accept the bid"""
        if self.state not in ['under_review', 'negotiation']:
            raise ValidationError("Only bids under review or in negotiation can be accepted.")
        self.state = 'accepted'
        self.save()

    def reject(self):
        """Reject the bid"""
        if self.state not in ['under_review', 'negotiation']:
            raise ValidationError("Only bids under review or in negotiation can be rejected.")
        self.state = 'rejected'
        self.save()

    def withdraw(self):
        """Withdraw the bid"""
        if self.state not in ['draft', 'submitted', 'under_review', 'negotiation']:
            raise ValidationError("Only draft, submitted, under review, or negotiation bids can be withdrawn.")
        self.state = 'withdrawn'
        self.save()

    def clean(self):
        """Validate bid state transitions and relationships"""
        if self.project and self.tasks.exists():
            raise ValidationError("Cannot set both project and tasks. Choose one.")
        if not self.project and not self.tasks.exists():
            raise ValidationError("Either project or tasks must be set.")
        
        if self.tasks.exists():
            for task in self.tasks.all():
                if task.project != self.project:
                    raise ValidationError("All tasks must belong to the same project.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Call the clean method to ensure validation
        super().save(*args, **kwargs)

class BidItem(models.Model):
    """
    Detailed breakdown of bid components with multiple pricing models
    """
    ITEM_TYPES = (
        ('task', 'Task'),
        ('milestone', 'Milestone'),
        ('service', 'Service'),
        ('material', 'Material'),
    )

    bid = models.ForeignKey(
        Bid,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    task = models.ForeignKey(
        Task,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    description = models.TextField()
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    delivery_days = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['id']
        indexes = [
            models.Index(fields=['item_type', 'bid']),
        ]

    @property
    def total_price(self):
        return self.quantity * self.unit_price * (1 + self.tax_rate/100)


class BidAttachment(models.Model):
    """
    Supporting documents for bids
    """
    bid = models.ForeignKey(
        Bid,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='bid_attachments/')
    description = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class BidNegotiationLog(models.Model):
    """
    Audit trail for bid negotiation history
    """
    bid = models.ForeignKey(
        Bid,
        on_delete=models.CASCADE,
        related_name='negotiation_logs'
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    event_type = models.CharField(max_length=50)
    previous_state = models.CharField(max_length=50)
    new_state = models.CharField(max_length=50)
    note = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['bid', 'timestamp']),
        ]


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

class Milestone(models.Model):
    MILESTONE_TYPE_CHOICES = [
        ('payment', 'Payment Only'),
        ('progress', 'Progress Only'),
        ('hybrid', 'Both Payment & Progress')
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
    ]
    
    title = models.CharField(max_length=255)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True, related_name='milestones')
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, related_name='milestones')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)
    milestone_type = models.CharField(max_length=10, choices=MILESTONE_TYPE_CHOICES, default='hybrid')
    is_automated = models.BooleanField(default=True, help_text="Automatically process payment when approved")

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(project__isnull=False, task__isnull=True) | 
                    models.Q(project__isnull=True, task__isnull=False)
                ),
                name='single_parent_relation'
            )
        ]
        ordering = ['due_date']

    def clean(self):
        if not (self.project or self.task):
            raise ValidationError("Must be associated with a project or task")
        if self.project and self.task:
            raise ValidationError("Cannot belong to both project and task")
        if self.milestone_type == 'progress' and self.amount > 0:
            raise ValidationError("Progress-only milestones cannot have payment amounts")
        
        # Ensure parent project/task doesn't have conflicting milestone types
        parent = self.project or self.task
        if parent and hasattr(parent, 'payment_strategy'):
            if parent.payment_strategy == 'lump_sum' and self.milestone_type in ['payment', 'hybrid']:
                raise ValidationError("Cannot add payment milestones to lump-sum projects")

    def __str__(self):
        return f"{self.title} ({self.get_milestone_type_display()})"

    def mark_paid(self):
        if self.status != 'paid':
            self.status = 'paid'
            self.completed_at = timezone.now()
            self.save()
            self._update_parent_payment()
            
            # Prevent double payment by clearing task/project automated payment
            if self.task and self.task.payment_status == 'completed':
                self.task.payment_status = 'not_initiated'
                self.task.save()
            if self.project and self.project.payment_status == 'completed':
                self.project.payment_status = 'not_initiated'
                self.project.save()

    def _update_parent_payment(self):
        """Update parent project/task payment status"""
        if self.task:
            self.task.update_payment_status()
            self.task.project.update_payment_strategy()
        elif self.project:
            self.project.update_payment_strategy()

