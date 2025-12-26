import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useNotify } from '../context/NotificationContext'
import api from '../services/api'

export const AppBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { push } = useNotify()

    function logout() {
        api.post('/user/logout').catch(() => {})
        localStorage.removeItem('user')
        push('Logged out', 'info')
        navigate('/signin')
    }

    const isActive = (path) => location.pathname === path

    const linkClass = (path) =>
        `text-sm font-semibold px-4 py-2 rounded-md transition-all duration-200 ${
            isActive(path)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-white/90 hover:bg-blue-500 hover:text-white'
        }`

    return (
        <div className="h-16 flex justify-between items-center px-8 bg-blue-500 fixed top-0 left-0 right-0 z-50 shadow-md">
            {/* Logo */}
            <Link to="/dashboard" className="text-white font-extrabold text-2xl tracking-wide hover:opacity-90 transition-opacity">
                GenPay
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                    Dashboard
                </Link>

                <Link to="/transactions" className={linkClass('/transactions')}>
                    Transactions
                </Link>

                <Link to="/help" className={linkClass('/help')}>
                    Help & Support
                </Link>

                <div className="w-px h-6 bg-white/30 mx-2" />

                <button
                    onClick={logout}
                    className="text-sm font-semibold text-white/90 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                    Logout
                </button>
            </nav>
        </div>
    )
}
