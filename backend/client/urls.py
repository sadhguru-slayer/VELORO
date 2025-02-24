# client/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .DashBoardViews import EventViewSet,RecentActivityView,PostedProjects,DashBoard_Overview,ActivityListView,SpecifiedActivityListView,SpendingDistributionByProject,CollaborationView
from core.views import *
from .DashBoardViews import SpendingDataView
from .profileViews import UnAuthClientViews,ClientViews,update_profile,ClientReviewsandRatings,post_reply,ConnectionView,ConnectionManageViewSet,ConnectionRequestView
# from .profileViews import ClientViews,ClientProfileUpdateView,update_profile

from django.urls import re_path
from .consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]

router = DefaultRouter()

# # Register your views here
# router.register(r'homeEssentialStats', views.HomeEssentialStatsViewSet, basename='homeEssentialStats')
# router.register(r'products_summary', views.ProjectSummaryViewSet, basename='products_summary')
# router.register(r'upcomingDeadlines', views.UpcomingDeadlinesViewSet, basename='upcomingDeadlines')
# router.register(r'recentactivity', views.RecentActivityViewSet, basename='recentactivity')
# router.register(r'spendingOverview', views.SpendingOverviewViewSet, basename='spendingOverview')
router.register(r'events', EventViewSet, basename='events')
router.register(r'connections', ConnectionManageViewSet, basename='connection')

urlpatterns = [
    path('', include(router.urls)),
    path('recent_activity/', RecentActivityView.as_view(), name='recent_activity'),
    path('specified_recent_activity/', SpecifiedActivityListView.as_view(), name='specified_recent_activity'),
    path('other_recent_activity/', ActivityListView.as_view(), name='other_recent_activity'),
    path('posted_projects/', PostedProjects.as_view(), name='posted_projects'),
    path('dashboard_overview/', DashBoard_Overview.as_view(), name='dashboard_overview'),
    path('spending_data/', SpendingDataView.as_view(), name='spending_data'),
    path('spending_distribution_by_project/', SpendingDistributionByProject.as_view(), name='spending_distribution_by_project'),

    # Profile
    path('get_profile_data/', ClientViews.as_view(), name='get_profile_data'),
    path('get_unauth_profile_data/', UnAuthClientViews.as_view(), name='get_unauth_profile_data'),
     path('update_profile/', update_profile, name='update_profile'),
     path('get_reviews/', ClientReviewsandRatings.as_view(), name='get_reviews'),
     path('post_reply/',post_reply , name='post_reply'),
     path('get_collaborations/',CollaborationView.as_view() , name='get_collaborations'),

    #  Connections
     path('get_connections/',ConnectionView.as_view() , name='get_connections'),
     path('get_connection_requests/',ConnectionRequestView.as_view() , name='get_connection_requests'),
   
]
