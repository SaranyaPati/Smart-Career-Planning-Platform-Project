from django.urls import path
from .views import JobListView, SavedJobListView, SaveJobView, JobApplyView, MyApplicationsView

urlpatterns = [
    # GET all active jobs (with optional ?search=)
    path('', JobListView.as_view(), name='job-list'),
    # GET saved jobs
    path('saved/', SavedJobListView.as_view(), name='saved-jobs'),
    # GET my applications
    path('applications/', MyApplicationsView.as_view(), name='my-applications'),
    # POST save / DELETE unsave
    path('<int:pk>/save/', SaveJobView.as_view(), name='save-job'),
    # GET check applied / POST submit application
    path('<int:pk>/apply/', JobApplyView.as_view(), name='job-apply'),
]
