from django.contrib import admin
from .models import Resume

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display  = ('user', 'title', 'status', 'uploaded_at')
    list_filter   = ('status',)
    search_fields = ('user__username', 'title')
    readonly_fields = ('uploaded_at', 'updated_at')
