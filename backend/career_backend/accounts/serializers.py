from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


# ---------------------------------------------------------------------------
# Register Serializer
# ---------------------------------------------------------------------------

class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
    Accepts: username, email, password
    Creates a User and a blank Profile.
    """

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Create the Django User with a hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create an empty Profile for this user (all fields optional)
        Profile.objects.create(user=user)

        return user


# ---------------------------------------------------------------------------
# Profile Serializer
# ---------------------------------------------------------------------------

class ProfileSerializer(serializers.Serializer):
    """
    Serializes and deserializes the combined User + Profile data.
    Uses camelCase field names to match the React frontend exactly:
      - fullName     → User.first_name (or username if empty)
      - email        → User.email
      - phone        → Profile.phone
      - bio          → Profile.bio
      - education    → Profile.education
      - linkedinUrl  → Profile.linkedin_url
      - githubUrl    → Profile.github_url
      - skills       → Profile.skills
      - targetRole   → Profile.target_role
    """

    fullName    = serializers.CharField(required=False, allow_blank=True)
    email       = serializers.EmailField(required=False)
    phone       = serializers.CharField(required=False, allow_blank=True)
    bio         = serializers.CharField(required=False, allow_blank=True)
    education   = serializers.CharField(required=False, allow_blank=True)
    linkedinUrl = serializers.URLField(required=False, allow_blank=True)
    githubUrl   = serializers.URLField(required=False, allow_blank=True)
    skills      = serializers.CharField(required=False, allow_blank=True)
    targetRole  = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        """
        Build the response dict from a User instance.
        `instance` is the User object (request.user).
        """
        user = instance
        profile = getattr(user, 'profile', None)

        # Prefer full_name stored as first_name; fall back to username
        full_name = (user.first_name or '').strip()
        if not full_name:
            full_name = user.username

        return {
            'fullName':    full_name,
            'email':       user.email,
            'phone':       profile.phone        if profile else '',
            'bio':         profile.bio          if profile else '',
            'education':   profile.education    if profile else '',
            'linkedinUrl': profile.linkedin_url if profile else '',
            'githubUrl':   profile.github_url   if profile else '',
            'skills':      profile.skills       if profile else '',
            'targetRole':  profile.target_role  if profile else '',
        }

    def update(self, instance, validated_data):
        """
        Update both User and Profile from the validated camelCase data.
        `instance` is the User object.
        """
        user = instance

        # Update User fields
        if 'fullName' in validated_data:
            user.first_name = validated_data['fullName']
        if 'email' in validated_data:
            user.email = validated_data['email']
        user.save()

        # Update Profile fields
        profile, _ = Profile.objects.get_or_create(user=user)
        if 'phone' in validated_data:
            profile.phone = validated_data['phone']
        if 'bio' in validated_data:
            profile.bio = validated_data['bio']
        if 'education' in validated_data:
            profile.education = validated_data['education']
        if 'linkedinUrl' in validated_data:
            profile.linkedin_url = validated_data['linkedinUrl']
        if 'githubUrl' in validated_data:
            profile.github_url = validated_data['githubUrl']
        if 'skills' in validated_data:
            profile.skills = validated_data['skills']
        if 'targetRole' in validated_data:
            profile.target_role = validated_data['targetRole']
        profile.save()

        return user