from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string


class Profile(models.Model):
    """
    Extended user profile that maps to the frontend Profile page fields.
    Frontend sends/expects: fullName, email, bio, skills, targetRole
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Maps to 'bio' in the frontend Profile form
    bio = models.TextField(blank=True, null=True)

    # Comma-separated skills — e.g. "React, Python, Django"
    skills = models.TextField(blank=True, null=True)

    # Maps to 'targetRole' in the frontend Profile form
    target_role = models.CharField(max_length=150, blank=True, null=True)

    # Optional phone — kept for admin / future use
    phone = models.CharField(max_length=15, blank=True, null=True)

    # Education — e.g. "B.Tech Computer Science, XYZ University, 2024"
    education = models.CharField(max_length=300, blank=True, null=True)

    # Social / professional links
    linkedin_url = models.URLField(max_length=300, blank=True, null=True)
    github_url   = models.URLField(max_length=300, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} — Profile"


# ---------------------------------------------------------------------------
# OTP — for password-reset email verification
# ---------------------------------------------------------------------------

class OTP(models.Model):
    """
    Stores a 6-digit OTP linked to an email address.
    - Valid for 10 minutes from creation.
    - Marked used after successful verification.
    """
    email      = models.EmailField(db_index=True)
    code       = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)

    OTP_EXPIRY_MINUTES = 10

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP({self.email}) — {'used' if self.is_used else 'active'}"

    @property
    def is_expired(self):
        delta = timezone.now() - self.created_at
        return delta.total_seconds() > self.OTP_EXPIRY_MINUTES * 60

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    @classmethod
    def generate(cls, email):
        """Invalidate any existing OTPs for this email and create a fresh one."""
        # Mark all previous OTPs for this email as used so they can't be replayed
        cls.objects.filter(email__iexact=email, is_used=False).update(is_used=True)
        code = ''.join(random.choices(string.digits, k=6))
        return cls.objects.create(email=email.lower(), code=code)