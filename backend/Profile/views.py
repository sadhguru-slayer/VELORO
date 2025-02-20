from rest_framework import viewsets
from .models import ClientProfile,FreelancerProfile
from .serializers import ClientProfileSerializer,FreelancerProfileSerializer
from rest_framework.permissions import IsAuthenticated

class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = ClientProfile.objects.all()
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow users to see their own profile
        return self.queryset.filter(user=self.request.user)
    
class FreelancerProfileViewSet(viewsets.ModelViewSet):
    queryset = FreelancerProfile.objects.all()
    serializer_class = FreelancerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow users to see their own profile
        return self.queryset.filter(user=self.request.user)
