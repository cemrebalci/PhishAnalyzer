import { useState } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'

const riskConfig = {
  safe:   { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-400', badge: '🟢 Güvenli', icon: '✅', title: 'GÜVENLİ GÖRÜNÜYOR' },
  low:    { bg: 'bg-lime-950', border: 'border-lime-500', text: 'text-lime-400', badge: '🟡 Düşük Risk', icon: '⚠️', title: 'DÜŞÜK RİSK TESPİT EDİLDİ' },
  medium: { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400', badge: '🟠 Orta Risk', icon: '⚠️', title: 'ŞÜPHELİ SİTE TESPİT EDİLDİ' },
  high:   { bg: 'bg-red-950', border: 'border-red-500', text: 'text-red-400', badge: '🔴 Yüksek Risk', icon: '🚨', title: 'PHİSHİNG TESPİT EDİLDİ' },
}

function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('page') === 'dashboard' ? 'dashboard' : 'home'
  })
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async () => {
    if (!url) { setError('Lütfen bir URL giriniz!'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(
        'https://phishanalyzer-production.up.railway.app/api/scan/',
        { url }
      )
      setResult(res.data)
    } catch (err) {
      setError('Hata oluştu: ' + err.message)
    } finally { setLoading(false) }
  }

  const risk = result ? (riskConfig[result.risk_level] || riskConfig.high) : null

  return (
    <div className='min-h-screen text-white' style={{ background: '#0B1120' }}>

      {/* Navbar */}
      <nav style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className='px-8 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md'>
        <div className='flex items-center gap-3'>
          <img
            src='/pa-logo.jpg'
            alt='PhishAnalyzer Logo'
            className='w-9 h-9 rounded-full object-cover'
            style={{ border: '2px solid #38BDF8' }}
          />
          <span className='font-bold text-xl brand' style={{ color: '#38BDF8', fontFamily: 'Space Grotesk, sans-serif' }}>
            PhishAnalyzer
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setPage('home')}
            className='px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200'
            style={{
              background: page === 'home' ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: page === 'home' ? '#38BDF8' : '#94a3b8',
              border: page === 'home' ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
            }}
          >
            🛡️ Analiz
          </button>
          <button
            onClick={() => setPage('dashboard')}
            className='px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200'
            style={{
              background: page === 'dashboard' ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: page === 'dashboard' ? '#38BDF8' : '#94a3b8',
              border: page === 'dashboard' ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
            }}
          >
            📊 Dashboard
          </button>
        </div>
      </nav>

      {page === 'dashboard' && <Dashboard />}

      {page === 'home' && (
        <div className='flex flex-col items-center px-4' style={{ paddingTop: '80px' }}>

          {/* Radial gradient arka plan */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.08), transparent 60%)',
            pointerEvents: 'none', zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Logo */}
            <img
              src='/pa-logo.jpg'
              alt='PhishAnalyzer Logo'
              className='rounded-full object-cover mb-8'
              style={{
                width: '96px', height: '96px',
                border: '3px solid rgba(56,189,248,0.5)',
                boxShadow: '0 0 32px rgba(56,189,248,0.2)'
              }}
            />

            {/* Başlık */}
            <h1 className='font-bold mb-3 text-center' style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '3.5rem',
              background: 'linear-gradient(135deg, #38BDF8, #22D3EE, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              PhishAnalyzer
            </h1>
            <p className='mb-4 text-center' style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '480px' }}>
              AI destekli phishing URL analiz platformu — Makine öğrenmesi ile gerçek zamanlı tehdit tespiti
            </p>

            {/* Mini badges */}
            <div className='flex gap-3 mb-10 flex-wrap justify-center'>
              {['🤖 AI Destekli', '⚡ Gerçek Zamanlı', '🔒 ML Modeli', '🌐 Chrome Eklentisi'].map((badge, i) => (
                <span key={i} className='px-3 py-1 rounded-full text-xs font-medium' style={{
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  color: '#38BDF8'
                }}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Input */}
            <div className='w-full' style={{ maxWidth: '640px' }}>
              <div className='relative mb-3'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>🔗</span>
                <input
                  type='text'
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  placeholder='https://suphelisite.com'
                  className='w-full text-white outline-none text-base'
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px 16px 16px 44px',
                    backdropFilter: 'blur(12px)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <button
                onClick={handleScan}
                disabled={loading}
                className='w-full font-semibold text-base transition-all duration-200'
                style={{
                  background: loading ? '#164e63' : 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(14,165,233,0.3)',
                }}
                onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
              >
                {loading ? '⏳ Analiz Ediliyor...' : '🔍 Analiz Et'}
              </button>
            </div>

            {error && (
              <p className='mt-4 text-sm' style={{ color: '#f87171' }}>{error}</p>
            )}

            {/* Sonuç */}
            {result && risk && (
              <div className='mt-10 w-full pb-16' style={{ maxWidth: '640px' }}>
                <div className='rounded-2xl p-6' style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    result.risk_level === 'safe' ? 'rgba(34,197,94,0.3)' :
                    result.risk_level === 'high' ? 'rgba(239,68,68,0.3)' :
                    result.risk_level === 'medium' ? 'rgba(245,158,11,0.3)' :
                    'rgba(132,204,22,0.3)'
                  }`,
                  backdropFilter: 'blur(12px)'
                }}>
                  <div className='flex items-center gap-4 mb-6'>
                    <span className='text-4xl'>{risk.icon}</span>
                    <div>
                      <h2 className='font-bold text-xl' style={{ fontFamily: 'Space Grotesk, sans-serif', color: risk.text.replace('text-', '') }}>
                        {risk.title}
                      </h2>
                      <span className='text-xs font-semibold px-2 py-1 rounded-full' style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: '#94a3b8'
                      }}>
                        {risk.badge}
                      </span>
                    </div>
                    <div className='ml-auto text-right'>
                      <div className='font-bold text-3xl' style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: result.risk_level === 'safe' ? '#22c55e' :
                               result.risk_level === 'high' ? '#ef4444' :
                               result.risk_level === 'medium' ? '#f59e0b' : '#84cc16'
                      }}>
                        %{result.is_phishing ? result.confidence : (100 - result.confidence).toFixed(0)}
                      </div>
                      <div className='text-xs' style={{ color: '#64748b' }}>
                        {result.is_phishing ? 'Tehdit Skoru' : 'Güvenlik Skoru'}
                      </div>
                    </div>
                  </div>

                  {result.explanations?.length > 0 && (
                    <div className='mb-5'>
                      <h3 className='font-semibold mb-3 text-sm' style={{ color: '#94a3b8', fontFamily: 'Space Grotesk, sans-serif' }}>
                        TESPİT EDİLEN RİSKLER
                      </h3>
                      <ul className='space-y-2'>
                        {result.explanations.map((exp, i) => (
                          <li key={i} className='flex items-center gap-2 text-sm' style={{ color: '#cbd5e1' }}>
                            <span style={{ color: '#ef4444' }}>▸</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.ai_explanation && (
                    <div className='rounded-xl p-4' style={{
                      background: 'rgba(56,189,248,0.05)',
                      border: '1px solid rgba(56,189,248,0.15)'
                    }}>
                      <h3 className='font-semibold mb-2 text-sm' style={{
                        color: '#38BDF8',
                        fontFamily: 'Space Grotesk, sans-serif'
                      }}>
                        🤖 YAPAY ZEKA ANALİZİ
                      </h3>
                      <p className='text-sm leading-relaxed' style={{ color: '#94a3b8' }}>
                        {result.ai_explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App