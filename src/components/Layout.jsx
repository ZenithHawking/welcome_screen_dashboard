import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../store/auth'

export default function Layout() {
    const navigate = useNavigate()
    const user = getUser()

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#f5f6fa' }}>
            {/* Sidebar */}
            <div className="d-flex flex-column p-3 bg-white border-end shadow-sm" style={{ width: 240, minHeight: '100vh' }}>
                <div className="mb-4 pb-3 border-bottom">
                    <div className="fw-bold fs-5 text-dark">🖥️ Welcome Screen</div>
                    <div className="text-muted small mt-1">{user?.username}</div>
                </div>

                <nav className="flex-grow-1">
                    {[
                        { to: '/dashboard', icon: '📋', label: 'Dashboard' },
                        { to: '/media', icon: '🖼️', label: 'Media' },
                    ].map(({ to, icon, label }) => (
                        <NavLink key={to} to={to} className={({ isActive }) =>
                            `d-flex align-items-center gap-2 px-3 py-2 rounded mb-1 text-decoration-none ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                        }>
                            <span>{icon}</span> {label}
                        </NavLink>
                    ))}
                </nav>

                <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm mt-3">
                    🚪 Đăng xuất
                </button>
            </div>

            {/* Main */}
            <div className="flex-grow-1 p-4">
                <Outlet />
            </div>
        </div>
    )
}