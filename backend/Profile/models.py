from django.db import models
from django.conf import settings
from core.models import Skill,Project,Category
from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator, RegexValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

User = get_user_model()  # This will point to your custom User model if defined

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

# Common Models for both Client and Freelancer
class Address(models.Model):
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    address_type = models.CharField(max_length=20, choices=[
        ('registered', 'Registered'),
        ('billing', 'Billing'),
        ('shipping', 'Shipping')
    ], default='registered')
    is_primary = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)

    def clean(self):
        # Add any custom validation logic here
        if not self.street_address or not self.city or not self.state or not self.country or not self.postal_code:
            raise ValidationError("All address fields are required")

class BankDetails(models.Model):
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11, validators=[
        RegexValidator(regex='^[A-Z]{4}0[A-Z0-9]{6}$')
    ])
    account_holder_name = models.CharField(max_length=255)
    branch_name = models.CharField(max_length=255, null=True, blank=True)
    swift_code = models.CharField(max_length=11, null=True, blank=True)
    verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    primary = models.BooleanField(default=False)


class VerificationDocument(models.Model):
    document_type = models.CharField(max_length=50, choices=[
        ('id_proof', 'ID Proof'),
        ('address_proof', 'Address Proof'),
        ('pan_card', 'PAN Card'),
        ('gst_certificate', 'GST Certificate'),
        ('company_registration', 'Company Registration'),
        ('bank_statement', 'Bank Statement'),
        ('professional_certificate', 'Professional Certificate')
    ])
    document_number = models.CharField(max_length=50)
    document_file = models.ImageField(upload_to='verification_docs/', max_length=255)
    verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    verification_notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.document_type} - {self.document_number}"

class CompanyDetails(models.Model):
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=50)
    registration_date = models.DateField()
    company_type = models.CharField(max_length=50)
    industry = models.CharField(max_length=100)
    website = models.URLField(null=True, blank=True)
    gst_number = models.CharField(max_length=15, null=True, blank=True)
    pan_number = models.CharField(max_length=10)
    annual_turnover = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    employee_count = models.IntegerField(null=True, blank=True)
    verified = models.BooleanField(default=False)

# Enhanced ClientProfile Model
class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="client_profile")
    
    # Basic Information (all optional)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    cover_photo = models.ImageField(upload_to='cover_photos/', null=True, blank=True)
    bio = models.CharField(max_length=500, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], null=True, blank=True)

    # Contact Information (make optional with validation in forms/views)
    primary_email = models.EmailField(null=True, blank=True)  # Changed from unique=True
    secondary_email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, validators=[
        RegexValidator(regex=r'^\+?1?\d{9,15}$')
    ], null=True, blank=True)  # Made optional
    alternate_phone = models.CharField(max_length=15, null=True, blank=True)
    
    # Relationships (already optional through M2M)
    addresses = models.ManyToManyField(Address, related_name='client_addresses', blank=True)
    bank_details = models.OneToOneField(
        BankDetails, 
        on_delete=models.SET_NULL, 
        related_name='client_bank', 
        null=True, 
        blank=True
    )
    verification_documents = models.ManyToManyField(VerificationDocument, 
                                                  related_name='client_documents', 
                                                  blank=True)
    company = models.ForeignKey(CompanyDetails, related_name='company_details', on_delete=models.SET_NULL, 
                               null=True, blank=True)

    # Business Preferences (all optional)
    project_preferences = models.JSONField(null=True, blank=True)
    preferred_payment_method = models.CharField(max_length=50, null=True, blank=True)
    budget_range = models.CharField(max_length=50, null=True, blank=True)
    
    # Security & Verification (with defaults)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    identity_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    # Legal & Compliance (with defaults)
    terms_accepted = models.BooleanField(default=False)
    privacy_policy_accepted = models.BooleanField(default=False)
    terms_acceptance_date = models.DateTimeField(null=True, blank=True)
    legal_agreements = models.JSONField(null=True, blank=True)
    
    # Statistics & Metrics (with defaults)
    total_projects_posted = models.PositiveIntegerField(default=0)
    successful_projects = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    response_rate = models.FloatField(default=0)
    payment_reliability_score = models.IntegerField(default=0)

    # Profile Status (with defaults)
    profile_status = models.CharField(
        max_length=20, 
        choices=[
            ('incomplete', 'Incomplete'),
            ('pending_verification', 'Pending Verification'),
            ('active', 'Active'),
            ('suspended', 'Suspended'),
            ('blocked', 'Blocked')
        ],
        default='incomplete'
    )
    profile_completion_percentage = models.IntegerField(default=0)
    account_tier = models.CharField(max_length=20, default='basic')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)

    # Keep the id_verified field and add two_factor_enabled as a new field
    id_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Client Profile"
        verbose_name_plural = "Client Profiles"

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

# First, let's create the Institution model
class Institution(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=50, null=True, blank=True)
    type = models.CharField(max_length=50, choices=[
        ('university', 'University'),
        ('college', 'College'),
        ('institute', 'Institute'),
        ('school', 'School')
    ])
    location = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    website = models.URLField(null=True, blank=True)
    accreditation = models.CharField(max_length=255, null=True, blank=True)
    ranking = models.IntegerField(null=True, blank=True)
    established_year = models.IntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    verified = models.BooleanField(default=False)
    
    # Contact Information
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    # Social Media Links
    linkedin = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)

    class Meta:
        verbose_name = "Institution"
        verbose_name_plural = "Institutions"

    def __str__(self):
        return self.name

