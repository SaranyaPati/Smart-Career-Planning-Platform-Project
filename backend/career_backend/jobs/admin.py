from django.contrib import admin
from .models import Job, SavedJob, JobApplication

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display  = ('title', 'company', 'location_type', 'is_active', 'posted_at')
    list_filter   = ('location_type', 'is_active')
    search_fields = ('title', 'company', 'skills_required')
    readonly_fields = ('posted_at',)

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display  = ('user', 'job', 'saved_at')
    search_fields = ('user__username', 'job__title')

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display  = ('user', 'job', 'full_name', 'email', 'status', 'applied_at')
    list_filter   = ('status',)
    search_fields = ('user__username', 'job__title', 'full_name', 'email')
    readonly_fields = ('applied_at',)
    list_editable = ('status',)
