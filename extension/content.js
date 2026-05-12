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
    const risk = data.risk_level || (data.is_phishing ? 'high' : 'safe')
    
    const colors = {
      safe:   { bg: '#064e3b', border: '#10b981', text: '#6ee7b7', btn: '#10b981' },
      low:    { bg: '#1c3a1c', border: '#84cc16', text: '#bef264', btn: '#84cc16' },
      medium: { bg: '#713f12', border: '#f59e0b', text: '#fcd34d', btn: '#f59e0b' },
      high:   { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5', btn: '#ef4444' },
    }
    const c = colors[risk] || colors.high

    const labels = {
      safe:   { icon: '✅', title: 'PhishAnalyzer', msg: 'Bu site güvenli görünüyor', badge: '🟢 Güvenli' },
      low:    { icon: '⚠️', title: 'PhishAnalyzer Uyarısı', msg: 'Düşük risk tespit edildi', badge: '🟡 Düşük Risk' },
      medium: { icon: '⚠️', title: 'PhishAnalyzer Uyarısı', msg: 'Şüpheli site tespit edildi!', badge: '🟠 Orta Risk' },
      high:   { icon: '🚨', title: 'PhishAnalyzer Uyarısı', msg: 'Tehlikeli site tespit edildi!', badge: '🔴 Yüksek Risk' },
    }
    const l = labels[risk] || labels.high

    const aiText = data.ai_explanation ? String(data.ai_explanation) : ''
    const shortAI = aiText.substring(0, 100)
    const isLong = aiText.length > 100

    const aiSection = aiText ? (
      '<div style="font-size:12px;color:#fde68a;margin-top:8px;padding-top:8px;border-top:1px solid ' + c.border + ';">' +
      '🤖 <span id="pa-short">' + shortAI + (isLong ? '... ' : '') + '</span>' +
      (isLong ? '<span id="pa-full" style="display:none;">' + aiText + ' </span>' : '') +
      (isLong ? '<span onclick="document.getElementById(\'pa-short\').style.display=\'none\';document.getElementById(\'pa-full\').style.display=\'inline\';" style="color:#60a5fa;cursor:pointer;font-size:11px;">Devamını gör</span>' : '') +
      '</div>'
    ) : ''

    const warning = document.createElement('div')
    warning.id = 'phishanalyzer-warning'
    warning.innerHTML =
      '<div style="position:fixed;bottom:20px;right:20px;background:' + c.bg + ';border:2px solid ' + c.border + ';color:white;padding:16px 20px;border-radius:12px;z-index:99999;max-width:320px;font-family:Arial,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.5);">' +
      '<div style="font-size:18px;font-weight:bold;margin-bottom:4px;">' + l.icon + ' ' + l.title + '</div>' +
      '<div style="display:inline-block;padding:2px 8px;border-radius:99px;background:' + c.border + ';font-size:11px;font-weight:bold;margin-bottom:8px;">' + l.badge + '</div>' +
      '<div style="color:' + c.text + ';margin-bottom:6px;font-size:14px;">' + l.msg + '</div>' +
      '<div style="font-size:13px;color:' + c.text + ';margin-bottom:4px;">' +
      (data.is_phishing ? 'Tehdit Skoru: %' + data.confidence : 'Güvenlik Skoru: %' + (100 - data.confidence).toFixed(0)) +
      '</div>' +
      (data.explanations && data.explanations.length > 0 ? data.explanations.map(function(exp) { return '<div style="font-size:12px;color:' + c.text + ';margin-top:2px;">• ' + exp + '</div>'; }).join('') : '') +
      aiSection +
      '<button onclick="document.getElementById(\'phishanalyzer-warning\').remove()" style="margin-top:10px;background:' + c.btn + ';border:none;color:white;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:13px;">Kapat</button>' +
      '</div>'

    document.body.appendChild(warning)
    setTimeout(function() {
      var el = document.getElementById('phishanalyzer-warning')
      if (el) el.remove()
    }, 15000)
  })
  .catch(function(err) { console.log('PhishAnalyzer:', err) })
}