import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// slap the token onto every request if we have one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// if we ever get a 401 back, just boot them to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
