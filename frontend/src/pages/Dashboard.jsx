import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('https://phishanalyzer-production.up.railway.app/api/dashboard/')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center' style={{ background: '#0B1120' }}>
      <div className='text-center'>
        <div className='text-4xl mb-4'>⏳</div>
        <p style={{ color: '#38BDF8', fontFamily: 'Space Grotesk, sans-serif' }}>Yükleniyor...</p>
      </div>
    </div>
  )

  const pieData = [
    { name: 'Güvenli', value: data?.safe || 0 },
    { name: 'Phishing', value: data?.phishing || 0 },
  ]
  const COLORS = ['#15803d', '#b91c1c']

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
  }

  return (
    <div className='min-h-screen text-white' style={{ background: '#0B1120', padding: '40px 32px' }}>

      <div className='mb-10'>
        <h1 className='font-bold mb-1' style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '2rem',
          letterSpacing: '-0.02em',
          color: '#f1f5f9'
        }}>
          Güvenlik Paneli
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem' }}>
          Son 30 günün analiz özeti
        </p>
      </div>

      {/* Özet Kartlar */}
      <div className='grid grid-cols-3 gap-5 mb-8'>
        <div style={{ ...cardStyle }}>
          <p className='text-sm mb-3' style={{ color: '#64748b' }}>📊 Toplam Tarama</p>
          <p className='font-bold' style={{ fontSize: '2.5rem', fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
            {data?.total || 0}
          </p>
        </div>
        <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
          <p className='text-sm mb-3' style={{ color: '#64748b' }}>🚨 Phishing Tespit</p>
          <p className='font-bold' style={{ fontSize: '2.5rem', fontFamily: 'Space Grotesk, sans-serif', color: '#ef4444' }}>
            {data?.phishing || 0}
          </p>
        </div>
        <div style={{ ...cardStyle, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.05)', boxShadow: '0 0 20px rgba(34,197,94,0.08)' }}>
          <p className='text-sm mb-3' style={{ color: '#64748b' }}>🛡️ Güvenlik Oranı</p>
          <p className='font-bold' style={{ fontSize: '2.5rem', fontFamily: 'Space Grotesk, sans-serif', color: '#22c55e' }}>
            %{data?.safe_percentage || 0}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-5 mb-8'>
        <div style={cardStyle}>
          <h2 className='font-semibold mb-4' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            RİSK DAĞILIMI
          </h2>
          {data?.total > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  dataKey='value'
                  label={({ percent }) => `%${(percent * 100).toFixed(0)}`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value, name) => [`${value} site`, name]}
                />
                <Legend
                  verticalAlign='bottom'
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: value === 'Güvenli' ? '#22c55e' : '#ef4444', fontSize: '13px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#475569' }}>Henüz veri yok</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2 className='font-semibold mb-4' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            SON TESPİT EDİLEN TEHDİTLER
          </h2>
          {!data?.recent_threats?.length ? (
            <p style={{ color: '#475569' }}>Henüz tehdit tespit edilmedi</p>
          ) : (
            <table className='w-full'>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className='text-left pb-3 text-xs' style={{ color: '#475569' }}>URL</th>
                  <th className='text-left pb-3 text-xs' style={{ color: '#475569' }}>SEBEP</th>
                  <th className='text-right pb-3 text-xs' style={{ color: '#475569' }}>RİSK</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_threats?.map((threat, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className='py-3 text-sm' style={{ maxWidth: '160px' }}>
                      <span
                        title={threat.url}
                        style={{
                          color: '#cbd5e1',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'default',
                        }}
                      >
                        {threat.url}
                      </span>
                    </td>
                    <td className='py-3 text-xs' style={{ color: '#f59e0b' }}>
                      {threat.reason || 'Şüpheli URL yapısı'}
                    </td>
                    <td className='py-3 text-right'>
                      <span className='text-xs font-bold px-2 py-1 rounded-full' style={{
                        background: threat.confidence_score >= 70 ? 'rgba(239,68,68,0.15)' :
                                    threat.confidence_score >= 30 ? 'rgba(245,158,11,0.15)' :
                                    'rgba(132,204,22,0.15)',
                        color: threat.confidence_score >= 70 ? '#ef4444' :
                               threat.confidence_score >= 30 ? '#f59e0b' : '#84cc16'
                      }}>
                        %{threat.confidence_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <h2 className='font-semibold mb-6' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          SON 7 GÜN
        </h2>
        <div className='space-y-4'>
          {data?.daily?.map((day, i) => (
            <div key={i} className='flex items-center gap-4'>
              <span className='text-xs w-16' style={{ color: '#475569' }}>{day.date}</span>
              <div className='flex-1 rounded-full h-2' style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className='h-2 rounded-full transition-all'
                  style={{
                    width: day.total > 0 ? `${Math.min((day.total / 10) * 100, 100)}%` : '0%',
                    background: 'linear-gradient(90deg, #38BDF8, #06B6D4)'
                  }}
                />
              </div>
              <span className='text-xs w-6 text-right' style={{ color: '#94a3b8' }}>{day.total}</span>
              {day.phishing > 0 && (
                <span className='text-xs px-2 py-0.5 rounded-full' style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444'
                }}>
                  ⚠️ {day.phishing}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}