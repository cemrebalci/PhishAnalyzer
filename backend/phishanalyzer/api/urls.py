from django.urls import path
from .views import URLScanView, DashboardView

urlpatterns = [
    path('scan/', URLScanView.as_view()),
    path('dashboard/', DashboardView.as_view()),
]