from django.urls import path
from .views import URLScanView, DashboardView, ChatView

urlpatterns = [
    path('scan/', URLScanView.as_view()),
    path('dashboard/', DashboardView.as_view()),
    path('chat/', ChatView.as_view()),
]