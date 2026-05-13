import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'

const riskConfig = {
  safe:   { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-400', badge: '🟢 Güvenli', icon: '✅', title: 'GÜVENLİ GÖRÜNÜYOR' },
  low:    { bg: 'bg-lime-950', border: 'border-lime-500', text: 'text-lime-400', badge: '🟡 Düşük Risk', icon: '⚠️', title: 'DÜŞÜK RİSK TESPİT EDİLDİ' },
  medium: { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400', badge: '🟠 Orta Risk', icon: '⚠️', title: 'ŞÜPHELİ SİTE TESPİT EDİLDİ' },
  high:   { bg: 'bg-red-950', border: 'border-red-500', text: 'text-red-400', badge: '🔴 Yüksek Risk', icon: '🚨', title: 'PHİSHİNG TESPİT EDİLDİ' },
}

const SkeletonLine = ({ width = '100%' }) => (
  <div style={{
    height: '12px',
    borderRadius: '6px',
    width,
    background: 'linear-gradient(90deg, rgba(56,189,248,0.08) 25%, rgba(56,189,248,0.18) 50%, rgba(56,189,248,0.08) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }} />
)

const highlightText = (text) => {
  const keywords = [
    'HTTPS', 'HTTP', 'phishing', 'kimlik avı', 'sahte', 'tehlikeli',
    'dolandırıcılık', 'şüpheli', 'zararlı', 'kötü niyetli', 'SSL',
    'güvenli', 'güvensiz', 'risk', 'tehdit', 'engel'
  ]
  const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'))
  return parts.map((part, i) =>
    keywords.some(k => k.toLowerCase() === part.toLowerCase())
      ? <span key={i} style={{ color: '#38BDF8', fontWeight: '600' }}>{part}</span>
      : part
  )
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
  const [stats, setStats] = useState(null)
  const [displayConfidence, setDisplayConfidence] = useState(0)

  useEffect(() => {
    axios.get('https://phishanalyzer-production.up.railway.app/api/dashboard/')
      .then(res => setStats(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (result) {
      const target = result.is_phishing
        ? parseFloat(result.confidence)
        : parseFloat((100 - result.confidence).toFixed(1))
      let start = 0
      const step = target / 40
      const timer = setInterval(() => {
        start += step
        if (start >= target) {
          setDisplayConfidence(target)
          clearInterval(timer)
        } else {
          setDisplayConfidence(Math.floor(start))
        }
      }, 30)
      return () => clearInterval(timer)
    }
  }, [result])

  const miniStats = [
    { icon: '🔍', label: 'Toplam Tarama', value: stats ? `${stats.total}` : '...' },
    { icon: '🚨', label: 'Tehdit Engellendi', value: stats ? `${stats.phishing}` : '...' },
    { icon: '🛡️', label: 'Güvenlik Oranı', value: stats ? `%${stats.safe_percentage}` : '...' },
  ]

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
    <div className='min-h-screen text-white' style={{
      background: '#0B1120',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
    }}>

      <nav
        style={{
          background: 'rgba(8,15,30,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(14px)',
        }}
        className='px-8 py-4 flex items-center justify-between sticky top-0 z-50'
      >
        <div className='flex items-center gap-3'>
          <img
            src='/pa-logo.jpg'
            alt='PhishAnalyzer Logo'
            className='w-9 h-9 rounded-full object-cover'
            style={{ border: '2px solid #38BDF8' }}
          />
          <span className='font-bold text-xl' style={{ color: '#38BDF8', fontFamily: 'Space Grotesk, sans-serif' }}>
            PhishAnalyzer
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setPage('home')}
            className='px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200'
            style={{
              background: 'transparent',
              color: page === 'home' ? '#38BDF8' : '#94a3b8',
              border: page === 'home' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: page === 'home' ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
            }}
          >
            🛡️ Analiz
          </button>
          <button
            onClick={() => setPage('dashboard')}
            className='px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200'
            style={{
              background: 'transparent',
              color: page === 'dashboard' ? '#38BDF8' : '#94a3b8',
              border: page === 'dashboard' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: page === 'dashboard' ? '0 0 12px rgba(56,189,248,0.2)' : 'none',
            }}
          >
            📊 Dashboard
          </button>
        </div>
      </nav>

      {page === 'dashboard' && <Dashboard />}

      {page === 'home' && (
        <div style={{
          minHeight: 'calc(100vh - 65px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: result ? 'flex-start' : 'center',
          padding: result ? '60px 16px' : '0 16px',
          position: 'relative',
        }}>

          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.07), transparent 55%)',
            pointerEvents: 'none', zIndex: 0
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>

            <img
              src='/pa-logo.jpg'
              alt='PhishAnalyzer Logo'
              className='rounded-full object-cover mb-6'
              style={{
                width: '88px', height: '88px',
                border: '2px solid rgba(56,189,248,0.4)',
                boxShadow: '0 0 40px rgba(56,189,248,0.4), 0 0 80px rgba(56,189,248,0.15)'
              }}
            />

            <h1 className='font-bold mb-4 text-center' style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '3.5rem',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #38BDF8, #22D3EE, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PhishAnalyzer
            </h1>

            <p className='mb-8 text-center' style={{ color: '#64748b', fontSize: '1rem', maxWidth: '440px', lineHeight: 1.6 }}>
              AI destekli phishing URL analiz platformu — Makine öğrenmesi ile gerçek zamanlı tehdit tespiti
            </p>

            <div className='flex gap-2 mb-10 flex-wrap justify-center'>
              {['🤖 AI Destekli', '⚡ Gerçek Zamanlı', '🔒 ML Modeli', '🌐 Chrome Eklentisi'].map((badge, i) => (
                <span key={i} className='px-3 py-1 rounded-full text-xs font-medium' style={{
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.18)',
                  color: '#7DD3FC'
                }}>
                  {badge}
                </span>
              ))}
            </div>

            <div className='w-full mb-8' style={{ maxWidth: '600px' }}>
              <div className='relative mb-3'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2' style={{ color: '#475569' }}>🔗</span>
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
                    padding: '15px 16px 15px 44px',
                    backdropFilter: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(56,189,248,0.5)'
                    e.target.style.boxShadow = '0 0 0 4px rgba(56,189,248,0.08)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <button
                onClick={handleScan}
                disabled={loading}
                className='w-full font-semibold text-base'
                style={{
                  background: loading ? '#164e63' : 'linear-gradient(180deg, #38BDF8, #06B6D4)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  color: '#0B1120',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(56,189,248,0.25)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(56,189,248,0.35)' }}}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(56,189,248,0.25)' }}
              >
                {loading ? '⏳ Analiz Ediliyor...' : '🔍 Analiz Et'}
              </button>
            </div>

            {!result && (
              <div className='flex gap-4 flex-wrap justify-center'>
                {miniStats.map((stat, i) => (
                  <div key={i} className='text-center px-6 py-4 rounded-xl' style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    minWidth: '130px',
                  }}>
                    <div className='text-lg mb-2'>{stat.icon}</div>
                    <div className='font-bold text-lg' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#38BDF8' }}>
                      {stat.value}
                    </div>
                    <div className='text-xs mt-1' style={{ color: '#475569' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className='mt-4 text-sm' style={{ color: '#f87171' }}>{error}</p>
            )}

            {result && risk && (
              <div className='mt-8 w-full pb-16' style={{ maxWidth: '600px' }}>
                <div className='rounded-2xl p-6' style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    result.risk_level === 'safe' ? 'rgba(34,197,94,0.25)' :
                    result.risk_level === 'high' ? 'rgba(239,68,68,0.25)' :
                    result.risk_level === 'medium' ? 'rgba(245,158,11,0.25)' :
                    'rgba(132,204,22,0.25)'
                  }`,
                  backdropFilter: 'blur(12px)'
                }}>
                  <div className='flex items-center gap-4 mb-6'>
                    <span className='text-4xl'>{risk.icon}</span>
                    <div>
                      <h2 className='font-bold text-xl' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                        {risk.title}
                      </h2>
                      <span className='text-xs font-medium px-2 py-1 rounded-full' style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: '#64748b'
                      }}>
                        {risk.badge}
                      </span>
                    </div>
                    <div className='ml-auto text-right'>
                      <div className='font-bold text-3xl' style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: result.risk_level === 'safe' ? '#22c55e' :
                               result.risk_level === 'high' ? '#ef4444' :
                               result.risk_level === 'medium' ? '#f59e0b' : '#84cc16',
                        transition: 'all 0.1s ease'
                      }}>
                        %{displayConfidence}
                      </div>
                      <div className='text-xs' style={{ color: '#475569' }}>
                        {result.is_phishing ? 'Tehdit Skoru' : 'Güvenlik Skoru'}
                      </div>
                    </div>
                  </div>

                  <div className='rounded-xl p-4' style={{
                    background: 'rgba(56,189,248,0.04)',
                    border: '1px solid rgba(56,189,248,0.12)'
                  }}>
                    <h3 className='font-semibold mb-3 text-xs' style={{
                      color: '#38BDF8',
                      fontFamily: 'Space Grotesk, sans-serif',
                      letterSpacing: '0.05em'
                    }}>
                      🤖 YAPAY ZEKA ANALİZİ
                    </h3>
                    {result.ai_explanation ? (
                      <p className='text-sm leading-7' style={{ color: '#94a3b8' }}>
                        {highlightText(result.ai_explanation)}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <SkeletonLine width='100%' />
                        <SkeletonLine width='88%' />
                        <SkeletonLine width='72%' />
                      </div>
                    )}
                  </div>

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