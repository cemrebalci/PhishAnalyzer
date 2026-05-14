import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [hoveredRow, setHoveredRow] = useState(null)

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
  const maxDaily = Math.max(...(data?.daily?.map(d => d.total) || [1]))

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff} sn önce`
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
    return `${Math.floor(diff / 86400)} gün önce`
  }

  const filteredScans = (data?.recent_scans || []).filter(scan => {
    if (filter === 'all') return true
    if (filter === 'danger') return scan.is_phishing
    if (filter === 'safe') return !scan.is_phishing
    return true
  })

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
  }

  const filterBtn = (key, label, activeColor) => (
    <button
      onClick={() => setFilter(key)}
      className='px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200'
      style={{
        background: filter === key ? `${activeColor}22` : 'transparent',
        color: filter === key ? activeColor : '#475569',
        border: filter === key ? `1px solid ${activeColor}88` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: filter === key ? `0 0 10px ${activeColor}33` : 'none',
      }}
    >
      {label}
    </button>
  )

  const DonutLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox
    return (
      <text x={cx} y={cy} textAnchor='middle' dominantBaseline='middle'>
        <tspan
          x={cx} dy='-12'
          style={{ fontSize: '2rem', fontWeight: '700', fill: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {data?.total || 0}
        </tspan>
        <tspan
          x={cx} dy='28'
          style={{ fontSize: '0.65rem', fill: '#475569', letterSpacing: '0.08em' }}
        >
          TOPLAM
        </tspan>
      </text>
    )
  }

  const CHART_HEIGHT = 320

  return (
    <div className='min-h-screen text-white' style={{
      background: '#0B1120',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      padding: '40px 32px'
    }}>

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

      {/* Orta — İki Sütun */}
      <div className='grid grid-cols-5 gap-5 mb-8' style={{ alignItems: 'stretch' }}>

        {/* Sol %40 — Donut Chart */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }} className='col-span-2'>
          <h2 className='font-semibold mb-2' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            RİSK DAĞILIMI
          </h2>
          {data?.total > 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={75}
                    outerRadius={115}
                    dataKey='value'
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                    <Label content={<DonutLabel />} position='center' />
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
                    height={40}
                    formatter={(value, entry) => (
                      <span style={{ color: value === 'Güvenli' ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
                        {value} — %{data?.total > 0 ? ((entry.payload.value / data.total) * 100).toFixed(0) : 0}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#475569' }}>Henüz veri yok</p>
          )}
        </div>

        {/* Sağ %60 — Son 7 Gün */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }} className='col-span-3'>
          <h2 className='font-semibold mb-6' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            SON 7 GÜN
          </h2>
          <div className='flex-1 flex flex-col justify-center space-y-5'>
            {data?.daily?.map((day, i) => (
              <div key={i} className='flex items-center gap-4'>
                <span className='text-xs w-16' style={{ color: '#475569' }}>{day.date}</span>
                <div className='flex-1 rounded-full h-2' style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className='h-2 rounded-full transition-all'
                    style={{
                      width: day.total > 0 ? `${Math.min((day.total / maxDaily) * 100, 100)}%` : '0%',
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

      {/* Son Taramalar — filtreli */}
      <div style={cardStyle}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-semibold' style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            SON TARAMALAR
          </h2>
          <div className='flex gap-2'>
            {filterBtn('all', '🔍 Tümü', '#94a3b8')}
            {filterBtn('danger', '🔴 Tehlikeliler', '#ef4444')}
            {filterBtn('safe', '🟢 Güvenliler', '#22c55e')}
          </div>
        </div>

        {!filteredScans.length ? (
          <div className='text-center py-8'>
            <div className='text-3xl mb-2'>🔍</div>
            <p style={{ color: '#475569' }}>Bu filtreye uygun tarama bulunamadı</p>
          </div>
        ) : (
          <table className='w-full'>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className='text-left pb-3 text-xs' style={{ color: '#475569' }}>URL</th>
                <th className='text-left pb-3 text-xs' style={{ color: '#475569' }}>ZAMAN</th>
                <th className='text-right pb-3 text-xs' style={{ color: '#475569' }}>RİSK</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: hoveredRow === i ? 'rgba(255,255,255,0.03)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td className='py-3 text-sm' style={{ maxWidth: '260px' }}>
                    <span
                      title={scan.url}
                      style={{
                        color: '#cbd5e1',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'default',
                      }}
                    >
                      {scan.url}
                    </span>
                  </td>
                  <td className='py-3 text-xs' style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                    <div className='flex items-center gap-2'>
                      <span>{timeAgo(scan.scanned_at)}</span>
                      {scan.count > 1 && (
                        <span className='px-1.5 py-0.5 rounded-full text-xs' style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#64748b'
                        }}>
                          x{scan.count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='py-3 text-right'>
                    <span className='text-xs font-bold px-2 py-1 rounded-full' style={{
                      background:
                        scan.risk_level === 'safe' ? 'rgba(34,197,94,0.15)' :
                        scan.risk_level === 'high' ? 'rgba(239,68,68,0.15)' :
                        scan.risk_level === 'medium' ? 'rgba(245,158,11,0.15)' :
                        'rgba(132,204,22,0.15)',
                      color:
                        scan.risk_level === 'safe' ? '#22c55e' :
                        scan.risk_level === 'high' ? '#ef4444' :
                        scan.risk_level === 'medium' ? '#f59e0b' : '#84cc16'
                    }}>
                      {scan.risk_level === 'safe' ? '🟢 Güvenli' :
                       scan.risk_level === 'high' ? '🔴 Yüksek' :
                       scan.risk_level === 'medium' ? '🟠 Orta' : '🟡 Düşük'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}