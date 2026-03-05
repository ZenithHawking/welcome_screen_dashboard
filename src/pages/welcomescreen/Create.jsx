import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { create } from '../../api/welcomescreen'
import toast from 'react-hot-toast'

export default function CreateWelcomeScreen() {
    const [form, setForm] = useState({ name: '', description: '', eventDate: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await create(form)
            toast.success('Tạo thành công!')
            navigate(`/welcomescreen/${data.id}/datasource`)
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 580 }}>
            <div className="mb-4">
                <h4 className="fw-bold">Tạo Welcome Screen</h4>
                <p className="text-muted small">Nhập thông tin cơ bản cho sự kiện</p>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-medium">Tên sự kiện <span className="text-danger">*</span></label>
                            <input required className="form-control" placeholder="Ví dụ: Hội nghị khách hàng 2025"
                                   value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-medium">Mô tả</label>
                            <textarea className="form-control" rows={3} placeholder="Mô tả ngắn về sự kiện..."
                                      value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-medium">Ngày diễn ra <span className="text-danger">*</span></label>
                            <input required type="date" className="form-control"
                                   value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>Hủy</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang tạo...' : 'Tạo và tiếp tục →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}