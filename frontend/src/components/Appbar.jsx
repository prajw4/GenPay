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

    const getLinkClass = (path) => {
        const base = 'text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap'
        const active = isActive(path) ? 'bg-blue-600 text-white shadow-sm' : 'text-white/90 hover:bg-blue-500 hover:text-white'
        return `${base} ${active}`
    }

    return (
        <div className="h-16 flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-blue-500 fixed top-0 left-0 right-0 z-50 shadow-md">
            {/* Logo */}
            <Link to="/dashboard" className="text-white font-extrabold text-lg sm:text-2xl tracking-wide hover:opacity-90 transition-opacity flex-shrink-0">
                GenPay
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-0.5 sm:gap-1">
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                    Dashboard
                </Link>

                <Link to="/transactions" className={getLinkClass('/transactions')}>
                    <span className="hidden sm:inline">Transactions</span>
                    <span className="sm:hidden">Txns</span>
                </Link>

                <Link to="/help" className={`hidden md:inline-block ${getLinkClass('/help')}`}>
                    Help
                </Link>

                <div className="w-px h-6 bg-white/30 mx-1 sm:mx-2" />

                <button
                    onClick={logout}
                    className="text-xs sm:text-sm font-semibold text-white/90 px-2 sm:px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Exit</span>
                </button>
            </nav>
        </div>
    )
}
