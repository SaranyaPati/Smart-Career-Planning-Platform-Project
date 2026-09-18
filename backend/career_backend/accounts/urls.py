from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    ProfileUpdateView,
)

urlpatterns = [

    # POST /api/register/ — public, creates a new user
    path('register/', RegisterView.as_view(), name='register'),

    # GET  /api/profile/        — returns the logged-in user's profile
    path('profile/', ProfileView.as_view(), name='profile'),

    # PUT  /api/profile/update/ — updates the logged-in user's profile
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]