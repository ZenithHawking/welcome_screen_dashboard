import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAll, remove, updateStatus } from '../api/welcomescreen'
import toast from 'react-hot-toast'

export default function Dashboard() {
    const [screens, setScreens] = useState([])
    const navigate = useNavigate()

    const load = async () => {
        const { data } = await getAll()
        setScreens(data)
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Xóa welcome screen này?')) return
        await remove(id)
        toast.success('Đã xóa')
        load()
    }

    const handleStatus = async (id, currentStatus) => {
        const next = currentStatus === 'Active' ? 'Completed' : 'Active'
        await updateStatus(id, next)
        load()
    }

    const statusBadge = { Draft: 'secondary', Active: 'success', Completed: 'primary' }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Dashboard</h4>
                    <p className="text-muted small mb-0">{screens.length} welcome screen</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/welcomescreen/create')}>
                    + Tạo mới
                </button>
            </div>

            <div className="row g-3">
                {screens.map(s => (
                    <div key={s.id} className="col-md-6 col-xl-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold mb-0">{s.name}</h6>
                                    <span className={`badge bg-${statusBadge[s.status]}`}>{s.status}</span>
                                </div>
                                <p className="text-muted small mb-1">
                                    📅 {new Date(s.eventDate).toLocaleDateString('vi-VN')}
                                </p>
                                {s.description && <p className="text-muted small mb-3">{s.description}</p>}

                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    <button className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/welcomescreen/${s.id}/edit`)}>
                                        ✏️ Chỉnh sửa
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary"
                                            onClick={() => navigate(`/welcomescreen/${s.id}/datasource`)}>
                                        🗄️ CSDL
                                    </button>
                                    <button className="btn btn-sm btn-outline-dark"
                                            onClick={() => navigate(`/welcomescreen/${s.id}/builder`)}>
                                        🎨 Builder
                                    </button>
                                    <button className="btn btn-sm btn-outline-success"
                                            onClick={() => window.open(`/display/${s.id}`, '_blank', 'fullscreen=yes')}>
                                        📺 Trình chiếu
                                    </button>
                                    <button
                                        className={`btn btn-sm ${s.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        onClick={() => handleStatus(s.id, s.status)}>
                                        {s.status === 'Active' ? '⏹ Stop' : '▶️ Kích hoạt'}
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(s.id)}>
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {screens.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        <div style={{ fontSize: 48 }}>🖥️</div>
                        <p className="mt-2">Chưa có welcome screen nào. Tạo mới để bắt đầu!</p>
                    </div>
                )}
            </div>
        </div>
    )
}