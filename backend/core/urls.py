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


]
