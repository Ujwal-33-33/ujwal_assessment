import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // verify the token is still good on mount
        if (token) {
            api.get('/auth/me')
                .then((res) => {
                    setUser(res.data.data)
                    localStorage.setItem('user', JSON.stringify(res.data.data))
                })
                .catch(() => {
                    // token's no good, clear everything
                    logout()
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { token: t, user: u } = res.data.data
        setToken(t)
        setUser(u)
        localStorage.setItem('token', t)
        localStorage.setItem('user', JSON.stringify(u))
        return res.data
    }

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password })
        const { token: t, user: u } = res.data.data
        setToken(t)
        setUser(u)
        localStorage.setItem('token', t)
        localStorage.setItem('user', JSON.stringify(u))
        return res.data
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
