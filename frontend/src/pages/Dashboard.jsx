import { useState, useEffect } from "react";
// AppBar removed per request
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import userService from '../services/userService'
import { useNotify } from '../context/NotificationContext'

export const Dashboard = () =>{
        const [balance, setBalance] = useState(0);
        const [currentUser, setCurrentUser] = useState(null)
        const [allUsers, setAllUsers] = useState([])

    // recipients: array of { name, user (found), message, amount, category }
    const [recipients, setRecipients] = useState([])
        const [recipientInput, setRecipientInput] = useState('')
        const [transactions, setTransactions] = useState([])
        const { push } = useNotify()

        useEffect(()=>{
            // fetch balance and current user and users list
            const token = localStorage.getItem('token')
            async function init(){
                try{
                    // fetch balance (best-effort)
                    try{
                        const balRes = await fetch('http://localhost:3000/api/v1/account/balance', { headers: { Authorization: 'Bearer ' + token } })
                        if(balRes.ok){
                            const json = await balRes.json()
                            setBalance(json.balance || 0)
                        }
                    }catch(e){
                        // ignore balance error
                    }

                    // fetch current user via service
                    try{
                        const user = await userService.getCurrentUser()
                        setCurrentUser(user)
                    }catch(e){
                        console.warn('Failed to load current user', e)
                    }

                    // fetch users list to resolve recipient names
                    try{
                        const list = await userService.list({})
                        // list may be object with user/users
                        const arr = list.user || list.users || (Array.isArray(list) ? list : [])
                        // exclude current user once we know it
                        setAllUsers(arr)
                    }catch(e){
                        console.warn('Failed to load users list', e)
                    }
                }catch(e){ console.error(e) }
            }
            init()
        },[])

        function initials(name){
            if(!name) return ''
            const parts = name.split(' ')
            const first = parts[0]?.[0] || ''
            const last = parts[1]?.[0] || (parts[0]?.[1] || '')
            return (first + last).toUpperCase()
        }

        function handleAddRecipient(){
            const name = recipientInput.trim()
            if(!name) return
            // try to find user by firstName/lastName or username among visible users
                const found = allUsers.find(u => {
                const full = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase()
                return full === name.toLowerCase() || (u.username || '').toLowerCase() === name.toLowerCase() || (u.firstName || '').toLowerCase() === name.toLowerCase()
            })
            setRecipients(r => [...r, { name, user: found || null, message: '', amount: 100, category: 'Transfer' }])
            setRecipientInput('')
        }

        function updateRecipient(index, changes){
            setRecipients(rs => rs.map((r,i)=> i===index ? {...r, ...changes} : r))
        }

            async function sendToRecipient(index){
                const r = recipients[index]
                if(!currentUser){ push('No current user loaded', 'error'); return }
                const toUserId = r.user?._id || r.user?.id || null
                const amount = Number(r.amount) || 0
                // validate recipient is in users list
                const isValidRecipient = allUsers.some(u => (u._id || u.id) === toUserId)
                if(!isValidRecipient){ push('Invalid recipient selected', 'error'); return }


                // sufficient balance check
                if(amount > Number(balance)){ push('Insufficient balance', 'error'); setTransactions(prev => prev.map(item => item===tx ? {...item, status: 'Failed'} : item)); return }
                const tx = {
                    fromUserId: currentUser._id || currentUser.id || null,
                    toUserId,
                    amount,
                    category: r.category || 'Transfer',
                    status: 'Pending',
                    message: r.message || '',
                    date: new Date().toISOString()
                }

                setTransactions(t => [tx, ...t])
                push('Transaction queued', 'info')

                // if recipient user is known, call backend transfer
                if(toUserId){
                    try{
                        const res = await fetch('http://localhost:3000/api/v1/account/transfer', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ to: toUserId, amount, category: r.category || 'Transfer', message: r.message || '' })
                        })
                        const data = await res.json()
                        if(!res.ok){
                            push(data.message || 'Transfer failed', 'error')
                            // mark last tx as failed
                            setTransactions(prev => prev.map(item => item===tx ? {...item, status: 'Failed'} : item))
                            return
                        }

                        console.log('Transfer response:', res.status, data)
                        // update balance from server response (ensure numeric)
                        if(data.balance !== undefined){
                            const b = Number(data.balance)
                            console.log('Updating balance to', b)
                            setBalance(isNaN(b) ? data.balance : b)
                        }

                        // defensive: re-fetch balance from server to ensure sync
                        try{
                            const re = await fetch('http://localhost:3000/api/v1/account/balance', {
                                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
                            })
                            if(re.ok){
                                const jb = await re.json()
                                console.log('Re-fetched balance after transfer', jb.balance)
                                setBalance(Number(jb.balance) || jb.balance)
                            }
                        }catch(e){
                            console.warn('Failed to re-fetch balance', e)
                        }

                        // mark tx success
                        setTransactions(prev => prev.map(item => item===tx ? {...item, status: 'Success'} : item))
                        push('Transfer successful', 'success')
                    }catch(err){
                        console.error('Transfer error', err)
                        push('Transfer failed', 'error')
                        setTransactions(prev => prev.map(item => item===tx ? {...item, status: 'Failed'} : item))
                    }
                }else{
                    // no user id, simulate local pending -> success
                    setTimeout(()=>{
                        setTransactions(prev => prev.map(item => item===tx ? {...item, status: 'Success'} : item))
                        push('Transaction completed (local)', 'success')
                    }, 1000)
                }
            }

        return (
            <div>
                <div className="m-8">
                    <div className="bg-white rounded p-6 shadow mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold">
                                {initials((currentUser?.firstName || '') + ' ' + (currentUser?.lastName || ''))}
                            </div>
                            <div>
                                                                <div className="text-2xl font-extrabold">{
                                                                    currentUser
                                                                        ? `${
                                                                                (currentUser.firstName || '').charAt(0).toUpperCase() + (currentUser.firstName || '').slice(1)
                                                                            } ${
                                                                                (currentUser.lastName || '').charAt(0).toUpperCase() + (currentUser.lastName || '').slice(1)
                                                                            }`
                                                                        : 'Guest'
                                                                }</div>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
                        <div className="bg-white rounded p-6 shadow min-h-[160px] w-80 flex flex-col justify-center transition-all duration-200 hover:shadow-xl hover:bg-blue-50 cursor-pointer">
                            <h4 className="text-base text-gray-500 font-medium mb-5">Send Money</h4>
                            <div className="flex gap-2 mb-3">
                                <input value={recipientInput} onChange={e=>setRecipientInput(e.target.value)} placeholder="Enter recipient name or email" className="flex-1 border p-2 rounded" />
                                <button onClick={handleAddRecipient} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Add</button>
                            </div>
                            <div>
                                {recipients.length === 0 && <div className="text-sm text-gray-500">No recipients added yet.</div>}
                                {recipients.map((r, idx) => (
                                    <div key={idx} className="border rounded p-3 mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">{r.name} {r.user ? <span className="text-sm text-gray-500">({r.user.username})</span> : <span className="text-sm text-red-500">(not found)</span>}</div>
                                            <div className="text-sm text-gray-500">Amount: ₹<input type="number" value={r.amount} onChange={e=> updateRecipient(idx, { amount: Number(e.target.value) })} className="w-24 inline-block ml-2 border rounded p-1" /></div>
                                        </div>
                                        <div className="mb-2 flex gap-2 items-center">
                                            <input value={r.message} onChange={e=> updateRecipient(idx, { message: e.target.value })} placeholder="Message (what is this for?)" className="flex-1 border p-2 rounded min-w-0" />
                                            <select value={r.category || ''} onChange={e=> updateRecipient(idx, { category: e.target.value })} className="border p-2 rounded w-36 min-w-0 max-w-full overflow-ellipsis">
                                                <option value="" disabled>Select type</option>
                                                <option value="Transfer">Transfer</option>
                                                <option value="Food">Food</option>
                                                <option value="Bills">Bills</option>
                                                <option value="Recharge">Recharge</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={() => {
                                                    if (!r.category || r.category === "") {
                                                        push('Please select a transfer type/category', 'error');
                                                        return;
                                                    }
                                                    sendToRecipient(idx);
                                                }}
                                                className={`px-3 py-2 bg-green-600 text-white rounded transition-opacity ${!r.category || r.category === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={!r.category || r.category === ''}
                                            >
                                                Send Money
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded p-6 shadow min-h-[160px] w-80 flex flex-col justify-center transition-all duration-200 hover:shadow-xl hover:bg-blue-50 cursor-pointer">
                            <Balance value={balance}></Balance>
                        </div>
                    </div>

                    <div className="mt-2">
                        <Users excludeUserId={currentUser?._id} onSelectUser={(user) => {
                            // when a user is selected from the list, add to recipients if not already present
                            const already = recipients.find(r => r.user && (r.user._id === user._id))
                            if(already){ push('Recipient already added', 'info'); return }
                            setRecipients(r => [...r, { name: `${user.firstName} ${user.lastName}`.trim(), user, message: '', amount: 100 }])
                        }} />
                    </div>
                </div>
            </div>
        )
}