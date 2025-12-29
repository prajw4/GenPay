import { useState, useEffect } from "react";
import userService from '../services/userService'
import txService from '../services/transactionService'
import api from '../services/api'
import { useNotify } from '../context/NotificationContext'
import DashboardInsight from '../components/DashboardInsight'
import { Link, useNavigate } from 'react-router-dom'

export const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [recipients, setRecipients] = useState([])
  const [recipientInput, setRecipientInput] = useState('')
  const [debouncedRecipient, setDebouncedRecipient] = useState('')
  const [transactions, setTransactions] = useState([])
  const [frequentPage, setFrequentPage] = useState(0)
  const { push } = useNotify()
  const navigate = useNavigate()

  useEffect(() => {
    async function init() {
      try {
        try {
          const balRes = await api.get('/account/balance')
          if (balRes?.data) {
            setBalance(Number(balRes.data.balance) || 0)
          }
        } catch {}

        try {
          const user = await userService.getCurrentUser()
          setCurrentUser(user)
        } catch {}

        try {
          const list = await userService.list({})
          const arr = list.user || list.users || (Array.isArray(list) ? list : [])
          setAllUsers(arr)
        } catch {}

        // Load recent transactions for dynamic dashboard stats
        try {
          const res = await txService.list({ page: 1, pageSize: 50 })
          setTransactions(res?.transactions || [])
        } catch {}
      } catch (e) {
        console.error(e)
      }
    }
    init()
  }, [])

  // Debounce recipient input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRecipient(recipientInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [recipientInput])

  function initials(name) {
    if (!name) return ''
    const parts = name.split(' ')
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }

  // Color palette for avatars (Tailwind classes)
  const avatarColors = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-green-100 text-green-600',
    'bg-orange-100 text-orange-600',
    'bg-teal-100 text-teal-600',
  ]

  // Get color for a user by index
  function getUserColor(index) {
    return avatarColors[index % avatarColors.length]
  }

  // Handle Send Money button click with debounced search
  function handleSendMoneyClick() {
    const name = debouncedRecipient.trim()
    if (!name) {
      push('Please enter a recipient name', 'error')
      return
    }

    const found = allUsers.find(u => {
      const full = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      return full.toLowerCase() === name.toLowerCase()
    })

    if (!found) {
      push('Recipient not found', 'error')
      return
    }

    // Redirect to SendMoney page with selected user
    navigate(`/send?id=${found._id}&name=${encodeURIComponent(found.firstName + ' ' + found.lastName)}`)
  }

  // Get filtered users for search dropdown (by name prefix)
  function getFilteredSearchUsers() {
    const query = recipientInput.trim().toLowerCase()
    if (!query) return []
    
    return allUsers
      .filter(u => String(u._id) !== String(currentUser?._id))
      .filter(u => {
        const full = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
        return full.startsWith(query)
      })
      .slice(0, 10)
  }

  // Handle selecting a user from dropdown
  function selectUserFromDropdown(user) {
    const fullName = `${user.firstName} ${user.lastName}`
    setRecipientInput(fullName)
    setDebouncedRecipient(fullName)
  }

  // Get paginated frequent recipients (6 per page in 3x2 grid)
  function getPaginatedFrequentRecipients() {
    const allFrequent = allUsers
      .filter(u => String(u._id) !== String(currentUser?._id))
      .slice(0, 6 + frequentPage * 6)
    
    const start = frequentPage * 6
    const end = start + 6
    return allFrequent.slice(start, end)
  }

  // Check if there are more frequent recipients to show
  function hasMoreFrequentRecipients() {
    const totalFrequent = allUsers.filter(u => String(u._id) !== String(currentUser?._id)).length
    return totalFrequent > (frequentPage + 1) * 6
  }

  // 📊 Dashboard Stats
  // 🔢 Daily aggregates (sent/received amounts, and count of successful transactions)
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)

  const isToday = (d) => {
    const dt = new Date(d)
    return dt >= todayStart && dt <= todayEnd
  }

  const totalSent = transactions
    .filter(t => t.status === 'Success' && isToday(t.date) && (t.fromUserId || t.from?._id) === currentUser?._id)
    .reduce((s, t) => s + Number(t.amount || 0), 0)

  const totalReceived = transactions
    .filter(t => t.status === 'Success' && isToday(t.date) && (t.toUserId || t.to?._id) === currentUser?._id)
    .reduce((s, t) => s + Number(t.amount || 0), 0)

  const totalTransactions = transactions
    .filter(t => t.status === 'Success' && isToday(t.date))
    .length

  function handleAddRecipient() {
    const name = recipientInput.trim()
    if (!name) return

    const found = allUsers.find(u => {
      const full = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      return full === name.toLowerCase()
    })

    setRecipients(r => [...r, { name, user: found || null, message: '', amount: 100, category: 'Transfer' }])
    setRecipientInput('')
  }

  function updateRecipient(index, changes) {
    setRecipients(rs => rs.map((r, i) => i === index ? { ...r, ...changes } : r))
  }

  async function sendToRecipient(index) {
    const r = recipients[index]
    if (!currentUser) return push('No current user', 'error')

    const toUserId = r.user?._id
    const amount = Number(r.amount) || 0

    if (amount > balance) {
      push('Insufficient balance', 'error')
      return
    }

    const tx = {
      fromUserId: currentUser._id,
      toUserId,
      amount,
      category: r.category,
      status: 'Pending',
      date: new Date()
    }

    setTransactions(t => [tx, ...t])

    try {
      const res = await api.post('/account/transfer', {
        to: toUserId,
        amount,
        category: r.category,
        message: r.message
      })

      if (res?.data?.balance !== undefined) {
        setBalance(Number(res.data.balance))
      }

      setTransactions(prev =>
        prev.map(item => item === tx ? { ...item, status: 'Success' } : item)
      )
      push('Transfer successful', 'success')
    } catch {
      setTransactions(prev =>
        prev.map(item => item === tx ? { ...item, status: 'Failed' } : item)
      )
      push('Transfer failed', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-5">

        {/* 🔝 BALANCE HERO */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0">
              {initials(`${currentUser?.firstName} ${currentUser?.lastName}`)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest'}
              </div>
              <div className="text-xs sm:text-sm text-slate-500">Welcome back 👋</div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5">
            <div className="text-xs sm:text-sm text-blue-100">Available Balance</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              ₹{balance.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Sent</div>
              <div className="font-semibold text-xs sm:text-sm text-red-600">₹{totalSent.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Received</div>
              <div className="font-semibold text-xs sm:text-sm text-green-600">₹{totalReceived.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Txns</div>
              <div className="font-semibold text-xs sm:text-sm text-slate-800">{totalTransactions}</div>
            </div>
          </div>
        </div>

        {/* 🤖 AI INSIGHT */}
        <DashboardInsight />

        {/* 🧠 HELP */}
        <Link 
          to="/help" 
          className="flex items-center gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900">AI Help</h3>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">Ask GenPay about your spending</p>
          </div>
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* 💸 SEND MONEY */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-lg">💸</span> Send Money
          </h4>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <input
                value={recipientInput}
                onChange={e => setRecipientInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMoneyClick()}
                placeholder="Enter recipient name"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
              
              {/* Search Dropdown */}
              {recipientInput && getFilteredSearchUsers().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 sm:max-h-60 overflow-y-auto">
                  {getFilteredSearchUsers().map(user => (
                    <button
                      key={user._id}
                      onClick={() => selectUserFromDropdown(user)}
                      className="w-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-left transition-colors"
                      type="button"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600 flex-shrink-0 text-xs">
                        {initials(`${user.firstName} ${user.lastName}`)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 text-xs sm:text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-slate-500">@{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSendMoneyClick}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              Send Money
            </button>
          </div>
        </div>

        {/* 👥 PEOPLE - Frequent Recipients */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-lg">👥</span> Frequent Recipients
          </h4>
          
          {/* Responsive Grid: 2 cols on mobile, 3 cols on tablet, 4+ on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-4">
            {getPaginatedFrequentRecipients().map((user, index) => (
              <button
                key={user._id}
                onClick={() => {
                  navigate(`/send?id=${user._id}&name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`)
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`h-12 sm:h-14 w-12 sm:w-14 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm group-hover:shadow-md transition-shadow ${getUserColor(frequentPage * 6 + index)}`}>
                  {initials(`${user.firstName} ${user.lastName}`)}
                </div>
                <span className="text-xs font-medium text-slate-700 text-center max-w-[70px] line-clamp-2 group-hover:text-slate-900">
                  {user.firstName}
                </span>
              </button>
            ))}
          </div>

          {/* More Button */}
          {hasMoreFrequentRecipients() && (
            <button
              onClick={() => setFrequentPage(frequentPage + 1)}
              className="w-full py-2 px-4 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              More Recipients →
            </button>
          )}

          {/* Back Button (show if on page 2+) */}
          {frequentPage > 0 && (
            <button
              onClick={() => setFrequentPage(frequentPage - 1)}
              className="w-full py-2 px-4 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              ← Show Fewer
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
