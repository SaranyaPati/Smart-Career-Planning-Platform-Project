from django.urls import path
from .views import CareerPlanView

urlpatterns = [
    # GET personalised career plan based on uploaded resume
    path('plan/', CareerPlanView.as_view(), name='career-plan'),
]
