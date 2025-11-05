import { Navigate } from "react-router-dom";
import { useEffect, useState } from 'react'
import api from '../services/api'

export const PrivateRoute = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const [ok, setOk] = useState(false)

  useEffect(()=>{
    let mounted = true
    api.get('/user/me').then(res => {
      if(!mounted) return
      if(res?.data?.user) setOk(true)
    }).catch(()=>{
      if(!mounted) return
      setOk(false)
    }).finally(()=> mounted && setChecking(false))
    return () => { mounted = false }
  }, [])

  if(checking) return null
  if(!ok) return <Navigate to="/signin" />
  return children
}
