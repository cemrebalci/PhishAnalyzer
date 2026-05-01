from django.db import models
from django.contrib.auth.models import User
 
class URLScan(models.Model):
    url = models.TextField()
    is_phishing = models.BooleanField()
    confidence_score = models.FloatField()
    explanation = models.TextField(blank=True)
    virustotal_result = models.TextField(
        null=True, blank=True
    )
    scanned_at = models.DateTimeField(
        auto_now_add=True
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
 
    class Meta:
        ordering = ['-scanned_at']
 
    def __str__(self):
        status = 'PHISHING' if self.is_phishing else 'GÜVENLI'
        return f'{status} - {self.url[:50]}'
