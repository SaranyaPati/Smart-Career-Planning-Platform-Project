from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    """
    Stores an uploaded resume file (PDF/DOCX) for a user.
    Frontend: Dashboard 'Resume Status' card + /resume page upload button.
    """
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('reviewed', 'Reviewed'),
        ('pending',  'Pending'),
    ]

    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title     = models.CharField(max_length=200, blank=True, null=True)
    file      = models.FileField(upload_to='resumes/')
    status    = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.user.username} — {self.title or self.file.name}"
