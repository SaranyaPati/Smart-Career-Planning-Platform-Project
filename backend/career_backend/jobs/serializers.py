from rest_framework import serializers
from .models import Job, SavedJob, JobApplication


class JobSerializer(serializers.ModelSerializer):
    skills_list = serializers.SerializerMethodField()
    is_saved    = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model  = Job
        fields = [
            'id', 'title', 'company', 'location', 'location_type',
            'description', 'requirements', 'skills_required', 'skills_list',
            'salary_range', 'apply_url', 'is_active', 'posted_at',
            'is_saved', 'has_applied',
        ]

    def get_skills_list(self, obj):
        if obj.skills_required:
            return [s.strip() for s in obj.skills_required.split(',') if s.strip()]
        return []

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JobApplication.objects.filter(user=request.user, job=obj).exists()
        return False


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model  = SavedJob
        fields = ['id', 'job', 'saved_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title   = serializers.CharField(source='job.title',   read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)

    class Meta:
        model  = JobApplication
        fields = [
            'id', 'job', 'job_title', 'job_company',
            'full_name', 'email', 'phone', 'cover_letter',
            'status', 'applied_at',
        ]
        read_only_fields = ['job', 'status', 'applied_at', 'job_title', 'job_company']
