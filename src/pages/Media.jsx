import { useEffect, useState, useRef } from 'react'
import { getAll, upload, remove } from '../api/media'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL

export default function MediaPage() {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const inputRef = useRef()

    const load = async () => {
        const { data } = await getAll()
        setFiles(data)
    }

    useEffect(() => { load() }, [])

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setLoading(true)
        try {
            await upload(file)
            toast.success('Upload thành công!')
            load()
        } catch {
            toast.error('Upload thất bại')
        } finally {
            setLoading(false)
            e.target.value = ''
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Xóa file này?')) return
        await remove(id)
        toast.success('Đã xóa')
        load()
    }

    const formatSize = (bytes) => {
        if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
        return (bytes / 1024).toFixed(0) + ' KB'
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Media</h4>
                    <p className="text-muted small mb-0">{files.length} file</p>
                </div>
                <button className="btn btn-primary" onClick={() => inputRef.current.click()} disabled={loading}>
                    {loading ? 'Đang upload...' : '⬆️ Upload'}
                </button>
                <input ref={inputRef} type="file" accept="image/*,video/mp4" onChange={handleUpload} style={{ display: 'none' }} />
            </div>

            <div className="row g-3">
                {files.map(f => (
                    <div key={f.id} className="col-6 col-md-4 col-lg-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 140 }}>
                                {f.fileType.startsWith('image/') ? (
                                    <img src={BASE_URL + f.filePath} alt={f.originalName}
                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="text-center text-muted">
                                        <div style={{ fontSize: 36 }}>🎬</div>
                                        <div className="small">Video</div>
                                    </div>
                                )}
                            </div>
                            <div className="card-body p-2">
                                <p className="small fw-medium mb-1 text-truncate">{f.originalName}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="badge bg-light text-dark border">{f.fileType.split('/')[1].toUpperCase()}</span>
                                    <span className="text-muted" style={{ fontSize: 11 }}>{formatSize(f.fileSize)}</span>
                                </div>
                                <button className="btn btn-outline-danger btn-sm w-100 mt-2" onClick={() => handleDelete(f.id)}>
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {files.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        <div style={{ fontSize: 48 }}>🖼️</div>
                        <p className="mt-2">Chưa có file nào. Upload ảnh hoặc video để bắt đầu!</p>
                    </div>
                )}
            </div>
        </div>
    )
}