from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,TokenVerifyView
)
from django.urls import path
from .views import *

urlpatterns = [
    path('register/create_user/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', CustomTokenObtainPairView.as_view(), name='obtain_token_pair'),
    path('profile/', IsprofiledDetails.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token_verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Projects
    path('post_project/', CreateProjectView.as_view(), name='post_project'),
    path('categories/', CategoryListView.as_view(), name='categories-list'),
    path('skills/<int:category_id>/', SkillsByCategoryView.as_view(), name='skills-by-category'),

    #Connections 
    path('search/', search_partial, name='search'),


    # Notifications
    path('upcoming-notifications/', get_upcoming_notifications, name='upcoming_notifications'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notify-freelancer/<int:object_id>&<str:type>', NotifyFreelancerView.as_view(), name='notify_freelancer'),


    # Endpoint to mark a specific notification as read
    path('notifications/<int:notification_id>/mark-as-read/', MarkNotificationAsRead.as_view(), name='mark-notification-as-read'),

    # Endpoint to delete a specific notification
    path('notifications/<int:notification_id>/', DeleteNotification.as_view(), name='delete-notification'),
     path('notifications/unmarked/', UnmarkedNotificationListView.as_view(), name='unmarked-notification-list'),
]
