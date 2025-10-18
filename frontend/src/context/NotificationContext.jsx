import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }){
  const [toasts, setToasts] = useState([])

  function push(message, type = 'info'){
    const id = Date.now().toString()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  return (
    <NotificationContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded shadow ${t.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotify = ()=> useContext(NotificationContext)

export default NotificationContext
