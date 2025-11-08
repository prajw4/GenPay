import { useEffect, useState } from 'react'
import api from '../services/api'
import { useUser } from '../context/UserContext'


function categoryIcon(cat) {
  switch (cat) {
    case 'Recharge': return '🔋'
    case 'Food': return '🍔'
    case 'Bills': return '🧾'
    case 'Transfer': return '➡️'
    default: return '💸'
  }
}

function initialsFor(user) {
  if (!user) return ''
  const f = user.firstName || ''
  const l = user.lastName || ''
  const first = f[0] || ''
  const last = l[0] || (f[1] || '')
  return (first + last).toUpperCase()
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const { user } = useUser()

  const [prompt, setPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAskAI = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setAiResponse('')

    try {
      const res = await api.post('/chat', {
        prompt,
        transactions
      })
      setAiResponse(res.data.reply || 'No response from AI')
    } catch (err) {
      console.error(err)
      setAiResponse('Oops, something went wrong. Try again!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/transactions')
        if (!mounted) return
        setTransactions(res.data.transactions || [])
      } catch (e) {
        console.error('Failed to load transactions', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="m-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Transactions</h3>

        {/* --- AI Search Bar --- */}
        <div className="mb-4 p-4 bg-gray-50 rounded-xl shadow-sm">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI about your transactions..."
              className="flex-1 bg-[#f9fafb] rounded-xl px-4 py-2 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:shadow-md transition-all duration-300 ease-in-out"
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <button
              onClick={handleAskAI}
              className="px-6 py-2 font-semibold text-white rounded-xl 
                         bg-gradient-to-r from-blue-500 to-indigo-500 
                         shadow-sm hover:shadow-blue-300/50 
                         hover:from-blue-600 hover:to-indigo-600 
                         transition-all duration-300 ease-in-out"
            >
              {loading ? 'Thinking...' : 'Ask AI'}
            </button>
          </div>

          {/* --- AI Response --- */}
          {loading && <p className="text-gray-500 mt-2">💭 AI is thinking...</p>}

          {aiResponse && (
            <div className="mt-3 space-y-2">
              {aiResponse.includes('**Date:**') ? (
                aiResponse
                  .split(/\d+\./)
                  .map(t => t.trim())
                  .filter(t => t)
                  .map((t, i) => {
                    const dateMatch = t.match(/\*\*Date:\*\*\s*([\s\S]*?)(?=\*\*|$)/)
                    const amountMatch = t.match(/\*\*Amount:\*\*\s*([\d.]+)/)
                    const categoryMatch = t.match(/\*\*Category:\*\*\s*([^\n*]+)/)
                    const detailsMatch = t.match(/\*\*Details:\*\*\s*([\s\S]*?)(?=\*\*|$)/)
                    const statusMatch = t.match(/\*\*Status:\*\*\s*(\w+)/)

                    let dateStr = 'N/A'
                    if (dateMatch) {
                      const d = new Date(dateMatch[1].trim())
                      dateStr = isNaN(d.getTime()) ? dateMatch[1].trim() : d.toLocaleString()
                    }

                    const amount = amountMatch ? amountMatch[1] : '0'
                    let categoryRaw = categoryMatch ? categoryMatch[1].trim() : 'Unknown'
                    let [categoryLabel, categoryEmoji] = categoryRaw.split(' ')
                    if (!categoryEmoji) categoryEmoji = categoryIcon(categoryLabel)

                    const details = detailsMatch ? detailsMatch[1].trim() : 'N/A'
                    const status = statusMatch ? statusMatch[1] : 'Unknown'

                    return (
                      <div key={i} className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div><strong>Date:</strong> {dateStr}</div>
                        <div><strong>Amount:</strong> ₹{amount}</div>
                        <div><strong>Category:</strong> {categoryLabel} {categoryEmoji}</div>
                        <div><strong>Details:</strong> {details}</div>
                        <div><strong>Status:</strong> {status}</div>
                      </div>
                    )
                  })
              ) : (
                <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                  {aiResponse}
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Transaction Cards --- */}
        {transactions.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
        <div>
          {transactions.map((t) => {
            const fromName = t.from ? `${t.from.firstName || ''} ${t.from.lastName || ''}`.trim() : ''
            const toName = t.to ? `${t.to.firstName || ''} ${t.to.lastName || ''}`.trim() : ''
            const fromInitials = initialsFor(t.from)
            const toInitials = initialsFor(t.to)
            const isSender = user && t.from && String(user._id) === String(t.from._id)
            const isReceiver = user && t.to && String(user._id) === String(t.to._id)
            let amountColor = ''
            if (isSender) {
              amountColor = 'text-red-500'
            } else if (isReceiver) {
              amountColor = 'text-green-500'
            } else {
              amountColor = 'text-gray-800'
            }

            return (
              <div key={t._id} className="border rounded-lg p-3 mb-2 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-lg">
                    {toInitials}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span className="text-3xl align-middle">{categoryIcon(t.category)}</span>
                      {t.category || t.message || 'Transfer'}
                    </div>
                    <div className="text-sm text-gray-500">{new Date(t.date).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      To: <span className="font-semibold">{toName || 'Unknown'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      From: <span className="font-semibold">{fromName || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold text-right ${t.status === 'Success' ? 'text-green-600' : 'text-yellow-600'}`}>
                  <span className={`font-semibold text-right ${amountColor}`}>
                    {isSender ? '-' : isReceiver ? '+' : ''}₹{Number(t.amount).toFixed(2)}
                  </span>
                  <div className="text-sm">{t.status}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
