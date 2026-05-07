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
    if (data.is_phishing && data.confidence >= 80) {
      const fullAI = data.ai_explanation || ''
      const shortAI = fullAI.substring(0, 100)
      const isLong = fullAI.length > 100

      const aiSection = fullAI ? `
        <div id="pa-ai-short" style="font-size:12px;color:#fde68a;margin-top:8px;padding-top:8px;border-top:1px solid #ef4444;">
          🤖 ${shortAI}${isLong ? '...' : ''}
          ${isLong ? `<span onclick="
            document.getElementById('pa-ai-short').style.display='none';
            document.getElementById('pa-ai-full').style.display='block';
          " style="color:#60a5fa;cursor:pointer;margin-left:4px;font-size:11px;">Devamını gör</span>` : ''}
        </div>
        ${isLong ? `<div id="pa-ai-full" style="display:none;font-size:12px;color:#fde68a;margin-top:8px;padding-top:8px;border-top:1px solid #ef4444;">
          🤖 ${fullAI}
          <span onclick="
            document.getElementById('pa-ai-full').style.display='none';
            document.getElementById('pa-ai-short').style.display='block';
          " style="color:#60a5fa;cursor:pointer;margin-left:4px;font-size:11px;">Gizle</span>
        </div>` : ''}
      ` : ''

      const warning = document.createElement('div')
      warning.id = 'phishanalyzer-warning'
      warning.innerHTML = `
        <div style="
          position:fixed;bottom:20px;right:20px;
          background:#7f1d1d;border:2px solid #ef4444;
          color:white;padding:16px 20px;border-radius:12px;
          z-index:99999;max-width:320px;
          font-family:Arial,sans-serif;
          box-shadow:0 4px 20px rgba(0,0,0,0.5);
        ">
          <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">
            ⚠️ PhishAnalyzer Uyarısı
          </div>
          <div style="color:#fca5a5;margin-bottom:6px;font-size:14px;">
            Bu site tehlikeli olabilir!
          </div>
          <div style="font-size:13px;color:#fca5a5;margin-bottom:4px;">
            Tehdit Skoru: %${data.confidence}
          </div>
          ${data.explanations.map(exp =>
            `<div style="font-size:12px;color:#fca5a5;margin-top:2px;">• ${exp}</div>`
          ).join('')}
          ${aiSection}
          <button onclick="document.getElementById('phishanalyzer-warning').remove()" style="
            margin-top:10px;background:#ef4444;border:none;
            color:white;padding:5px 14px;border-radius:6px;
            cursor:pointer;font-size:13px;
          ">Kapat</button>
        </div>
      `
      document.body.appendChild(warning)
      setTimeout(() => {
        const el = document.getElementById('phishanalyzer-warning')
        if (el) el.remove()
      }, 15000)
    }
  })
  .catch(err => console.log('PhishAnalyzer:', err))
}