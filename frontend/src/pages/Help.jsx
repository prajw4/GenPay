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
      <div
        className={`max-w-xl rounded-lg px-4 py-3 text-sm leading-6 whitespace-pre-wrap shadow-md ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        {text}
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
    <div className="bg-white rounded-lg shadow p-6 min-h-[68vh] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Help &amp; Support</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask a question about GenPay and get instant answers powered by our AI assistant.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-1 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} role={message.role} text={message.text} />
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 text-sm px-4 py-3 rounded-lg shadow-sm">
                Gemini is thinking...
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can we help you today?"
            rows={2}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
              loading || !input.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Help