# Education related models
class Department(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    head_of_department = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Course(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    duration = models.IntegerField(help_text="Duration in years")
    description = models.TextField(null=True, blank=True)
    degree_level = models.CharField(max_length=50, choices=[
        ('certificate', 'Certificate'),
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor'),
        ('master', 'Master'),
        ('doctorate', 'Doctorate')
    ])

    def __str__(self):
        return f"{self.code} - {self.name}"

class Education(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=10, null=True, blank=True)
    verified = models.BooleanField(default=False)
    additional_info = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.course.name} at {self.institution.name}"

class Certification(models.Model):
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, null=True, blank=True)
    credential_url = models.URLField(null=True, blank=True)
    verified = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"

    def __str__(self):
        return self.name

class PortfolioItem(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    project_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to='portfolio/', null=True, blank=True)
    technologies_used = models.JSONField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    verified = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Portfolio Item"
        verbose_name_plural = "Portfolio Items"

    def __str__(self):
        return self.title

# Enhanced FreelancerProfile Model
class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="freelancer_profile")
    
    # Basic Information (all optional)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    cover_photo = models.ImageField(upload_to='cover_photos/', null=True, blank=True)
    bio = models.CharField(max_length=500, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], null=True, blank=True)

    # Contact Information (optional with validation)
    primary_email = models.EmailField(null=True, blank=True)
    secondary_email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, validators=[
        RegexValidator(regex=r'^\+?1?\d{9,15}$')
    ], null=True, blank=True)
    alternate_phone = models.CharField(max_length=15, null=True, blank=True)
    
    # Relationships
    addresses = models.ManyToManyField(Address, related_name='freelancer_addresses', blank=True)
    bank_details = models.OneToOneField(
        BankDetails, 
        on_delete=models.SET_NULL, 
        related_name='freelancer_bank', 
        null=True, 
        blank=True
    )
    verification_documents = models.ManyToManyField(VerificationDocument, 
                                                  related_name='freelancer_documents', 
                                                  blank=True)
    company = models.ForeignKey(CompanyDetails, 
                              related_name='freelancer_company', 
                              on_delete=models.SET_NULL, 
                              null=True, 
                              blank=True)

    # Professional Information (freelancer-specific)
    title = models.CharField(max_length=100, null=True, blank=True)
    skills = models.ManyToManyField(Skill, related_name="freelancer_skills", blank=True)
    experience_years = models.FloatField(null=True, blank=True)
    education = models.ManyToManyField(Education, related_name='freelancer_education', blank=True)
    certifications = models.ManyToManyField(Certification, related_name='freelancer_certs', blank=True)
    portfolio_items = models.ManyToManyField(PortfolioItem, related_name='freelancer_portfolio', blank=True)
    
    # Work Preferences (freelancer-specific)
    availability_status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('busy', 'Busy'),
            ('not_available', 'Not Available')
        ],
        default='available'
    )
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preferred_project_duration = models.CharField(max_length=50, null=True, blank=True)
    preferred_project_type = models.CharField(max_length=50, null=True, blank=True)
    work_hours_per_week = models.IntegerField(null=True, blank=True)
    
    # Security & Verification (with defaults)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    identity_verified = models.BooleanField(default=False)
    skills_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    # Legal & Compliance (with defaults)
    terms_accepted = models.BooleanField(default=False)
    privacy_policy_accepted = models.BooleanField(default=False)
    terms_acceptance_date = models.DateTimeField(null=True, blank=True)
    legal_agreements = models.JSONField(null=True, blank=True)
    
    # Statistics & Metrics (freelancer-specific with defaults)
    total_projects_completed = models.PositiveIntegerField(default=0)
    current_active_projects = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    success_rate = models.FloatField(default=0)
    on_time_completion_rate = models.FloatField(default=0)
    response_time_avg = models.DurationField(null=True, blank=True)
    response_rate = models.FloatField(default=0)

    # Profile Status (with defaults)
    profile_status = models.CharField(
        max_length=20, 
        choices=[
            ('incomplete', 'Incomplete'),
            ('pending_verification', 'Pending Verification'),
            ('active', 'Active'),
            ('suspended', 'Suspended'),
            ('blocked', 'Blocked')
        ],
        default='incomplete'
    )
    profile_completion_percentage = models.IntegerField(default=0)
    account_tier = models.CharField(max_length=20, default='basic')
    
    # TalentRise Specific (all optional)
    is_talentrise = models.BooleanField(default=False)
    student_id = models.CharField(max_length=50, null=True, blank=True)
    institution = models.ForeignKey(Institution, 
                                  on_delete=models.SET_NULL, 
                                  null=True, 
                                  blank=True,
                                  related_name='current_students')
    course_details = models.JSONField(null=True, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    current_semester = models.IntegerField(null=True, blank=True)
    enrollment_year = models.IntegerField(null=True, blank=True)
    academic_status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('graduated', 'Graduated'),
        ('on_break', 'On Break'),
        ('dropped', 'Dropped')
    ], null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    academic_achievements = models.JSONField(null=True, blank=True)
    research_publications = models.JSONField(null=True, blank=True)
    specialization = models.CharField(max_length=255, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Freelancer Profile"
        verbose_name_plural = "Freelancer Profiles"

    def __str__(self):
        return f"{self.user.username} - Freelancer Profile"

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        # Sync is_talentrise with user model
        if self.is_talentrise != self.user.is_talentrise:
            self.is_talentrise = self.user.is_talentrise
        super().save(*args, **kwargs)

    def update_task_count(self, increment=True):
        if increment:
            self.total_projects_completed += 1
        self.save()
    
