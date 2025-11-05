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
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
    return base.replace(/\/$/, '').replace('/api/v1','') + '/api/auth/google'
  }, [])

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
            <Heading label={"Sign in"} />
            <SubHeading label={"Enter your credentials to access your account"} />
            <InputBox onChange={e => {
                setUsername(e.target.value);
                }} placeholder="harkirat@gmail.com" label={"Email"} />
            <InputBox onChange={(e) => {
                setPassword(e.target.value)
                }} placeholder="123456" label={"Password"} />
            <div className="pt-4">
            <Button
  loading={loading}
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
  label={"Sign in"}
/>

            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = googleAuthUrl
                }}
                className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-3 py-2 rounded hover:bg-slate-100 transition text-sm font-medium"
              >
                <span role="img" aria-label="Google">🔐</span>
                Continue with Google
              </button>
            </div>
            <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
        </div>
        </div>
    </div>
}