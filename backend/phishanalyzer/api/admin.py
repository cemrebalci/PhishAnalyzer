from django.contrib import admin
from .models import URLScan
 
@admin.register(URLScan)
class URLScanAdmin(admin.ModelAdmin):
    list_display = [
        'url', 'is_phishing',
        'confidence_score', 'scanned_at'
    ]
    list_filter = ['is_phishing']
    search_fields = ['url']
