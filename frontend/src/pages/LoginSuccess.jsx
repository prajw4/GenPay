import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useUser } from '../context/UserContext'
import { useNotify } from '../context/NotificationContext'

export default function LoginSuccess(){
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { push } = useNotify()

  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if(!token){
      push('Missing login token from Google.', 'error')
      navigate('/signin', { replace: true })
      return
    }

    localStorage.setItem('token', token)

    async function hydrateUser(){
      try{
        const res = await api.get('/user/me')
        const user = res.data?.user
        if(user){
          localStorage.setItem('user', JSON.stringify(user))
          if(typeof setUser === 'function') setUser(user)
        }
        push('Signed in with Google', 'success')
        navigate('/dashboard', { replace: true })
      }catch(err){
        console.error('Failed to load user after Google signin', err)
        push('Could not complete Google sign-in. Please try again.', 'error')
        navigate('/signin', { replace: true })
      }
    }

    hydrateUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700">
      <div className="bg-white shadow rounded p-6 text-center space-y-2">
        <div className="text-lg font-semibold">Finishing sign in...</div>
        <div className="text-sm text-gray-500">Please wait while we secure your session.</div>
      </div>
    </div>
  )
}
