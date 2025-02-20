from rest_framework import serializers
from .models import ClientProfile,FreelancerProfile,Feedback

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
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = [
            'id',
            'from_user',  # Foreign key relation (if needed)
            'from_user_username',  # Freelancer's username
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
