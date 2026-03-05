import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTables, getColumns, saveDataSource, saveFields } from '../../api/datasource'
import toast from 'react-hot-toast'

export default function DataSourcePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [server, setServer] = useState('')
    const [database, setDatabase] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [useWindowsAuth, setUseWindowsAuth] = useState(false)

    const [tables, setTables] = useState([])
    const [selectedTable, setSelectedTable] = useState('')
    const [columns, setColumns] = useState([])
    const [triggerCol, setTriggerCol] = useState('')

    const [selectedCols, setSelectedCols] = useState([])

    const buildConnStr = () => {
        if (useWindowsAuth)
            return `Server=${server};Database=${database};Trusted_Connection=True;TrustServerCertificate=True`
        return `Server=${server};Database=${database};User Id=${username};Password=${password};TrustServerCertificate=True`
    }

    const handleTestConn = async () => {
        if (!server || !database) return toast.error('Vui lòng nhập Server và Database')
        if (!useWindowsAuth && (!username || !password)) return toast.error('Vui lòng nhập Username và Password')
        setLoading(true)
        try {
            const connStr = buildConnStr()
            const { data } = await getTables(connStr)
            setTables(data)
            setStep(2)
            toast.success(`Kết nối thành công! Tìm thấy ${data.length} table`)
        } catch (err) {
            toast.error('Kết nối thất bại: ' + (err.response?.data?.message || err.message))
        } finally {
            setLoading(false)
        }
    }

    const handleSelectTable = async (table) => {
        setSelectedTable(table)
        setLoading(true)
        try {
            const { data } = await getColumns(buildConnStr(), table)
            setColumns(data)
            setStep(3)
        } catch {
            toast.error('Không thể đọc cột')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!triggerCol) return toast.error('Vui lòng chọn cột trigger')
        if (selectedCols.length === 0) return toast.error('Vui lòng chọn ít nhất 1 cột hiển thị')
        setLoading(true)
        try {
            await saveDataSource(id, {
                dbType: 'SqlServer',
                connectionString: buildConnStr(),
                tableName: selectedTable,
                triggerColumn: triggerCol
            })
            await saveFields(id, selectedCols.map(c => ({
                sourceColumn: c,
                displayLabel: c
            })))
            toast.success('Đã lưu cấu hình!')
            navigate('/dashboard')
        } catch {
            toast.error('Lưu thất bại')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div style={{ maxWidth: 680 }}>
            <div className="mb-4">
                <h4 className="fw-bold">Kết nối CSDL</h4>
                <p className="text-muted small">Cấu hình nguồn dữ liệu khách tham dự</p>
            </div>

            {/* Step 1 */}
            <div className={`card border-0 shadow-sm mb-3 ${step > 1 ? 'border-success' : ''}`}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">
                        {step > 1 ? '✅' : '1️⃣'} Thông tin kết nối
                    </h6>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Server <span className="text-danger">*</span></label>
                            <input className="form-control" placeholder="localhost hoặc 192.168.1.x"
                                   value={server} onChange={e => setServer(e.target.value)} disabled={step > 1} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Database <span className="text-danger">*</span></label>
                            <input className="form-control" placeholder="Tên database"
                                   value={database} onChange={e => setDatabase(e.target.value)} disabled={step > 1} />
                        </div>

                        <div className="col-12">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="winAuth"
                                       checked={useWindowsAuth} onChange={e => setUseWindowsAuth(e.target.checked)} disabled={step > 1} />
                                <label className="form-check-label" htmlFor="winAuth">Dùng Windows Authentication</label>
                            </div>
                        </div>

                        {!useWindowsAuth && (
                            <>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Username</label>
                                    <input className="form-control" placeholder="sa"
                                           value={username} onChange={e => setUsername(e.target.value)} disabled={step > 1} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Password</label>
                                    <input type="password" className="form-control" placeholder="••••••••"
                                           value={password} onChange={e => setPassword(e.target.value)} disabled={step > 1} />
                                </div>
                            </>
                        )}
                    </div>

                    {step === 1 ? (
                        <button className="btn btn-primary mt-3" onClick={handleTestConn} disabled={loading}>
                            {loading ? 'Đang kết nối...' : '🔌 Kiểm tra kết nối'}
                        </button>
                    ) : (
                        <button className="btn btn-link btn-sm mt-2 p-0 text-muted"
                                onClick={() => { setStep(1); setTables([]); setSelectedTable(''); setColumns([]) }}>
                            Đổi kết nối
                        </button>
                    )}
                </div>
            </div>

            {/* Step 2 */}
            {step >= 2 && (
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3">{step > 2 ? '✅' : '2️⃣'} Chọn Table chứa danh sách khách</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {tables.map(t => (
                                <button key={t} onClick={() => handleSelectTable(t)} disabled={step > 2}
                                        className={`btn btn-sm ${selectedTable === t ? 'btn-primary' : 'btn-outline-secondary'}`}>
                                    🗃️ {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3 */}
            {step >= 3 && (
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-1">3️⃣ Chọn cột ID (cột tự tăng)</h6>
                        <p className="text-muted small mb-3">
                            Chọn cột định danh tự tăng của table. Thường là <code>Id</code> — hệ thống dùng cột này để
                            phát hiện record mới.
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            {columns.map(c => (
                                <button key={c} onClick={() => {
                                    setTriggerCol(c);
                                    setStep(4)
                                }}
                                        className={`btn btn-sm ${triggerCol === c ? 'btn-success' : 'btn-outline-secondary'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {step >= 4 && (
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-1">4️⃣ Chọn các cột muốn hiển thị trên màn LED</h6>
                        <p className="text-muted small mb-3">
                            Chọn các cột sẽ hiện lên màn hình khi khách check-in
                        </p>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {columns.filter(c => c !== triggerCol).map(c => (
                                <button key={c}
                                        className={`btn btn-sm ${selectedCols.includes(c) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setSelectedCols(prev =>
                                            prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                        )}>
                                    {c}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading || selectedCols.length === 0}>
                            {loading ? 'Đang lưu...' : `💾 Lưu (${selectedCols.length} cột đã chọn)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}