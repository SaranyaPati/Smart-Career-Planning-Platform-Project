from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Profile
from .serializers import RegisterSerializer, ProfileSerializer


# ---------------------------------------------------------------------------
# POST /api/register/
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """
    Public endpoint — creates a new user + blank profile.
    Request body: { username, email, password }
    Response: 201 Created
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ---------------------------------------------------------------------------
# GET /api/profile/
# ---------------------------------------------------------------------------

class ProfileView(APIView):
    """
    Protected endpoint — returns the authenticated user's profile.
    Response: { fullName, email, bio, skills, targetRole }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# PUT /api/profile/update/
# ---------------------------------------------------------------------------

class ProfileUpdateView(APIView):
    """
    Protected endpoint — updates the authenticated user's profile.
    Request body: { fullName, email, bio, skills, targetRole }
    Response: updated profile data
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True          # allow sending only the changed fields
        )

        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            # Return the fresh saved data
            response_serializer = ProfileSerializer(request.user)
            return Response(response_serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
