from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Job, SavedJob, JobApplication
from .serializers import JobSerializer, SavedJobSerializer, JobApplicationSerializer


class JobListView(generics.ListAPIView):
    """
    GET /api/jobs/           — list all active job postings (with optional search)
    GET /api/jobs/?search=py — filter by keyword in title, company, or skills
    """
    serializer_class   = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs     = Job.objects.filter(is_active=True)
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(title__icontains=search) | \
                 qs.filter(company__icontains=search) | \
                 qs.filter(skills_required__icontains=search)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class SavedJobListView(generics.ListAPIView):
    """GET /api/jobs/saved/ — list all jobs saved by the logged-in user"""
    serializer_class   = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)


class SaveJobView(APIView):
    """
    POST   /api/jobs/<id>/save/    — save / bookmark a job
    DELETE /api/jobs/<id>/save/    — remove saved job
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, is_active=True)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        _, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if created:
            return Response({'message': 'Job saved'}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Already saved'}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        deleted, _ = SavedJob.objects.filter(user=request.user, job_id=pk).delete()
        if deleted:
            return Response({'message': 'Removed from saved'}, status=status.HTTP_200_OK)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class JobApplyView(APIView):
    """
    POST /api/jobs/<id>/apply/
    Submit a job application with: full_name, email, phone, cover_letter

    GET /api/jobs/<id>/apply/
    Check whether the current user has already applied to this job.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        applied = JobApplication.objects.filter(
            user=request.user, job_id=pk
        ).exists()
        return Response({'applied': applied})

    def post(self, request, pk):
        # Check job exists
        try:
            job = Job.objects.get(pk=pk, is_active=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found or no longer active.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent duplicate applications
        if JobApplication.objects.filter(user=request.user, job=job).exists():
            return Response(
                {'error': 'You have already applied to this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save(user=request.user, job=job)
            return Response(
                {
                    'message': f'Application submitted successfully for "{job.title}" at {job.company}!',
                    'application_id': application.pk,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(generics.ListAPIView):
    """GET /api/jobs/applications/ — all applications submitted by the logged-in user"""
    serializer_class   = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user).select_related('job')
