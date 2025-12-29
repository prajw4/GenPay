import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMemo } from 'react';
import axios from "axios";
import { useNotify } from '../context/NotificationContext'
import api from '../services/api'

export const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const { push } = useNotify()

  const googleAuthUrl = useMemo(()=>{
    const apiBase = import.meta.env.VITE_API_URL ?? '/api/v1'
    const origin = apiBase.startsWith('http') ? apiBase.replace(/\/$/, '').replace('/api/v1','') : window.location.origin
    return origin + '/api/auth/google'
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-xl sm:text-2xl text-white font-bold">G</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">Sign in to continue to GenPay</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-5">
            <InputBox 
              onChange={(e) => {
                setUsername(e.target.value);
              }} 
              placeholder="Prajwal@gmail.com" 
              label={"Email"} 
            />
            <InputBox 
              onChange={(e) => {
                setPassword(e.target.value)
              }} 
              placeholder="••••••••" 
              label={"Password"} 
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mt-3">
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <div className="mt-5 sm:mt-6">
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  const response = await api.post('/user/signin', { username, password })
                  const user = response.data.user
                  if (user) {
                    localStorage.setItem('user', JSON.stringify(user))
                  }
                  push('Signed in', 'success')
                  navigate('/dashboard')
                } catch (error) {
                  console.warn('Signin failed', error)
                  const message = error?.response?.data?.message || 'Signin failed — check your credentials'
                  push(message, 'error')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-800/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={() => {
              window.location.href = googleAuthUrl
            }}
            className="w-full h-12 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Protected by industry-standard encryption
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Secure connection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
