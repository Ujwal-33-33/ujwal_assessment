import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import TaskModal from '../components/TaskModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [filter, setFilter] = useState('all') // all | pending | completed

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks')
            setTasks(res.data.data)
        } catch (err) {
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (data) => {
        try {
            await api.post('/tasks', data)
            toast.success('Task created')
            setModalOpen(false)
            fetchTasks()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not create task')
        }
    }

    const handleUpdate = async (data) => {
        try {
            await api.put(`/tasks/${editingTask._id}`, data)
            toast.success('Task updated')
            setEditingTask(null)
            fetchTasks()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not update task')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return
        try {
            await api.delete(`/tasks/${id}`)
            toast.success('Task deleted')
            fetchTasks()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete task')
        }
    }

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'pending' ? 'completed' : 'pending'
        try {
            await api.put(`/tasks/${task._id}`, { status: newStatus })
            fetchTasks()
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

    const filtered = tasks.filter((t) => {
        if (filter === 'all') return true
        return t.status === filter
    })

    const stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-white' },
                        { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
                        { label: 'Completed', value: stats.completed, color: 'text-green-400' },
                    ].map((s) => (
                        <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        {['all', 'pending', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${filter === f
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                        <span className="text-lg leading-none">+</span> New Task
                    </button>
                </div>

                {/* task list */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No tasks yet</p>
                        <p className="text-gray-600 text-sm mt-1">Click &quot;New Task&quot; to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((task) => (
                            <div
                                key={task._id}
                                className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-start gap-4 group hover:border-gray-700 transition-colors"
                            >
                                {/* checkbox */}
                                <button
                                    onClick={() => toggleStatus(task)}
                                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${task.status === 'completed'
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-600 hover:border-indigo-400'
                                        }`}
                                >
                                    {task.status === 'completed' && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>

                                {/* content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
                                    )}
                                    {user.role === 'admin' && task.assignedUser && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            Assigned to: {task.assignedUser.name || task.assignedUser.email || 'Unknown'}
                                        </p>
                                    )}
                                </div>

                                {/* actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingTask(task)}
                                        className="text-gray-500 hover:text-indigo-400 transition-colors text-sm cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors text-sm cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* modals */}
            {modalOpen && (
                <TaskModal onSave={handleCreate} onClose={() => setModalOpen(false)} />
            )}
            {editingTask && (
                <TaskModal task={editingTask} onSave={handleUpdate} onClose={() => setEditingTask(null)} />
            )}
        </div>
    )
}
