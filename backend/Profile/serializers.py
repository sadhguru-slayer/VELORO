from rest_framework import serializers
from .models import ClientProfile,FreelancerProfile,Feedback
from core.models import Connection
class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = '__all__'

class ClientProfilePartialUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ClientProfile
        fields = [
            'name', 'bio', 'location', 'profile_picture', 'bank_name', 
            'bank_account_number', 'bank_ifsc', 'bank_verified', 
            'id_proof', 'id_verified', 'company_name', 'company_website', 'company_registration_number'
        ]

    def update(self, instance, validated_data):
        # Update each field only if it exists in the validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class FreelancerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelancerProfile
        fields = '__all__'

class ClientFeedbackSerializer(serializers.ModelSerializer):
    from_user_username = serializers.CharField(source='from_user.username', read_only=True)
    from_user_role = serializers.CharField(source='from_user.role', read_only=True)
    to_user_username = serializers.CharField(source='to_user.username', read_only=True)
    to_user_role = serializers.CharField(source='to_user.role', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = [
            'id',
            'from_user',  # Foreign key relation (if needed)
            'from_user_role',  # Foreign key relation (if needed)
            'to_user',  # Foreign key relation (if needed)
            'to_user_role',  # Foreign key relation (if needed)
            'from_user_username',  # Freelancer's username
            'to_user_username',  # Freelancer's username
            'rating',  # Rating for the review
            'feedback',  # Review text
            'created_at',  # Date the review was created
            'project_title',  # Project title associated with the review
            'parent_feedback',  # The parent feedback (for replies)
            'replies',  # Nested replies
        ]
        read_only_fields = ['from_user_username', 'project_title', 'parent_feedback']

    def get_replies(self, obj):
        # Only include direct replies, and avoid infinite recursion.
        if obj.parent_feedback:
            return []  # Don't serialize replies for replies.
        
        replies = obj.replies.all()
        return ClientFeedbackSerializer(replies, many=True).data


class UserProfileSerializer(serializers.Serializer):
    def to_representation(self, instance):
        # Check if the user is a freelancer
        if instance.role == 'freelancer':
            try:
                profile = FreelancerProfile.objects.get(user=instance)
                user_name = instance.username
                result = {
                    'user_name': user_name,
                    'id': instance.id,
                    'bio': profile.bio,  # Get bio from FreelancerProfile
                    'profile_picture': profile.profile_picture.url if profile.profile_picture else None,  # Get profile picture
                    'rating': profile.average_rating,  # Freelancer rating
                }
                return result
            except FreelancerProfile.DoesNotExist:
                # Return an empty dictionary or a default profile if it does not exist
                return {"message": "Freelancer profile not found"}
        
        # Check if the user is a client
        elif instance.role == 'client':
            try:
                profile = ClientProfile.objects.get(user=instance)
                user_name = instance.username
                result = {
                    'user_name': user_name,
                    'id': instance.id,
                    'bio': profile.bio,  # Get bio from ClientProfile
                    'profile_picture': profile.profile_picture.url if profile.profile_picture else None,  # Get profile picture
                    'company': profile.company_name,  # Client's company name
                }
                return result
            except ClientProfile.DoesNotExist:
                # Return an empty dictionary or a default profile if it does not exist
                return {"message": "Client profile not found"}
        
        # Default case if the user has no role or something unexpected
        return {"message": "Profile data unavailable"}



class ConnectionSendinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = ['from_user', 'to_user', 'status', 'created_at', 'updated_at']

    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)

        # Extract the 'from_user' and 'to_user'
        from_user = instance.from_user
        to_user = instance.to_user

        # Helper function to get the profile data
        def get_user_profile(user):
            if user.role == 'client':
                # Check if 'client_profile' exists
                if hasattr(user, 'client_profile'):
                    return {
                        "user_name": user.username,
                        "user_id": user.id,
                        "bio": user.client_profile.bio,  # 'bio' from ClientProfile
                        "company": user.client_profile.company_name,  # 'company_name' from ClientProfile
                        "rating": user.client_profile.average_rating,  # 'average_rating' from ClientProfile
                        "role": user.role
                    }
                else:
                    return {
                        "user_name": user.username,
                        "user_id": user.id,
                        "bio": "",  # Empty bio if client_profile does not exist
                        "company": "",  # Empty company if client_profile does not exist
                        "rating": 0,  # Default rating if client_profile does not exist
                        "role": user.role
                    }

            elif user.role == 'freelancer':
                # Check if 'freelancer_profile' exists
                if hasattr(user, 'freelancer_profile'):
                    return {
                        "user_name": user.username,
                        "user_id": user.id,
                        "bio": user.freelancer_profile.bio,  # 'bio' from FreelancerProfile
                        "company": user.freelancer_profile.company_name,  # 'company_name' from FreelancerProfile
                        "rating": user.freelancer_profile.average_rating,  # 'average_rating' from FreelancerProfile
                        "role": user.role
                    }
                else:
                    return {
                        "user_name": user.username,
                        "user_id": user.id,
                        "bio": "",  # Empty bio if freelancer_profile does not exist
                        "company": "",  # Empty company if freelancer_profile does not exist
                        "rating": 0,  # Default rating if freelancer_profile does not exist
                        "role": user.role
                    }

        # Determine which user to return (opposite user based on who the current user is)
        current_user = self.context.get('request').user
        if current_user == from_user:
            opposite_user = to_user
        else:
            opposite_user = from_user

        # Get the profile of the opposite user
        opposite_user_profile = get_user_profile(opposite_user)

        # Return the response with the opposite user's profile and connection details
        return {
            "id":instance.id,
            "user_name": opposite_user_profile.get('user_name'),
            "user_id": opposite_user_profile.get('user_id'),
            "company": opposite_user_profile.get('company'),
            "rating": opposite_user_profile.get('rating'),
            "bio": opposite_user_profile.get('bio'),
            "role": opposite_user_profile.get('role'),
            "status": representation.get('status'),
            "created_at": representation.get('created_at'),
            "updated_at": representation.get('updated_at')
        }
