from rest_framework import serializers
from .models import URLScan


class URLScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = URLScan
        fields = '__all__'


class URLScanInputSerializer(serializers.Serializer):
    url = serializers.URLField()

    def validate_url(self, value):
        if len(value) > 2000:
            raise serializers.ValidationError(
                'URL çok uzun, maksimum 2000 karakter!'
            )
        return value