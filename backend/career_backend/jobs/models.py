from django.db import models
from django.contrib.auth.models import User


class Job(models.Model):
    """
    A job listing seeded by admin or discovered via external data.
    Frontend: /jobs page 'View Opportunities' → browse all jobs.
    """
    LOCATION_TYPE_CHOICES = [
        ('remote',   'Remote'),
        ('onsite',   'On-site'),
        ('hybrid',   'Hybrid'),
    ]

    title          = models.CharField(max_length=200)
    company        = models.CharField(max_length=200)
    location       = models.CharField(max_length=200, blank=True, null=True)
    location_type  = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='onsite')
    description    = models.TextField(blank=True, null=True)
    requirements   = models.TextField(blank=True, null=True)
    skills_required = models.TextField(blank=True, null=True,
                                       help_text="Comma-separated skills e.g. Python, Django, React")
    salary_range   = models.CharField(max_length=100, blank=True, null=True)
    apply_url      = models.URLField(blank=True, null=True)
    is_active      = models.BooleanField(default=True)
    posted_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.title} @ {self.company}"


class SavedJob(models.Model):
    """
    A job bookmarked/saved by a user.
    Frontend: Jobs page 'Save Job' button.
    """
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job       = models.ForeignKey(Job,  on_delete=models.CASCADE, related_name='saved_by')
    saved_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved '{self.job.title}'"


class JobApplication(models.Model):
    """
    A job application submitted by a user through the platform.
    Frontend: /jobs page 'Apply Now' → modal form → submitted here.
    """
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('reviewed', 'Reviewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    job          = models.ForeignKey(Job,  on_delete=models.CASCADE, related_name='applications')
    full_name    = models.CharField(max_length=200)
    email        = models.EmailField()
    phone        = models.CharField(max_length=30, blank=True)
    cover_letter = models.TextField(blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')   # one application per user per job
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.user.username} → {self.job.title} ({self.status})"

