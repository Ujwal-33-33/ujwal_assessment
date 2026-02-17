import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        TaskFlow
                    </Link>

                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                                {user.name}
                                {user.role === 'admin' && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                                        admin
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
