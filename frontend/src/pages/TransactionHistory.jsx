import { useEffect, useState } from 'react'
import api from '../services/api'

function categoryIcon(cat){
  switch(cat){
    case 'Recharge': return '🔋'
    case 'Food': return '🍔'
    case 'Bills': return '🧾'
    case 'Transfer': return '➡️'
    default: return '💸'
  }
}

function initialsFor(user){
  if(!user) return ''
  const f = user.firstName || ''
  const l = user.lastName || ''
  const first = f[0] || ''
  const last = l[0] || (f[1] || '')
  return (first + last).toUpperCase()
}

export default function TransactionHistory(){
  const [transactions, setTransactions] = useState([])

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await api.get('/transactions')
        if(!mounted) return
        setTransactions(res.data.transactions || [])
      }catch(e){
        console.error('Failed to load transactions', e)
      }
    }
    load()
    return ()=> { mounted = false }
  }, [])

  return (
    <div className="m-8">
      <div className="bg-white rounded p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Transactions</h3>
        {transactions.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
        <div>
          {transactions.map((t) => {
            // For now, treat the current user as sender if fromUserId === toUserId (not ideal, but backend doesn't return currentUserId)
            // We'll show both sender and recipient for clarity
            const fromName = t.from ? `${t.from.firstName || ''} ${t.from.lastName || ''}`.trim() : ''
            const toName = t.to ? `${t.to.firstName || ''} ${t.to.lastName || ''}`.trim() : ''
            const fromInitials = initialsFor(t.from)
            const toInitials = initialsFor(t.to)
            return (
              <div key={t._id} className="border rounded p-3 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Always show recipient avatar for outgoing, sender avatar for incoming */}
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-lg">
                    {toInitials}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span className="text-3xl align-middle">{categoryIcon(t.category)}</span>
                      {t.message || 'Transfer'}
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
                  ₹{Number(t.amount).toFixed(2)} <div className="text-sm">{t.status}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
