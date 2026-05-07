import { useState } from 'react'
import axios from 'axios'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Merhaba! Ben PhishAnalyzer AI Asistanı. Siber güvenlik, phishing ve URL güvenliği hakkında sorularını yanıtlayabilirim. 🛡️'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(
        'https://phishanalyzer-production.up.railway.app/api/chat/',
        { message: input }
      )
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Bir hata oluştu, tekrar deneyin.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white flex flex-col' style={{height: 'calc(100vh - 65px)'}}>

      <div className='p-4 border-b border-gray-700'>
        <h1 className='text-2xl font-bold text-cyan-400'>
          💬 PhishChat — AI Güvenlik Asistanı
        </h1>
        <p className='text-gray-400 text-sm mt-1'>
          Siber güvenlik hakkında sorularını sor
        </p>
      </div>

      {/* Mesajlar */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-200 border border-gray-700'
            }`}>
              {msg.role === 'ai' && (
                <span className='text-cyan-400 font-bold text-xs block mb-1'>🤖 PhishChat</span>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className='flex justify-start'>
            <div className='bg-gray-800 border border-gray-700 px-4 py-3 rounded-xl text-gray-400 text-sm'>
              ⏳ Yanıt üretiliyor...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className='p-4 border-t border-gray-700'>
        <div className='flex gap-3 max-w-4xl mx-auto'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Phishing nedir? Bu URL güvenli mi? ...'
            className='flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-400'
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className='px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold disabled:opacity-50 transition-colors'
          >
            Gönder
          </button>
        </div>
      </div>

    </div>
  )
}