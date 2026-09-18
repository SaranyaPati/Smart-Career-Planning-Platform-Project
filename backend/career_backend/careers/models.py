from django.db import models
from django.contrib.auth.models import User


class CareerPath(models.Model):
    """
    A career path/suggestion available on the platform (seeded by admin).
    Frontend: /careers page 'Career Suggestions' section.
    """
    title        = models.CharField(max_length=200)
    description  = models.TextField(blank=True, null=True)
    skills_needed = models.TextField(blank=True, null=True,
                                     help_text="Comma-separated skills")
    avg_salary   = models.CharField(max_length=100, blank=True, null=True)
    growth_rate  = models.CharField(max_length=50, blank=True, null=True,
                                    help_text="e.g. '25% YoY'")
    icon         = models.CharField(max_length=10, blank=True, null=True,
                                    help_text="Emoji icon e.g. 💻")
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

