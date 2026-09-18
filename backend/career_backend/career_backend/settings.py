"""
Django settings for career_backend project.
"""

from pathlib import Path
from datetime import timedelta
import os

# ---------------------------------------------------------------------------
# Base directory
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------
SECRET_KEY = 'django-insecure-p^9i^+epcy9&e&q=0!-%vk$%#bd2qy)0$5iy@uscow1d@y^4z^'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'accounts',
    'resumes',
    'careers',
    'jobs',
]


# ---------------------------------------------------------------------------
# Middleware  (CorsMiddleware MUST be before CommonMiddleware)
# ---------------------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'career_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'career_backend.wsgi.application'


# ---------------------------------------------------------------------------
# Database — MySQL
# ---------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'career_platform',
        'USER': 'root',
        'PASSWORD': 'saranya4591',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static & Media files
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ---------------------------------------------------------------------------
# CORS — allow React dev server
# ---------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True          # fine for development
# In production replace with:
# CORS_ALLOWED_ORIGINS = ['http://localhost:5173']


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}


# ---------------------------------------------------------------------------
# Simple JWT settings
# ---------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=24),   # matches frontend 24-h exp
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),                # frontend sends "Bearer <token>"
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
}


# ---------------------------------------------------------------------------
# Email — Gmail SMTP (used for OTP delivery)
# ---------------------------------------------------------------------------
# To create a Gmail App Password:
#   1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
#   2. Then go to Security → App passwords → create one for "Mail"
#   3. Paste the 16-character password into EMAIL_HOST_PASSWORD below
# ---------------------------------------------------------------------------

EMAIL_BACKEND        = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST           = 'smtp.gmail.com'
EMAIL_PORT           = 587
EMAIL_USE_TLS        = True
EMAIL_HOST_USER      = 'patisaranya@gmail.com'   # ← your Gmail address
EMAIL_HOST_PASSWORD  = 'PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE'   # ← Gmail App Password
DEFAULT_FROM_EMAIL   = EMAIL_HOST_USER
