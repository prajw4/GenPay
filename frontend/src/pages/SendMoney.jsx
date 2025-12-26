import { useSearchParams } from "react-router-dom"

import axios from "axios";

import api from '../services/api'

import { useState, useEffect, useRef } from "react";

import { useNotify } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import PaymentSuccessOverlay from '../components/PaymentSuccessOverlay'

export const SendMoney = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const id = searchParams.get("id");

    const name = searchParams.get("name");

    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const hasNavigated = useRef(false)

    const { push } = useNotify()

    // Amount validation
    const isAmountValid = amount && Number(amount) > 0

    




    return <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-md">

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                
                {/* Header */}
                <div className="px-6 pt-8 pb-6 text-center border-b border-slate-100">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
                        <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Send Money</h2>
                    <p className="text-slate-500 text-sm mt-1">Transfer funds securely</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Recipient Card */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                            <span className="text-xl font-semibold text-white">{name[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sending to</p>
                            <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium text-slate-700"
                            htmlFor="amount"
                        >
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                            <input
                                onChange={(e)=>{
                                    setAmount(e.target.value);
                                }}
                                type="number"
                                className="w-full h-14 pl-10 pr-4 text-xl font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
                                id="amount"
                                placeholder="0.00"
                            />
                        </div>
                        {amount && !isAmountValid && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Please enter a valid amount greater than zero
                            </p>
                        )}
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Transfer', 'Recharge', 'Food', 'Bills'].map((cat) => (
                                <label key={cat} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{borderColor: category === cat ? '#10b981' : undefined, backgroundColor: category === cat ? '#f0fdf4' : undefined}}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat}
                                        checked={category === cat}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium text-slate-700"
                            htmlFor="message"
                        >
                            Message (Optional)
                        </label>
                        <input
                            onChange={(e) => setMessage(e.target.value)}
                            type="text"
                            className="w-full h-12 px-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                            id="message"
                            placeholder="Add a note..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button onClick={async ()=>{
                        setLoading(true)
                        try{
                            await api.post('/account/transfer', { to: id, amount, category, message })
                            // Show success overlay; navigation handled by effect with interaction + 10s fallback
                            setShowSuccess(true)
                        }catch(err){
                            console.error('Transfer failed', err)
                            push('Transfer failed — backend may be down', 'error')
                        } finally { setLoading(false) }
                    }} 
                    className="w-full h-12 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: !category || !isAmountValid || loading ? '#cbd5e1' : '#1e293b'}}
                    disabled={!category || !isAmountValid || loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Send Money</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        
                    </p>
                </div>

            </div>

        </div>

        <PaymentSuccessOverlay visible={showSuccess} message="Money Sent Successfully" />

        {/* Success navigation control: interaction -> /transactions, 10s fallback -> /dashboard */}
        {showSuccess && (
            <SuccessRedirectController
                onInteract={() => navigate('/transactions')}
                onTimeout={() => navigate('/dashboard')}
                hasNavigatedRef={hasNavigated}
            />
        )}

    </div>

}

// Internal controller component to set listeners and timeout without re-triggering animation
const SuccessRedirectController = ({ onInteract, onTimeout, hasNavigatedRef }) => {
    useEffect(() => {
        if (hasNavigatedRef) hasNavigatedRef.current = false

        let timeoutId

        const goTo = (pathFn) => {
            if (hasNavigatedRef && hasNavigatedRef.current) return
            if (hasNavigatedRef) hasNavigatedRef.current = true
            window.removeEventListener('click', handleAny)
            window.removeEventListener('mousemove', handleAny)
            window.removeEventListener('touchstart', handleAny)
            window.removeEventListener('keydown', handleAny)
            if (timeoutId) clearTimeout(timeoutId)
            pathFn()
        }

        const handleAny = () => goTo(onInteract)

        window.addEventListener('click', handleAny)
        window.addEventListener('mousemove', handleAny)
        window.addEventListener('touchstart', handleAny)
        window.addEventListener('keydown', handleAny)

        timeoutId = setTimeout(() => goTo(onTimeout), 20000)

        return () => {
            window.removeEventListener('click', handleAny)
            window.removeEventListener('mousemove', handleAny)
            window.removeEventListener('touchstart', handleAny)
            window.removeEventListener('keydown', handleAny)
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [onInteract, onTimeout, hasNavigatedRef])

    return null
}
