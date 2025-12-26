import { useState, useRef, useEffect } from 'react'
import helpService from '../services/helpService'
import { useNotify } from '../context/NotificationContext'

const initialMessage = {
  role: 'ai',
  text: 'Hi! I am your GenPay support assistant. Ask me anything about using your wallet, sending money, or tracking transactions.'
}

const MessageBubble = ({ role, text }) => {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end gap-2">
        {!isUser && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div
          className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-br-md shadow-lg shadow-slate-300/30'
              : 'bg-slate-100 text-slate-700 rounded-bl-md border border-slate-200'
          }`}
        >
          {text}
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

const Help = () => {
  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const { push } = useNotify()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)

    try {
      const { answer } = await helpService.ask(question)
      const aiReply = answer || 'I could not find an answer right now. Please try again in a moment.'
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }])
    } catch (error) {
      console.error('help ask failed', error)
      push('Unable to reach the help assistant. Please try again.', 'error')
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'I am sorry, but I cannot connect to the help service right now.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
              <p className="text-sm text-slate-500">AI-powered assistance for GenPay</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} role={message.role} text={message.text} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-slate-100 text-slate-500 text-sm px-4 py-3 rounded-2xl rounded-bl-md border border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none bg-white placeholder:text-slate-400 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  loading || !input.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-slate-800 shadow-lg shadow-slate-300/30 hover:shadow-slate-400/40'
                }`}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Press Enter to send • Shift + Enter for new line</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default Help
