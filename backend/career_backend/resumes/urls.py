from django.urls import path
from .views import ResumeListCreateView, ResumeDetailView, ResumeStatusView, ResumeAnalyzeView

urlpatterns = [
    # GET list / POST upload
    path('', ResumeListCreateView.as_view(), name='resume-list-create'),
    # GET status summary (for Dashboard card)
    path('status/', ResumeStatusView.as_view(), name='resume-status'),
    # GET detail / DELETE
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    # GET analyze resume → recommended jobs
    path('<int:pk>/analyze/', ResumeAnalyzeView.as_view(), name='resume-analyze'),
]
