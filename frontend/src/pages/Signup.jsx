import { useNavigate } from "react-router-dom"
import { useNotify } from '../context/NotificationContext'
import { useState, useMemo } from "react"
import api from '../services/api'

export const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const { push } = useNotify()
    
    const googleAuthUrl = useMemo(() => {
        const apiBase = import.meta.env.VITE_API_URL ?? '/api/v1'
        const origin = apiBase.startsWith('http') ? apiBase.replace(/\/$/, '').replace('/api/v1','') : window.location.origin
        return origin + '/api/auth/google'
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500 mt-1">Join thousands of users today</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <div className="space-y-5">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    placeholder="Harsh"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Patil"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="harsh@gmail.com"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Sign Up Button */}
                        <button
                            onClick={async () => {
                                setLoading(true)
                                try {
                                    const response = await api.post('/user/signup', { firstName, lastName, username, password })
                                    const user = response.data.user
                                    if (user) localStorage.setItem('user', JSON.stringify(user))
                                    push('Signed up', 'success')
                                    navigate('/dashboard')
                                } catch (err) {
                                    console.error("Signup Failed", err)
                                    const msg = err?.response?.data?.message || 'Signup failed'
                                    push(msg, 'error')
                                } finally {
                                    setLoading(false)
                                }
                            }}
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-300/30 hover:shadow-slate-400/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500">or continue with</span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <button
                            onClick={() => { window.location.href = googleAuthUrl }}
                            className="w-full h-12 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/signin')}
                                className="text-slate-900 font-semibold hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Your data is encrypted and secure
                    </p>
                </div>
            </div>
        </div>
    )
}
