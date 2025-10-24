import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { AppBar } from './components/Appbar'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { SendMoney } from './pages/SendMoney'
import TransactionHistory from './pages/TransactionHistory'
import { PrivateRoute } from './components/privateRoute.jsx'
import AIChat from './components/AIChat.jsx'
import LoginSuccess from './pages/LoginSuccess.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
  <AppBar />
  <div className="max-w-4xl mx-auto px-4 pt-20 pb-20">
       <Routes>
        <Route path='/' element={<Signup/>} />
        <Route path="/signup" element={<Signup/>}/>
  <Route path="/signin" element={<Signin/>}/>
  <Route path="/login/success" element={<LoginSuccess />} />

        

        <Route path='/dashboard' element={
          <PrivateRoute><Dashboard/></PrivateRoute>
        }/>

        <Route path='/chat' element={
        <PrivateRoute><AIChat/></PrivateRoute>
        }/>


        <Route path='/transactions' element={
          <PrivateRoute><TransactionHistory/></PrivateRoute>
        }/>

        <Route path='/sendMoney' element={
          <PrivateRoute><SendMoney/></PrivateRoute>
        }/>

        <Route path='/send' element={
          <PrivateRoute>< SendMoney /></PrivateRoute>
        } />
       </Routes>
      </div>
     </BrowserRouter>
  <div className="bg-blue-400 text-white text-center py-2 mt-8 w-full fixed bottom-0 left-0 z-40">
       <span className="font-semibold text-md">“Built for Payments. Evolved with AI.”</span>
     </div>
    </>
  )
}

export default App
