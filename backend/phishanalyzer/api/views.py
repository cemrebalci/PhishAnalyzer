from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import URLScanInputSerializer, URLScanSerializer
from .models import URLScan
from .ml_utils import predict_url


class URLScanView(APIView):

    def post(self, request):
        serializer = URLScanInputSerializer(
            data=request.data
        )

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
            'scanned_at': scan.scanned_at
        }, status=status.HTTP_200_OK)