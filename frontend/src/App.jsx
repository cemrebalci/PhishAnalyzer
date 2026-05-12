import { useState } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'

const riskConfig = {
  safe:   { bg: 'bg-green-900', border: 'border-green-500', text: 'text-green-400', badge: '🟢 Güvenli', icon: '✅', title: 'GÜVENLİ GÖRÜNÜYOR' },
  low:    { bg: 'bg-lime-900', border: 'border-lime-500', text: 'text-lime-400', badge: '🟡 Düşük Risk', icon: '⚠️', title: 'DÜŞÜK RİSK TESPİT EDİLDİ' },
  medium: { bg: 'bg-yellow-900', border: 'border-yellow-500', text: 'text-yellow-400', badge: '🟠 Orta Risk', icon: '⚠️', title: 'ŞÜPHELI SİTE TESPİT EDİLDİ' },
  high:   { bg: 'bg-red-900', border: 'border-red-500', text: 'text-red-400', badge: '🔴 Yüksek Risk', icon: '🚨', title: 'PHİSHİNG TESPİT EDİLDİ' },
}

function App() {
  const [page, setPage] = useState('home')
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
    <div className='min-h-screen bg-gray-900 text-white'>
      <nav className='bg-gray-800 p-4 flex gap-6 border-b border-gray-700'>
        <button
          onClick={() => setPage('home')}
          className={`font-bold text-lg ${page === 'home' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          🛡️ Analiz
        </button>
        <button
          onClick={() => setPage('dashboard')}
          className={`font-bold text-lg ${page === 'dashboard' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          📊 Dashboard
        </button>
      </nav>

      {page === 'dashboard' && <Dashboard />}

      {page === 'home' && (
        <div className='flex flex-col items-center pt-20 px-4'>
          <h1 className='text-5xl font-bold text-cyan-400 mb-2'>
            🛡️ PhishAnalyzer
          </h1>
          <p className='text-gray-400 mb-10 text-lg'>
            AI destekli phishing URL analiz platformu
          </p>

          <div className='w-full max-w-2xl'>
            <input
              type='text'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder='https://suphelisite.com'
              className='w-full p-4 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-400 text-lg'
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className='mt-3 w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors'
            >
              {loading ? '⏳ Analiz Ediliyor...' : '🔍 Analiz Et'}
            </button>
          </div>

          {error && <p className='mt-4 text-red-400 text-lg'>{error}</p>}

          {result && risk && (
            <div className='mt-8 w-full max-w-2xl pb-10'>
              <div className={`border rounded-xl p-6 ${risk.bg} ${risk.border}`}>

                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-4xl'>{risk.icon}</span>
                  <div>
                    <h2 className={`text-2xl font-bold ${risk.text}`}>
                      {risk.title}
                    </h2>
                    <span className={`text-sm font-bold ${risk.text}`}>
                      {risk.badge}
                    </span>
                  </div>
                </div>

                <p className='text-gray-300 text-lg mb-4'>
                  {result.is_phishing ? 'Tehdit Skoru:' : 'Güvenlik Skoru:'}
                  <span className={`ml-2 font-bold text-2xl ${risk.text}`}>
                    {result.is_phishing
                      ? `%${result.confidence}`
                      : `%${(100 - result.confidence).toFixed(0)}`}
                  </span>
                </p>

                {result.explanations?.length > 0 && (
                  <div className='mb-4'>
                    <h3 className='font-bold text-gray-200 mb-2 text-lg'>Neden Tehlikeli?</h3>
                    <ul className='space-y-2'>
                      {result.explanations.map((exp, i) => (
                        <li key={i} className='text-gray-300 flex gap-2'>
                          <span>•</span><span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.ai_explanation && (
                  <div className='p-4 bg-gray-800 rounded-lg border border-cyan-500'>
                    <h3 className='font-bold text-cyan-400 mb-2'>🤖 Yapay Zeka Güvenlik Analizi</h3>
                    <p className='text-gray-300 text-sm leading-relaxed'>{result.ai_explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App