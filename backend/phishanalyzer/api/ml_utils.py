import re
import joblib
import numpy as np
import pandas as pd
import os
from urllib.parse import urlparse
from google import genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '../model/phishanalyzer_model.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, '../model/phishanalyzer_features.pkl')

try:
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print("✅ Model başarıyla yüklendi")
except Exception as e:
    print(f"❌ Model yüklenemedi: {e}")
    model = None
    feature_names = []

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
print(f"GEMINI_API_KEY durumu: {'Var' if GEMINI_API_KEY else 'YOK'}")


def generate_ai_explanation(url, explanations, is_phishing=True):
    if not GEMINI_API_KEY:
        return None
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        if is_phishing:
            prompt = f"""
Sen bir siber güvenlik uzmanısın.
ML modelimiz bu URL'yi PHİSHİNG olarak tespit etti.

URL: {url}
Tespit edilen riskler: {', '.join(explanations) if explanations else 'URL yapısı şüpheli'}

Bu tespiti destekleyen kısa ve anlaşılır bir açıklama yaz. Türkçe yaz. Maksimum 2-3 cümle olsun.
Sadece açıklamayı yaz, başka bir şey ekleme.
"""
        else:
            prompt = f"""
Sen bir siber güvenlik uzmanısın.
ML modelimiz bu URL'yi GÜVENLİ olarak tespit etti.

URL: {url}

Kısa ve anlaşılır bir güvenlik onayı yaz. Türkçe yaz. Maksimum 1-2 cümle olsun.
Sadece açıklamayı yaz, başka bir şey ekleme.
"""
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini hatası: {e}")
        return None


def predict_url(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower().replace('www.', '')

    trusted_brands = [
        'google.com', 'youtube.com', 'facebook.com',
        'twitter.com', 'instagram.com', 'linkedin.com',
        'github.com', 'microsoft.com', 'apple.com',
        'amazon.com', 'wikipedia.org', 'reddit.com',
        'netflix.com', 'zoom.us', 'slack.com',
        'notion.so', 'dropbox.com', 'spotify.com',
        'twitch.tv', 'tiktok.com', 'whatsapp.com'
    ]

    trusted_tlds = [
        '.edu.tr', '.gov.tr', '.k12.tr', '.bel.tr',
        '.com.tr', '.org.tr', '.net.tr', '.edu', '.gov'
    ]

    for tld in trusted_tlds:
        if domain.endswith(tld):
            return {
                'is_phishing': False,
                'confidence': 5.0,
                'explanations': [],
                'ai_explanation': None,
                'features': {}
            }

    for brand in trusted_brands:
        if domain == brand or domain.endswith('.' + brand):
            return {
                'is_phishing': False,
                'confidence': 5.0,
                'explanations': [],
                'ai_explanation': None,
                'features': {}
            }

    features_dict = extract_features(url)
    X = pd.DataFrame([features_dict])[feature_names]

    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0]
    confidence = round(float(max(probability)) * 100, 2)
    explanations = explain_prediction(url, features_dict)
    is_phishing = bool(prediction == 0)
    ai_explanation = generate_ai_explanation(url, explanations, is_phishing) if (explanations or is_phishing) else None

    return {
        'is_phishing': is_phishing,
        'confidence': confidence,
        'explanations': explanations,
        'ai_explanation': ai_explanation,
        'features': features_dict
    }


def extract_features(url):
    parsed = urlparse(url)
    features = {
        'URLLength': len(url),
        'IsHTTPS': 1 if url.startswith('https') else 0,
        'NoOfSubDomain': url.count('.') - 1,
        'IsDomainIP': 1 if re.match(r'\d+\.\d+\.\d+\.\d+', parsed.netloc) else 0,
        'HasObfuscation': 1 if '%' in url else 0,
        'NoOfObfuscatedChar': url.count('%'),
        'HasPasswordField': 1 if 'password' in url.lower() else 0,
        'Bank': 1 if 'bank' in url.lower() else 0,
        'Pay': 1 if 'pay' in url.lower() else 0,
        'Crypto': 1 if 'crypto' in url.lower() else 0,
        'DegitRatioInURL': sum(c.isdigit() for c in url) / len(url) if len(url) > 0 else 0,
        'NoOfAmpersandInURL': url.count('&'),
        'URLSimilarityIndex': calculate_similarity(url),
        'TLDLegitimateProb': get_tld_prob(url),
    }
    return features


def calculate_similarity(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    brands = {
        'paypal': 'paypal.com', 'google': 'google.com',
        'amazon': 'amazon.com', 'facebook': 'facebook.com',
        'apple': 'apple.com', 'netflix': 'netflix.com',
        'microsoft': 'microsoft.com', 'twitter': 'twitter.com'
    }
    for brand, real_domain in brands.items():
        if brand in domain and real_domain not in domain:
            return 90.0
    return 10.0


def get_tld_prob(url):
    safe_tlds = ['.com', '.org', '.net', '.edu', '.gov']
    risky_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf']
    for tld in safe_tlds:
        if url.endswith(tld) or tld + '/' in url:
            return 0.9
    for tld in risky_tlds:
        if tld in url:
            return 0.1
    return 0.5


def explain_prediction(url, features_dict):
    explanations = []
    if features_dict['URLLength'] > 75:
        explanations.append(f'URL çok uzun ({features_dict["URLLength"]} karakter)')
    if features_dict['IsHTTPS'] == 0:
        explanations.append('HTTPS kullanmıyor — güvensiz bağlantı')
    if features_dict['NoOfSubDomain'] > 3:
        explanations.append(f'Çok fazla alt domain ({features_dict["NoOfSubDomain"]} adet)')
    if features_dict['IsDomainIP'] == 1:
        explanations.append('Domain yerine IP adresi kullanılmış')
    if features_dict['URLSimilarityIndex'] > 80:
        explanations.append('Marka taklidi tespit edildi')
    if features_dict['HasPasswordField'] == 1:
        explanations.append('Sahte şifre giriş formu tespit edildi')
    if features_dict['Bank'] == 1:
        explanations.append('Banka taklidi içeriyor')
    if features_dict['Pay'] == 1:
        explanations.append('Ödeme sistemi taklidi içeriyor')
    if features_dict['Crypto'] == 1:
        explanations.append('Kripto para dolandırıcılığı içeriyor')
    if features_dict['HasObfuscation'] == 1:
        explanations.append('Gizlenmiş/karartılmış karakterler var')
    if features_dict['TLDLegitimateProb'] < 0.3:
        explanations.append('Riskli domain uzantısı (.xyz, .tk gibi)')
    return explanations