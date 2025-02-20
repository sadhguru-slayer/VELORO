from django.db import models
from django.conf import settings
from core.models import Skill,Project,Category,User
from django.db.models import Avg,F
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

class PaymentHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    status_choices = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='pending')
    transaction_id = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}"

class FreelancerReview(models.Model):
    from_client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="from_client", null=True)
    to_freelancer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="to_freelancer", null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Using a transaction to ensure atomic updates
        with transaction.atomic():
            # Save the review first
            super().save(*args, **kwargs)
            
            # Lock the freelancer profile row for updates (avoiding race conditions)
            try:
                freelancer_profile = FreelancerProfile.objects.select_for_update().get(user=self.to_freelancer)
            except ObjectDoesNotExist:
                # Handle the case where the profile does not exist
                raise ValueError(f"Freelancer profile for {self.to_freelancer} does not exist.")

            # Add this review to the freelancer's profile
            freelancer_profile.reviews.add(self)

            # Recalculate freelancer's average rating
            freelancer_profile.calculate_average_rating()

    def __str__(self):
        return f"Review from {self.from_client.username} for {self.project.title}"


class Feedback(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="from_user", null=True)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="to_user", null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_reply = models.BooleanField(default=False)
    parent_feedback = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='replies',
        null=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        # Only execute the profile update logic if it's NOT a reply
        if not self.is_reply:
            super().save(*args, **kwargs)  # Save first to ensure the instance is created and has an ID
            if not self.parent_feedback:
                # Add profile update logic here, e.g., for calculating ratings and updating profiles
                role = User.objects.get(id=self.to_user.id).role
                if role == 'client':
                    client_profile = ClientProfile.objects.get(user=self.to_user)
                    client_profile.calculate_average_rating()
                else:
                    freelancer_profile = FreelancerProfile.objects.get(user=self.to_user)
                    freelancer_profile.calculate_average_rating()
        else:
            super().save(*args, **kwargs)  # Just save the instance without any profile update logic if it's a reply    

# Extending User model to create a client profile
class ClientProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="client_profile")
    location = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    dob = models.DateField(null=True, blank=True)  # Date of Birth
    bio = models.CharField(max_length=500,null=True)
    description = models.TextField(null=True)
    # Bank Info
    bank_name = models.CharField(max_length=255,null=True, blank=True)
    bank_account_number = models.CharField(max_length=20,null=True, blank=True)
    bank_ifsc = models.CharField(max_length=15,null=True, blank=True)
    bank_verified = models.BooleanField(default=False)
    # ID Proof
    id_proof = models.ImageField(upload_to='id_proofs/', null=True, blank=True)
    id_verified = models.BooleanField(default=False)

    # Company Info (Optional)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    company_registration_number = models.CharField(max_length=50, blank=True, null=True)

    # Project Stats
    successful_projects = models.PositiveIntegerField(default=0)
    all_projects_posted = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    # Client Records
    honesty_score = models.PositiveIntegerField(default=0)
    payment_history = models.ManyToManyField(PaymentHistory, blank=True, related_name="client_profiles")
    

    def __str__(self):
        return f"{self.user.username} - Client Profile"


    def update_project_count(self, increment=True):
        if increment:
            self.all_projects_posted += 1
        self.save()

    def update_successful_projects(self, increment=True):
        if increment:
            self.successful_projects += 1
        self.save()

# Extending User model to create a freelancer profile
class FreelancerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="freelancer_profile")

    # Basic Info
    location = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    category = models.ForeignKey(Category,on_delete=models.CASCADE,null=True)
    dob = models.DateField(null=True, blank=True)  # Date of Birth
    bio = models.CharField(max_length=500,null=True)
    description = models.TextField(null=True)
    # Bank Info
    bank_name = models.CharField(max_length=255)
    bank_account_number = models.CharField(max_length=20)
    bank_ifsc = models.CharField(max_length=15)
    card_number = models.CharField(max_length=200,null=True)
    expiry_date = models.CharField(max_length=300,null=True,blank=True)
    cvv = models.CharField(max_length=200,null=True)
    bank_verified = models.BooleanField(default=False)
    # ID Proof
    id_proof = models.ImageField(upload_to='id_proofs/', null=True, blank=True)
    id_verified = models.BooleanField(default=False)

    # Company Info (Optional)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    company_registration_number = models.CharField(max_length=50, blank=True, null=True)

    # Freelancer Stats
    skills = models.ManyToManyField(Skill, related_name="freelancers", blank=True)  # Skills related to freelancer
    number_of_completed_tasks = models.PositiveIntegerField(default=0)
    total_tasks_assigned = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    # Portfolio
    portfolio_url = models.URLField(blank=True, null=True)
    portfolio_description = models.TextField(blank=True, null=True)

    # Freelancer Records
    honesty_score = models.PositiveIntegerField(default=0)
    payment_history = models.ManyToManyField(PaymentHistory, blank=True, related_name="freelancer_profiles")


    def __str__(self):
        return f"{self.user.username} - Freelancer Profile"
    
    def update_task_count(self, increment=True):
        if increment:
            self.number_of_completed_tasks += 1
        self.save()

    
