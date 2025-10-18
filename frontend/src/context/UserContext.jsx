import React, { createContext, useContext } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }){
  return (
    <UserContext.Provider value={{ user: null, setUser: () => {}, loading: false }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = ()=> useContext(UserContext)
export default UserContext
