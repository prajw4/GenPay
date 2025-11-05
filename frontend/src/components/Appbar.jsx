import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useNotify } from '../context/NotificationContext'
import api from '../services/api'

export const AppBar = () => {
    const navigate = useNavigate()
    const { push } = useNotify()

    function logout(){
        // call backend to clear cookie
        api.post('/user/logout').catch(()=>{})
        localStorage.removeItem('user')
        push('Logged out', 'info')
        navigate('/signin')
    }

    return <div className="shadow h-14 flex justify-between items-center px-4 bg-blue-400 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="font-extrabold text-white text-3xl tracking-wide">GenPay</div>
        </div>
        <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-white text-sm font-bold px-3 py-1 rounded hover:bg-blue-500 transition">Dashboard</Link>
            <Link to="/transactions" className="text-white text-sm font-bold px-3 py-1 rounded hover:bg-blue-500 transition">Transactions</Link>
            <Link to="/help" className="text-white text-sm font-bold px-3 py-1 rounded hover:bg-blue-500 transition">Help &amp; Support</Link>
            <button onClick={logout} className="text-sm text-white font-bold">Logout</button>
        </div>
    </div>
}