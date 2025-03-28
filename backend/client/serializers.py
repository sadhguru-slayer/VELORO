from rest_framework import serializers
from .models import Event,Activity
from Profile.models import VerificationDocument

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields='__all__'

