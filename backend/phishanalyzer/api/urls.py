from django.urls import path
from . import views
from .views import URLScanView

urlpatterns = [
    path('scan/', URLScanView.as_view()),
]