from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from rest_framework.exceptions import NotFound
from core.serializers import (
    ProjectSerializer, 
    TaskSerializer, 
    SpendingDistributionByProjectSerializer,
    UserSerializer,
    ConnectionSerializer
)
from Profile.models import (
    ClientProfile,Project,User,BankDetails
)
from rest_framework.decorators import permission_classes
from core.models import Connection
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action,api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework import viewsets, status, generics
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Sum,Avg
from django.db.models.functions import (
    TruncMonth, 
    TruncWeek, 
    TruncYear, 
    ExtractWeekDay
)
import calendar
from datetime import timedelta

from Profile.models import (
    ClientProfile, 
    Feedback, 
    FreelancerProfile, 
    FreelancerReview
)
from Profile.serializers import (
    ClientProfileSerializer, 
    FreelancerProfileSerializer,
    ClientFeedbackSerializer,
    ClientProfilePartialUpdateSerializer,
    ConnectionSendinSerializer
)
from .models import Activity

from django.http import JsonResponse

from talentrise.models import TalentRiseProfile, Institution, Course, FieldOfStudy

import json
from django.core.files.base import ContentFile

class ClientReviewsandRatings(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(sefl,request):
        user = request.user
        reviews_ratings = Feedback.objects.filter(to_user=user)
        average_rating = reviews_ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        serialized_reviews = ClientFeedbackSerializer(reviews_ratings, many=True).data

        return Response(
            {
                'reviews': serialized_reviews,
                'average_rating': average_rating,
            },status=200
        )

@api_view(['POST'])
def post_reply(request):
    user = request.user
    review_id = request.data.get('review_id')
    reply_text = request.data.get('reply_text')

    if not review_id or not reply_text:
        return Response({'error': 'Review ID and reply text are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        review = Feedback.objects.get(id=review_id, to_user=user)
    except Feedback.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    # Create the reply
    reply = Feedback.objects.create(
        from_user=user,
        to_user=review.from_user,  # The reply goes to the original reviewer
        project=review.project,
        rating=review.rating,
        feedback=reply_text,
        parent_feedback=review,  # This makes it a reply
        is_reply=True,  # Mark as a reply
    )

    # Serializing the reply
    serialized_reply = ClientFeedbackSerializer(reply).data
    return Response(serialized_reply, status=status.HTTP_201_CREATED)

class ClientViews(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_profile_by_role(self, user, role):
        """Get profile details based on user role"""
        if role == 'client':
            return get_object_or_404(ClientProfile, user=user)
        elif role == 'freelancer':
            return get_object_or_404(FreelancerProfile, user=user)
        return None

    def get_basic_profile_details(self, user, profile):
        """Get common profile details for all roles"""
        # Get primary address if it exists
        primary_address = None
        if profile and profile.addresses.exists():
            primary_address = profile.addresses.filter(is_primary=True).first() or profile.addresses.first()

        # Fetch all addresses
        addresses = []
        if profile and profile.addresses.exists():
            addresses = [
                {
                    'id': address.id,
                    'street_address': address.street_address,
                    'city': address.city,
                    'state': address.state,
                    'country': address.country,
                    'postal_code': address.postal_code,
                    'address_type': address.address_type,
                    'is_primary': address.is_primary,
                    'verified': address.verified,
                }
                for address in profile.addresses.all()
            ]

        return {
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'role': user.role,
            'bio': profile.bio if profile else None,
            'description': profile.description if profile else None,
            'profile_picture': profile.profile_picture.url if profile and profile.profile_picture else None,
            'cover_photo': profile.cover_photo.url if profile and profile.cover_photo else None,
            'gender': profile.gender if profile else None,
            'dob': profile.dob if profile else None,
            
            # Location and Address Information
            'location': {
                'city': primary_address.city if primary_address else None,
                'state': primary_address.state if primary_address else None,
                'country': primary_address.country if primary_address else None,
                'full_address': primary_address.street_address if primary_address else None,
            },
            'addresses': addresses,  # Include all addresses here
            
            # Contact Information
            'contact_info': {
                'primary_email': profile.primary_email if profile else None,
                'secondary_email': profile.secondary_email if profile else None,
                'phone_number': profile.phone_number if profile else None,
                'alternate_phone': profile.alternate_phone if profile else None,
            },
            
            # Verification Status
            'verification_status': {
                'email_verified': profile.email_verified if profile else False,
                'phone_verified': profile.phone_verified if profile else False,
                'identity_verified': profile.identity_verified if profile else False,
                'two_factor_enabled': profile.two_factor_enabled if profile else False,
            },
            
            # Profile Status
            'profile_status': profile.profile_status if profile else None,
            'account_tier': profile.account_tier if profile else None,
            
            # Timestamps
            'created_at': profile.created_at if profile else None,
            'last_active': profile.last_active if profile else None,
        }

    def get_client_specific_details(self, profile):
        """Get client-specific profile details"""
        completion_data = self.calculate_profile_completion(profile)
        
        # Format bank details
        bank_details = None
        if profile.bank_details:
            bank_details = {
                'id': profile.bank_details.id,
                'bank_name': profile.bank_details.bank_name,
                'account_number': profile.bank_details.account_number,
                'ifsc_code': profile.bank_details.ifsc_code,
                'account_holder_name': profile.bank_details.account_holder_name,
                'branch_name': profile.bank_details.branch_name,
                'swift_code': profile.bank_details.swift_code,
                'verified': profile.bank_details.verified,
                'primary': profile.bank_details.primary
            }
        
        # Format verification documents
        verification_documents = []
        if profile.verification_documents.exists():
            verification_documents = [
                {
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'document_number': doc.document_number,
                    'document_file': doc.document_file.url if doc.document_file else None,
                    'verified': doc.verified,
                    'verification_date': doc.verification_date,
                    'expiry_date': doc.expiry_date,
                    'verification_notes': doc.verification_notes
                }
                for doc in profile.verification_documents.all()
            ]

        return {
            'company_details': {
                'id': profile.company.id if profile.company else None,
                'name': profile.company.name if profile.company else None,
                'registration_number': profile.company.registration_number if profile.company else None,
                'registration_date': profile.company.registration_date if profile.company else None,
                'company_type': profile.company.company_type if profile.company else None,
                'industry': profile.company.industry if profile.company else None,
                'website': profile.company.website if profile.company else None,
                'gst_number': profile.company.gst_number if profile.company else None,
                'pan_number': profile.company.pan_number if profile.company else None,
                'annual_turnover': str(profile.company.annual_turnover) if profile.company and profile.company.annual_turnover else None,
                'employee_count': profile.company.employee_count if profile.company else None,
                'verified': profile.company.verified if profile.company else False,
            },
            'business_preferences': {
                'preferred_payment_method': profile.preferred_payment_method,
                'project_preferences': profile.project_preferences,
                'budget_range': profile.budget_range,
            },
            'statistics': {
                'total_projects_posted': profile.total_projects_posted,
                'successful_projects': profile.successful_projects,
                'total_spent': str(profile.total_spent),
                'average_rating': str(profile.average_rating),
                'response_rate': profile.response_rate,
                'payment_reliability_score': profile.payment_reliability_score,
            },
            'legal_status': {
                'terms_accepted': profile.terms_accepted,
                'privacy_policy_accepted': profile.privacy_policy_accepted,
                'terms_acceptance_date': profile.terms_acceptance_date,
                'legal_agreements': profile.legal_agreements,
            },
            'profile_completion': completion_data,
            'bank_details': bank_details,
            'verification_documents': verification_documents
        }

    def get_freelancer_specific_details(self, profile):
        """Get freelancer-specific profile details"""
        return {
            'professional_info': {
                'title': profile.title,
                'skills': [skill.name for skill in profile.skills.all()],
                'experience_years': profile.experience_years,
                'certifications': [cert.name for cert in profile.certifications.all()],
            },
            'availability': {
                'status': profile.availability_status,
                'hourly_rate': str(profile.hourly_rate) if profile.hourly_rate else None,
                'preferred_duration': profile.preferred_project_duration,
                'preferred_type': profile.preferred_project_type,
                'work_hours': profile.work_hours_per_week,
            },
            'statistics': {
                'total_projects_completed': profile.total_projects_completed,
                'current_active_projects': profile.current_active_projects,
                'total_earnings': str(profile.total_earnings),
                'average_rating': str(profile.average_rating),
                'success_rate': profile.success_rate,
                'on_time_completion_rate': profile.on_time_completion_rate,
            }
        }

    def get_student_details(self, user):
        """Get student-specific details from TalentRise profile"""
        try:
            talentrise_profile = TalentRiseProfile.objects.select_related(
                'institution', 'course', 'field_of_study', 'year_of_study'
            ).get(user=user)
            
            # Get skills and create skills_learning (same as skills for now)
            skills = [skill.name for skill in talentrise_profile.skills.all()]
            
            return {
                'institution': {
                    'name': talentrise_profile.institution.name,
                    'location': talentrise_profile.institution.location,
                    'website': talentrise_profile.institution.website,
                    'is_verified': talentrise_profile.institution.is_verified
                },
                'academic_info': {
                    'course': talentrise_profile.course.name,
                    'field_of_study': talentrise_profile.field_of_study.name,
                    'year_of_study': talentrise_profile.year_of_study.get_year_number_display(),
                    'graduation_year': talentrise_profile.graduation_year,
                },
                'skills': skills,
                'skills_learning': skills,  # Duplicate of skills as per frontend requirement
                'weekly_availability': talentrise_profile.get_weekly_availability_display(),
                'completed_gigs': talentrise_profile.completed_gigs,
                'ongoing_gigs': talentrise_profile.ongoing_gigs,
                'academic_achievements': talentrise_profile.academic_achievements,
                'certifications': talentrise_profile.certifications,
                'is_verified': talentrise_profile.is_verified,
                'profile_completion': talentrise_profile.profile_completion,
                'is_active': talentrise_profile.is_active
            }
        except TalentRiseProfile.DoesNotExist:
            return None

    def get_connection_status(self, auth_user, user):
        """Get connection status between auth_user and user"""
        try:
            connection = Connection.objects.filter(
                Q(from_user=auth_user, to_user=user) | 
                Q(from_user=user, to_user=auth_user)
            ).first()

            if connection:
                is_connected = connection.status == 'accepted'
                status = connection.status
                if connection.from_user == user and connection.status == 'pending':
                    status = 'not_accepted'
                return {
                    'status': status,
                    'connection_id': connection.id,
                    'is_connected': is_connected
                }
            
            return {
                'status': 'notset',
                'connection_id': None,
                'is_connected': False
            }
        except Exception as e:
            print(f"Error getting connection status: {e}")
            return {
                'status': 'notset',
                'connection_id': None,
                'is_connected': False
            }

    def get_projects(self, user, role):
        """Get projects based on user role"""
        if role == 'client':
            projects = Project.objects.filter(client=user)
        else:  # freelancer
            projects = Project.objects.filter(assigned_to=user)

        return ProjectSerializer(projects, many=True).data

    def get_connection_count(self, user):
        """Get the total number of connections for the user"""
        return Connection.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status='accepted'
        ).count()

    def get_reviews_and_ratings(self, user):
        """Get reviews and average rating for the user"""
        reviews = Feedback.objects.filter(to_user=user, is_reply=False)
        return {
            'reviews': ClientFeedbackSerializer(reviews, many=True).data,
            'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        }

    def calculate_profile_completion(self, profile):
        """Calculate profile completion percentage based on required fields"""
        categories = {
            'basic_info': {
                'fields': [
                    ('profile_picture', 5),
                    ('bio', 5),
                    ('phone_number', 5),
                    ('description', 5)
                ],
                'total': 20
            },
            'business_info': {
                'fields': [
                    ('company.name', 5),
                    ('company.website', 5),
                    ('company.registration_number', 5),
                    ('company.gst_number', 5),
                    ('company.pan_number', 5),
                ],
                'total': 25
            },
            'verification': {
                'required_docs': [
                    {
                        'type': 'id_proof',
                        'weight': 6,
                        'name': 'ID Proof'
                    },
                    {
                        'type': 'pan_card',
                        'weight': 6,
                        'name': 'PAN Card'
                    },
                    {
                        'type': 'company_registration',
                        'weight': 6,
                        'name': 'Company Registration'
                    },
                    {
                        'type': 'gst_certificate',
                        'weight': 6,
                        'name': 'GST Certificate'
                    }
                ],
                
                'total': 24
            },
            'banking': {
                'fields': [
                    ('bank_details.bank_name', 5),
                    ('bank_details.account_number', 5),
                    ('bank_details.ifsc_code', 5),
                    ('bank_details.verified', 5),
                    ('terms_accepted', 5)
                ],
                'total': 25
            }
        }

        category_scores = {}
        total_score = 0
        total_possible = 0

        for category, config in categories.items():
            score = 0
            pending_items = []
            
            if category == 'verification':
                # Get all verification documents
                verification_docs = profile.verification_documents.all()
                doc_types = {doc.document_type: doc for doc in verification_docs}
                
                for required_doc in config['required_docs']:
                    doc_type = required_doc['type']
                    doc_name = required_doc['name']
                    weight = required_doc['weight']
                    
                    if doc_type in doc_types:
                        doc = doc_types[doc_type]
                        if doc.verified:
                            score += weight
                        else:
                            score += weight * 0.5  # 50% credit for uploaded but unverified docs
                            pending_items.append({
                                'item': f"{doc_name} verification pending",
                                'type': 'verification',
                                'priority': 'high' if doc_type in ['id_proof', 'pan_card'] else 'medium'
                            })
                    else:
                        # Only add to pending if document doesn't exist
                        pending_items.append({
                            'item': f"{doc_name} not uploaded",
                            'type': 'upload',
                            'priority': 'high' if doc_type in ['id_proof', 'pan_card'] else 'medium'
                        })

            else:
                # Handle other categories
                for field, weight in config.get('fields', []):
                    if '.' in field:
                        parts = field.split('.')
                        obj = getattr(profile, parts[0], None)
                        value = getattr(obj, parts[1], None) if obj else None
                    else:
                        value = getattr(profile, field, None)
                    
                    if value:
                        score += weight
                    else:
                        field_name = parts[1] if '.' in field else field
                        pending_items.append({
                            'item': f"Add {field_name.replace('_', ' ').title()}",
                            'type': category,
                            'priority': 'high' if category == 'banking' else 'medium'
                        })

            category_scores[category] = {
                'score': score,
                'total': config['total'],
                'percentage': round((score / config['total']) * 100) if config['total'] > 0 else 0,
                'pending_items': pending_items
            }

            total_score += score
            total_possible += config['total']

        return {
            'total_score': round((total_score / total_possible) * 100) if total_possible > 0 else 0,
            'category_scores': category_scores,
            'profile_status': self._determine_profile_status(total_score / total_possible if total_possible > 0 else 0)
        }

    def _get_priority_items(self, category_scores):
        """Get prioritized list of pending items across all categories"""
        all_pending_items = []
        
        # First collect high priority items
        for category, data in category_scores.items():
            for item in data.get('pending_items', []):
                if item['priority'] == 'high':
                    all_pending_items.append({
                        **item,
                        'category': category
                    })
        
        # Then collect medium priority items
        for category, data in category_scores.items():
            for item in data.get('pending_items', []):
                if item['priority'] == 'medium':
                    all_pending_items.append({
                        **item,
                        'category': category
                    })
        
        return all_pending_items

    def _determine_profile_status(self, completion_ratio):
        """Determine profile status based on completion ratio"""
        if completion_ratio >= 0.9:  # 90% or more
            return 'complete'
        elif completion_ratio >= 0.7:  # 70% or more
            return 'nearly_complete'
        elif completion_ratio >= 0.4:  # 40% or more
            return 'in_progress'
        else:
            return 'incomplete'

    def get(self, request, *args, **kwargs):
        """Get profile details with connection information"""
        auth_user = request.user
        user_id = request.GET.get('userId')
        user = get_object_or_404(User, id=user_id)
        role = user.role

        # Get base profile based on role
        profile = self.get_profile_by_role(user, role)
        
        # Get basic profile details
        profile_details = self.get_basic_profile_details(user, profile)
        
        # Add role-specific details
        if role == 'client':
            profile_details.update(self.get_client_specific_details(profile))
        elif role == 'freelancer':
            profile_details.update(self.get_freelancer_specific_details(profile))
        
        # Add student-specific details if applicable
        if user.is_talentrise:
            student_details = self.get_student_details(user)
            if student_details:
                profile_details['student_info'] = student_details

        # Get connection information
        connection_info = self.get_connection_status(auth_user, user)
        
        # Get primary address for location display
        primary_address = None
        if profile and profile.addresses.exists():
            primary_address = profile.addresses.filter(is_primary=True).first() or profile.addresses.first()
        
        profile_details.update({
            'connection_id': connection_info['connection_id'],
            'connection_status': connection_info['status'],
            'name': user.username,
            'email': user.email,
            'role': user.role,
            'location': f"{primary_address.city}, {primary_address.country}" if primary_address else None,
            'bio': profile.bio if profile else None,
            'profile_picture': profile.profile_picture.url if profile and profile.profile_picture else None,
        })

        # Prepare final response
        result = {
            'profile': profile_details,
            'projects': self.get_projects(user, role),
            'is_connected': connection_info['is_connected'],
            'connection_status': connection_info['status'],
            'connection_Count': self.get_connection_count(user),
            'reviews_and_ratings': self.get_reviews_and_ratings(user)
        }

        return Response(result, status=200)

    # ... (keep existing helper methods like get_connection_status, get_projects, etc.)


class UnAuthClientViews(generics.ListAPIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user_id = request.GET.get('userId')

        # Retrieve the user object for the requested userId
        user = get_object_or_404(User, id=user_id)
        role = user.role
        
        # Get connection count and connection status
        connection_count = user.get_client_connections()

        # Get the profile data based on user role
        if role == 'client':
            profile = get_object_or_404(ClientProfile, user=user)
        else:
            profile = get_object_or_404(FreelancerProfile, user=user)
        
        # Profile details response
        profile_details = {
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'bio': profile.bio,
            'role':user.role,
            'location': profile.location,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
        }

        # Fetching completed projects based on the user's role
        if role == 'client':
            projects = Project.objects.filter(client=user)
        else:
            projects = Project.objects.filter(assigned_to=user)

        # Serializing the projects data
        serialized_projects = ProjectSerializer(projects, many=True)

        # Fetching reviews and calculating average rating
        reviews_ratings = Feedback.objects.filter(to_user=user,is_reply=False)
        average_rating = reviews_ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        serialized_reviews = ClientFeedbackSerializer(reviews_ratings, many=True).data
        

        # Preparing the final response data
        result = {
            'client_profile': profile_details,
            'projects': serialized_projects.data,
            'connection_count': connection_count,
            'reviews_and_ratings': {
                'reviews': serialized_reviews,
                'average_rating': average_rating,
            }
        }


        return Response(result, status=200)

from Profile.models import CompanyDetails


@api_view(['PUT'])
@csrf_exempt
def update_profile(request):
    try:
        client_profile = get_object_or_404(ClientProfile, user=request.user)
        
        if request.method == 'PUT':
            data = request.data.copy()
            
            # Debug logging to help diagnose file upload issues
            print("Files received in request:", list(request.FILES.keys()))
            
            # Store original state for comparison
            original_state = {
                'bank_details': client_profile.bank_details.id if client_profile.bank_details else None,
                'verification_documents': {doc.id: {
                    'type': doc.document_type,
                    'verified': doc.verified
                } for doc in client_profile.verification_documents.all()},
                'profile_picture': client_profile.profile_picture.name if client_profile.profile_picture else None,
                'company': client_profile.company.id if client_profile.company else None,
            }
            
            # Terms acceptance check
            updating_sensitive_info = ('bank_details' in data or 'verification_documents' in data or 
                                   any(key.startswith('document_file_') for key in request.FILES))
            
            if updating_sensitive_info and not client_profile.terms_accepted:
                return Response(
                    {"error": "Terms and conditions must be accepted before updating bank details or documents",
                     "requires_terms_acceptance": True},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Process verification document data
            if 'verification_documents' in data:
                try:
                    verification_docs = json.loads(data['verification_documents'])
                    print(f"Processing {len(verification_docs)} verification documents")
                    
                    # Ensure temp_ids are preserved for file matching
                    for doc in verification_docs:
                        if not doc.get('id') and not doc.get('temp_id'):
                            doc['temp_id'] = f"temp_{hash(str(doc))}"
                            
                    # Update the data with the modified documents
                    data['verification_documents'] = json.dumps(verification_docs)
                except Exception as e:
                    print(f"Error processing verification documents: {str(e)}")
            
            serializer = ClientProfilePartialUpdateSerializer(
                client_profile, 
                data=data, 
                partial=True,
                context={'request': request}  # Make sure to pass the request for file access
            )
            
            if serializer.is_valid():
                updated_profile = serializer.save()
                
                # Track changes logic...
                # [Existing activity tracking code]
                
                return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
            else:
                print("Serializer errors:", serializer.errors)
                return Response(
                    {
                        "error": "Validation failed",
                        "details": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    
    
class ConnectionManageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    # Accept connection
    @action(detail=True, methods=['post'])
    def accept_connection(self, request, pk=None):
        connection = get_object_or_404(Connection, id=pk)
        print(connection)
        if connection.to_user == request.user:
            connection.accept()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'])
    def establish_connection(self, request, pk=None):
        from_user = request.user
        to_user = get_object_or_404(User, id=pk)
        if from_user == to_user:
            return Response({"error": "You cannot connect to yourself"}, status=status.HTTP_400_BAD_REQUEST)
        if Connection.objects.filter(from_user=from_user, to_user=to_user).exists():
            return Response({"error": "You are already connected"}, status=status.HTTP_400_BAD_REQUEST)
        connection = Connection(from_user=from_user, to_user=to_user)
        connection.save()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)

    # Reject connection
    @action(detail=True, methods=['post'])
    def reject_connection(self, request, pk=None):
        connection = get_object_or_404(Connection, id=pk)
        if connection.to_user == request.user:
            connection.reject()
        connection_serialized = ConnectionSerializer(connection)
        return Response(connection_serialized.data, status=status.HTTP_200_OK)
    

class ConnectionView(generics.ListAPIView):
    serializer_class = ConnectionSendinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
    
        # Fetch connections where the user is either 'from_user' or 'to_user' with status 'accepted'
        connections1 = Connection.objects.filter(to_user=user, status='accepted')
        
        connections2 = Connection.objects.filter(from_user=user, status='accepted')

        # Combine both querysets using union (| operator)
        connections = connections1 | connections2
        print(connections)
        return connections

    def list(self, request, *args, **kwargs):
        # Get the queryset for connections
        queryset = self.get_queryset()

        # Serialize the connections
        connection_serializer = self.get_serializer(queryset, many=True)

        # Return the response with the connection data and profiles of both users in each connection
        return Response(connection_serializer.data, status=200)


class ConnectionRequestView(generics.ListAPIView):
    serializer_class = ConnectionSendinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
    
        # Fetch connections where the user is either 'from_user' or 'to_user' with status 'accepted'
        connections1 = Connection.objects.filter(to_user=user, status='pending')
        print(connections1)
        # Combine both querysets using union (| operator)
        connections = connections1
        return connections

    def list(self, request, *args, **kwargs):
        # Get the queryset for connections
        queryset = self.get_queryset()

        # Serialize the connections
        connection_serializer = self.get_serializer(queryset, many=True)

        # Return the response with the connection data and profiles of both users in each connection
        return Response(connection_serializer.data, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_terms_acceptance(request):
    try:
        client_profile = get_object_or_404(ClientProfile, user=request.user)
        
        # Update terms_accepted field
        terms_accepted = request.data.get('terms_accepted', False)
        client_profile.terms_accepted = terms_accepted
        
        # Set terms acceptance date
        if terms_accepted:
            client_profile.terms_acceptance_date = timezone.now()
            
        client_profile.save()
        
        return Response({
            "message": "Terms acceptance updated successfully",
            "terms_accepted": client_profile.terms_accepted,
            "terms_acceptance_date": client_profile.terms_acceptance_date
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )



