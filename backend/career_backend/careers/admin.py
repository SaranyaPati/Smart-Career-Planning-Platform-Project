from django.contrib import admin
from .models import CareerPath

@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    list_display  = ('title', 'avg_salary', 'growth_rate', 'icon')
    search_fields = ('title', 'skills_needed')
