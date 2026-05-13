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
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center'>
      <p className='text-cyan-400 text-xl'>⏳ Yükleniyor...</p>
    </div>
  )

  const pieData = [
    { name: 'Güvenli', value: data?.safe || 0 },
    { name: 'Phishing', value: data?.phishing || 0 },
  ]
  const COLORS = ['#10b981', '#ef4444']

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <h1 className='text-4xl font-bold text-cyan-400 mb-8'>
        📊 Güvenlik Dashboard'u
      </h1>

      {/* Özet Kartlar */}
      <div className='grid grid-cols-3 gap-6 mb-8'>
        <div className='bg-gray-800 rounded-xl p-6 border border-gray-600'>
          <p className='text-gray-400'>Toplam Tarama</p>
          <p className='text-4xl font-bold text-white mt-2'>{data?.total || 0}</p>
        </div>
        <div className='bg-red-900 rounded-xl p-6 border border-red-500'>
          <p className='text-gray-400'>Phishing Tespit</p>
          <p className='text-4xl font-bold text-red-400 mt-2'>{data?.phishing || 0}</p>
        </div>
        <div className='bg-green-900 rounded-xl p-6 border border-green-500'>
          <p className='text-gray-400'>Güvenlik Oranı</p>
          <p className='text-4xl font-bold text-green-400 mt-2'>%{data?.safe_percentage || 0}</p>
        </div>
      </div>

      {/* Pie Chart + Son Tehditler */}
      <div className='grid grid-cols-2 gap-6 mb-8'>

        {/* Pie Chart */}
        <div className='bg-gray-800 rounded-xl p-6 border border-gray-600'>
          <h2 className='text-xl font-bold text-cyan-400 mb-4'>🥧 Risk Dağılımı</h2>
          {data?.total > 0 ? (
            <ResponsiveContainer width='100%' height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%'
                  cy='45%'
                  outerRadius={80}
                  dataKey='value'
                  label={({ percent }) => `%${(percent * 100).toFixed(0)}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: 'white' }}
                  formatter={(value, name) => [`${value} site`, name]}
                />
                <Legend
                  verticalAlign='bottom'
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: value === 'Güvenli' ? '#10b981' : '#ef4444' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-gray-400'>Henüz veri yok</p>
          )}
        </div>

        {/* Son Tehditler Tablosu */}
        <div className='bg-gray-800 rounded-xl p-6 border border-gray-600'>
          <h2 className='text-xl font-bold text-red-400 mb-4'>
            ⚠️ Son Tespit Edilen Tehditler
          </h2>
          {!data?.recent_threats?.length ? (
            <p className='text-gray-400'>Henüz tehdit tespit edilmedi</p>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='text-gray-400 text-sm border-b border-gray-700'>
                  <th className='text-left pb-3'>URL</th>
                  <th className='text-left pb-3'>Sebep</th>
                  <th className='text-right pb-3'>Risk</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_threats?.map((threat, i) => (
                  <tr key={i} className='border-b border-gray-700'>
                    <td className='py-3 text-gray-300 text-sm'>
                      {threat.url.length > 30 ? threat.url.substring(0, 30) + '...' : threat.url}
                    </td>
                    <td className='py-3 text-yellow-400 text-xs'>
                      {threat.reason || 'Şüpheli URL yapısı'}
                    </td>
                    <td className='py-3 text-right'>
                      <span className={`font-bold px-2 py-1 rounded text-xs ${
                        threat.confidence_score >= 70 ? 'bg-red-900 text-red-400' :
                        threat.confidence_score >= 30 ? 'bg-yellow-900 text-yellow-400' :
                        'bg-lime-900 text-lime-400'
                      }`}>
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

      {/* Son 7 Gün */}
      <div className='bg-gray-800 rounded-xl p-6 border border-gray-600'>
        <h2 className='text-xl font-bold text-cyan-400 mb-4'>📅 Son 7 Gün</h2>
        <div className='space-y-3'>
          {data?.daily?.map((day, i) => (
            <div key={i} className='flex items-center gap-4'>
              <span className='text-gray-400 w-16 text-sm'>{day.date}</span>
              <div className='flex-1 bg-gray-700 rounded-full h-4'>
                <div
                  className='bg-cyan-500 h-4 rounded-full transition-all'
                  style={{ width: day.total > 0 ? `${Math.min((day.total / 10) * 100, 100)}%` : '0%' }}
                />
              </div>
              <span className='text-white w-8 text-sm'>{day.total}</span>
              {day.phishing > 0 && (
                <span className='text-red-400 text-sm'>⚠️ {day.phishing}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}