#!/usr/bin/env bash
# Render build script for Django backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# Only run migrations if DATABASE_URL is set (production PostgreSQL)
if [ -n "$DATABASE_URL" ]; then
  python manage.py migrate
else
  echo "WARNING: DATABASE_URL not set — skipping migrate"
fi
