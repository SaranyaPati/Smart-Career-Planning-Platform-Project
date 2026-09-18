"""
Main URL configuration — Smart Career Planning Platform

Full API surface:
  /api/register/            POST  — Register (public)
  /api/login/               POST  — JWT login (public)
  /api/token/refresh/       POST  — Refresh JWT
  /api/profile/             GET   — Get profile
  /api/profile/update/      PUT   — Update profile

  /api/resumes/             GET / POST  — List / Upload resume
  /api/resumes/status/      GET         — Resume status (Dashboard card)
  /api/resumes/<id>/        GET / DELETE

  /api/jobs/                GET         — All active jobs
  /api/jobs/saved/          GET         — Saved jobs
  /api/jobs/<id>/save/      POST/DELETE — Save / unsave

  /api/careers/paths/       GET         — Career path suggestions
  /api/careers/goals/       GET / POST  — List / Create goals
  /api/careers/goals/stats/ GET         — Goal stats (Dashboard card)
  /api/careers/goals/<id>/  GET/PUT/DELETE
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/login/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),

    # Accounts (register, profile, profile/update)
    path('api/', include('accounts.urls')),

    # Resumes
    path('api/resumes/', include('resumes.urls')),

    # Jobs
    path('api/jobs/', include('jobs.urls')),

    # Careers (paths + goals)
    path('api/careers/', include('careers.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
