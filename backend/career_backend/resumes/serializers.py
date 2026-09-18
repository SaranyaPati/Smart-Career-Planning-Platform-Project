from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    file_url    = serializers.SerializerMethodField()
    file_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Resume
        fields = ['id', 'title', 'file', 'file_url', 'file_name', 'status', 'uploaded_at']
        extra_kwargs = {
            'file':  {'write_only': True},
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
