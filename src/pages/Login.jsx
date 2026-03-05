import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { setAuth } from '../store/auth'
import toast from 'react-hot-toast'

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await login(form)
            setAuth(data.token, data.user)
            navigate('/dashboard')
        } catch {
            toast.error('Sai tài khoản hoặc mật khẩu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-sm border-0 p-4" style={{ width: 400, borderRadius: 16 }}>
                <div className="text-center mb-4">
                    <div style={{ fontSize: 40 }}>🖥️</div>
                    <h4 className="fw-bold mt-2">Welcome Screen</h4>
                    <p className="text-muted small">Đăng nhập để tiếp tục</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Tài khoản</label>
                        <input className="form-control" placeholder="admin"
                               value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium">Mật khẩu</label>
                        <input type="password" className="form-control" placeholder="••••••••"
                               value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    )
}
