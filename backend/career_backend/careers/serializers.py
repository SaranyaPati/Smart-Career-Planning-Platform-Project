from rest_framework import serializers
from .models import CareerPath


class CareerPathSerializer(serializers.ModelSerializer):
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model  = CareerPath
        fields = ['id', 'title', 'description', 'skills_needed', 'skills_list',
                  'avg_salary', 'growth_rate', 'icon', 'created_at']

    def get_skills_list(self, obj):
        if obj.skills_needed:
            return [s.strip() for s in obj.skills_needed.split(',') if s.strip()]
        return []
