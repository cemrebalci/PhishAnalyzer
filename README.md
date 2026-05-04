# 🛡️ PhishAnalyzer
### AI-Powered Phishing URL Detection & Threat Analysis Platform

## Proje Hakkında
PhishAnalyzer, makine öğrenmesi kullanarak URL'lerin phishing (kimlik avı) olup olmadığını tespit eden, neden tehlikeli olduğunu açıklayan ve Chrome eklentisi ile her sitede otomatik koruma sağlayan bir web platformudur.

## 🌐 Canlı Linkler
- **Web Platformu:** https://phish-analyzer.vercel.app
- **API:** https://phishanalyzer-production.up.railway.app

## ✨ Özellikler
- 🤖 AI destekli URL analizi (Random Forest, %99.99 doğruluk)
- 💬 Explainability — neden tehlikeli olduğunu açıklar
- 📊 Dashboard — istatistikler ve tehdit geçmişi
- 🔌 Chrome eklentisi — her sitede otomatik koruma
- 🗄️ PostgreSQL ile tarama geçmişi kaydı

## 🛠️ Teknolojiler
- **Backend:** Python, Django REST Framework
- **Frontend:** React, Tailwind CSS
- **AI/ML:** Scikit-learn, Random Forest, XGBoost
- **Veritabanı:** PostgreSQL
- **Deployment:** Railway (backend), Vercel (frontend)

## 🤖 Model Performansı
- Dataset: 235.795 URL
- Karşılaştırılan algoritmalar: Random Forest, XGBoost, Logistic Regression
- En iyi model: Random Forest — %99.99 doğruluk
