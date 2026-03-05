import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getById, update } from '../../api/welcomescreen'
import toast from 'react-hot-toast'

export default function EditWelcomeScreen() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', description: '', eventDate: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getById(id).then(({ data }) => {
            setForm({
                name: data.name,
                description: data.description || '',
                eventDate: data.eventDate?.split('T')[0] || ''
            })
        })
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await update(id, form)
            toast.success('Đã cập nhật!')
            navigate('/dashboard')
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 580 }}>
            <div className="mb-4">
                <h4 className="fw-bold">Chỉnh sửa Welcome Screen</h4>
            </div>
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-medium">Tên sự kiện <span className="text-danger">*</span></label>
                            <input required className="form-control"
                                   value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-medium">Mô tả</label>
                            <textarea className="form-control" rows={3}
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
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}