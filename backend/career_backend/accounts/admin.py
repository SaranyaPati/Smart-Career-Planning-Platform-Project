from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'target_role', 'skills', 'updated_at')
    search_fields = ('user__username', 'user__email', 'target_role')
    list_filter   = ('updated_at',)
    readonly_fields = ('created_at', 'updated_at')
