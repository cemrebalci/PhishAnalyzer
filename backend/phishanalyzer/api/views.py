from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import URLScanInputSerializer, URLScanSerializer
from .models import URLScan
from .ml_utils import predict_url, GEMINI_API_KEY
from django.utils import timezone
from datetime import timedelta


class URLScanView(APIView):

    def post(self, request):
        serializer = URLScanInputSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        url = serializer.validated_data['url']
        result = predict_url(url)

        scan = URLScan.objects.create(
            url=url,
            is_phishing=result['is_phishing'],
            confidence_score=result['confidence'],
            explanation=str(result['explanations'])
        )

        return Response({
            'id': scan.id,
            'url': url,
            'is_phishing': result['is_phishing'],
            'confidence': result['confidence'],
            'explanations': result['explanations'],
            'ai_explanation': result.get('ai_explanation'),
            'scanned_at': scan.scanned_at
        }, status=status.HTTP_200_OK)


class DashboardView(APIView):

    def get(self, request):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        scans = URLScan.objects.filter(scanned_at__gte=thirty_days_ago)

        total = scans.count()
        phishing = scans.filter(is_phishing=True).count()
        safe = scans.filter(is_phishing=False).count()

        daily = []
        for i in range(7):
            day = timezone.now() - timedelta(days=i)
            day_scans = scans.filter(scanned_at__date=day.date())
            daily.append({
                'date': day.strftime('%d %b'),
                'total': day_scans.count(),
                'phishing': day_scans.filter(is_phishing=True).count()
            })

        recent_threats = list(scans.filter(
            is_phishing=True
        ).values('url', 'confidence_score', 'scanned_at')[:5])

        return Response({
            'total': total,
            'phishing': phishing,
            'safe': safe,
            'safe_percentage': round((safe / total * 100), 1) if total > 0 else 0,
            'daily': daily,
            'recent_threats': recent_threats
        })


class ChatView(APIView):

    def post(self, request):
        from google import genai

        message = request.data.get('message', '')

        if not message:
            return Response(
                {'error': 'Mesaj boş olamaz'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not GEMINI_API_KEY:
            return Response(
                {'reply': 'AI servisi şu an kullanılamıyor.'},
                status=status.HTTP_200_OK
            )

        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            prompt = f"""
Sen PhishAnalyzer'ın güvenlik asistanısın. Sadece siber güvenlik,
phishing, URL güvenliği ve internet güvenliği konularında yardım et.
Türkçe cevap ver. Kısa ve anlaşılır ol.

Kullanıcı sorusu: {message}
"""
            response = client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            return Response({'reply': response.text})
        except Exception as e:
            print(f"Chat Gemini hatası: {e}")
            return Response(
                {'reply': 'Bir hata oluştu, tekrar deneyin.'},
                status=status.HTTP_200_OK
            )