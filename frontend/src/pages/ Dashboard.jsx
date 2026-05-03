import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/dashboard/')
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
      <p className='text-cyan-400 text-xl'>Yükleniyor...</p>
    </div>
  )

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

      {/* Son Tehditler */}
      <div className='bg-gray-800 rounded-xl p-6 border border-gray-600 mb-8'>
        <h2 className='text-xl font-bold text-red-400 mb-4'>
          ⚠️ Son Tespit Edilen Tehditler
        </h2>
        {data?.recent_threats?.length === 0 ? (
          <p className='text-gray-400'>Henüz tehdit tespit edilmedi</p>
        ) : (
          <ul className='space-y-3'>
            {data?.recent_threats?.map((threat, i) => (
              <li key={i} className='flex justify-between items-center border-b border-gray-700 pb-2'>
                <span className='text-gray-300 truncate w-2/3'>{threat.url}</span>
                <span className='text-red-400 font-bold'>%{threat.confidence_score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Son 7 Gün */}
      <div className='bg-gray-800 rounded-xl p-6 border border-gray-600'>
        <h2 className='text-xl font-bold text-cyan-400 mb-4'>📅 Son 7 Gün</h2>
        <div className='space-y-3'>
          {data?.daily?.map((day, i) => (
            <div key={i} className='flex items-center gap-4'>
              <span className='text-gray-400 w-16'>{day.date}</span>
              <div className='flex-1 bg-gray-700 rounded-full h-4'>
                <div
                  className='bg-cyan-500 h-4 rounded-full'
                  style={{ width: day.total > 0 ? `${Math.min((day.total / 10) * 100, 100)}%` : '0%' }}
                />
              </div>
              <span className='text-white w-8'>{day.total}</span>
              {day.phishing > 0 && (
                <span className='text-red-400'>⚠️ {day.phishing}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}