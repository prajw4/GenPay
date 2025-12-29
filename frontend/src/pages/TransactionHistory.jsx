import { useEffect, useState } from 'react'
import api from '../services/api'
import transactionService from '../services/transactionService'
import { useUser } from '../context/UserContext'
import { getCategoryIcon } from '../utils/categoryIcons'

function initialsFor(user) {
  if (!user) return ''
  const f = user.firstName || ''
  const l = user.lastName || ''
  const first = f[0] || ''
  const last = l[0] || (f[1] || '')
  return (first + last).toUpperCase()
}

function formatTransactionDateTime(date) {
  const d = new Date(date)
  const dateStr = d.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  return `${dateStr} • ${timeStr}`
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [listLoading, setListLoading] = useState(false)
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
      setListLoading(true)
      try {
        const res = await transactionService.list({ page, pageSize })
        if (!mounted) return
        setTransactions(res.transactions || [])
        setTotal(res.total || 0)
      } catch (e) {
        console.error('Failed to load transactions', e)
      } finally {
        setListLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [page, pageSize])

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">Transaction History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 tracking-wide uppercase">Your recent activity</p>
        </div>

        {/* --- AI Search Bar --- */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI about your spending..."
                className="flex-1 text-xs sm:text-sm text-slate-700 placeholder-slate-300 bg-transparent border-none outline-none w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              />
              <button
                onClick={handleAskAI}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? '...' : 'Ask'}
              </button>
            </div>
          </div>

          {/* --- AI Response --- */}
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 py-6">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}

          {aiResponse && (
            <div className="mt-4 space-y-3">
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
                    let categoryRaw = categoryMatch ? categoryMatch[1].trim() : 'Transfer'
                    // Extract just the category name (in case AI response includes emoji)
                    let categoryLabel = categoryRaw.split(' ')[0].trim()
                    // Ensure category is valid, default to Transfer if not
                    if (!['Food', 'Bills', 'Recharge', 'Transfer'].includes(categoryLabel)) {
                      categoryLabel = 'Transfer'
                    }
                    const categoryEmoji = getCategoryIcon(categoryLabel)

                    const details = detailsMatch ? detailsMatch[1].trim() : 'N/A'
                    const status = statusMatch ? statusMatch[1] : 'Unknown'

                    return (
                      <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date</span>
                            <span className="text-slate-700 font-medium">{dateStr}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Amount</span>
                            <span className="text-slate-700 font-medium">₹{amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Category</span>
                            <span className="text-slate-700 font-medium">{categoryLabel} {categoryEmoji}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Details</span>
                            <span className="text-slate-700 font-medium text-right max-w-[60%]">{details}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className="text-slate-700 font-medium">{status}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm text-emerald-700 leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Transaction List --- */}
        {listLoading && transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-10 text-center text-slate-400">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No transactions yet</p>
            <p className="text-xs text-slate-300 mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const fromName = t.from ? `${t.from.firstName || ''} ${t.from.lastName || ''}`.trim() : ''
              const toName = t.to ? `${t.to.firstName || ''} ${t.to.lastName || ''}`.trim() : ''
              const fromInitials = initialsFor(t.from)
              const toInitials = initialsFor(t.to)
              const isSender = user && t.from && String(user._id) === String(t.from._id)
              const isReceiver = user && t.to && String(user._id) === String(t.to._id)
              
              let amountColor = 'text-slate-800'
              let amountBg = 'bg-slate-50'
              if (isSender) {
                amountColor = 'text-rose-600'
                amountBg = 'bg-rose-50'
              } else if (isReceiver) {
                amountColor = 'text-emerald-600'
                amountBg = 'bg-emerald-50'
              }

              const displayName = isSender ? toName : fromName
              const displayInitials = isSender ? toInitials : fromInitials

              return (
                <div key={t._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500 flex-shrink-0">
                      {displayInitials || '??'}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{getCategoryIcon(t.category)}</span>
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {displayName || (t.category || t.message || 'Transfer')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {isSender ? 'Sent' : isReceiver ? 'Received' : 'Transfer'} • {formatTransactionDateTime(t.date)}
                      </p>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl ${amountBg}`}>
                        <span className={`text-sm font-semibold ${amountColor}`}>
                          {isSender ? '−' : isReceiver ? '+' : ''}₹{Number(t.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${t.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {t.status}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>
              Showing {(page - 1) * pageSize + 1}–{(page - 1) * pageSize + transactions.length} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || listLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={listLoading || (page * pageSize >= total)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  )
}
