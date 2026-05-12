const currentURL = window.location.href

if (currentURL.startsWith('http') && 
    !currentURL.includes('railway.app') && 
    !currentURL.includes('vercel.app') && 
    !currentURL.includes('localhost')) {

  fetch('https://phishanalyzer-production.up.railway.app/api/scan/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: currentURL })
  })
  .then(res => res.json())
  .then(data => {
    const isPhishing = data.is_phishing
    const warning = document.createElement('div')
    warning.id = 'phishanalyzer-warning'
    warning.innerHTML = `
      <div style="
        position:fixed;bottom:20px;right:20px;
        background:${isPhishing ? '#7f1d1d' : '#064e3b'};
        border:2px solid ${isPhishing ? '#ef4444' : '#10b981'};
        color:white;padding:16px 20px;border-radius:12px;
        z-index:99999;max-width:320px;
        font-family:Arial,sans-serif;
        box-shadow:0 4px 20px rgba(0,0,0,0.5);
      ">
        <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">
          ${isPhishing ? '⚠️ PhishAnalyzer Uyarısı' : '✅ PhishAnalyzer'}
        </div>
        <div style="color:${isPhishing ? '#fca5a5' : '#6ee7b7'};margin-bottom:6px;font-size:14px;">
          ${isPhishing ? 'Bu site tehlikeli olabilir!' : 'Bu site güvenli görünüyor'}
        </div>
        <div style="font-size:13px;color:${isPhishing ? '#fca5a5' : '#6ee7b7'};margin-bottom:4px;">
          ${isPhishing ? 'Tehdit Skoru: %' + data.confidence : 'Güvenlik Skoru: %' + (100 - data.confidence).toFixed(0)}
        </div>
        ${isPhishing && data.explanations ? data.explanations.map(exp =>
          `<div style="font-size:12px;color:#fca5a5;margin-top:2px;">• ${exp}</div>`
        ).join('') : ''}
        ${isPhishing && data.ai_explanation ? `
          <div style="font-size:12px;color:#fde68a;margin-top:8px;padding-top:8px;border-top:1px solid #ef4444;">
            🤖 ${data.ai_explanation.substring(0, 150)}
          </div>
        ` : ''}
        <button onclick="document.getElementById('phishanalyzer-warning').remove()" style="
          margin-top:10px;
          background:${isPhishing ? '#ef4444' : '#10b981'};
          border:none;color:white;padding:5px 14px;
          border-radius:6px;cursor:pointer;font-size:13px;
        ">Kapat</button>
      </div>
    `
    document.body.appendChild(warning)
    setTimeout(() => {
      const el = document.getElementById('phishanalyzer-warning')
      if (el) el.remove()
    }, 8000)
  })
  .catch(err => console.log('PhishAnalyzer:', err))
}