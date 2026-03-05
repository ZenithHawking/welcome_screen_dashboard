import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Rnd } from 'react-rnd'
import { getById } from '../../api/welcomescreen'
import { getAll as getMedia, upload } from '../../api/media'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL

const ANIMATIONS = [
    { value: 'none', label: '— Không có —' },
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'fadeInDown', label: 'Fade In Down' },
    { value: 'fadeInUp', label: 'Fade In Up' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'slideLeft', label: 'Slide Left' },
    { value: 'slideRight', label: 'Slide Right' },
    { value: 'zoomIn', label: 'Zoom In' },
    { value: 'zoomInDown', label: 'Zoom In Down' },
    { value: 'bounceIn', label: 'Bounce In' },
    { value: 'bounceInDown', label: 'Bounce In Down' },
    { value: 'flipInX', label: 'Flip In X' },
    { value: 'flipInY', label: 'Flip In Y' },
    { value: 'typewriter', label: 'Typewriter' },
    { value: 'pulse', label: 'Pulse (loop)' },
    { value: 'swing', label: 'Swing' },
    { value: 'rubberBand', label: 'Rubber Band' },
    { value: 'heartBeat', label: 'Heart Beat (loop)' },
    { value: 'lightSpeedIn', label: 'Light Speed In' },
    { value: 'rollIn', label: 'Roll In' },
    { value: 'jackInTheBox', label: 'Jack In The Box' },
]

const ANIMATION_KEYFRAMES = `
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes fadeInDown { from{opacity:0;transform:translateY(-40px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeInUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-60px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideLeft { from{opacity:0;transform:translateX(80px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(-80px)} to{opacity:1;transform:translateX(0)} }
@keyframes zoomIn { from{opacity:0;transform:scale(0.3)} to{opacity:1;transform:scale(1)} }
@keyframes zoomInDown { from{opacity:0;transform:scale(0.1) translateY(-60px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes bounceIn {
  0%{opacity:0;transform:scale(0.3)} 50%{opacity:1;transform:scale(1.05)}
  70%{transform:scale(0.9)} 100%{opacity:1;transform:scale(1)}
}
@keyframes bounceInDown {
  0%{opacity:0;transform:translateY(-200px)} 60%{opacity:1;transform:translateY(20px)}
  80%{transform:translateY(-10px)} 100%{opacity:1;transform:translateY(0)}
}
@keyframes flipInX {
  from{opacity:0;transform:perspective(400px) rotateX(90deg)}
  to{opacity:1;transform:perspective(400px) rotateX(0deg)}
}
@keyframes flipInY {
  from{opacity:0;transform:perspective(400px) rotateY(90deg)}
  to{opacity:1;transform:perspective(400px) rotateY(0deg)}
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
@keyframes swing {
  20%{transform:rotate(15deg)} 40%{transform:rotate(-10deg)}
  60%{transform:rotate(5deg)} 80%{transform:rotate(-5deg)} 100%{transform:rotate(0)}
}
@keyframes rubberBand {
  0%{transform:scale(1)} 30%{transform:scaleX(1.25) scaleY(0.75)}
  40%{transform:scaleX(0.75) scaleY(1.25)} 60%{transform:scaleX(1.15) scaleY(0.85)} 100%{transform:scale(1)}
}
@keyframes heartBeat {
  0%,100%{transform:scale(1)} 14%{transform:scale(1.15)}
  28%{transform:scale(1)} 42%{transform:scale(1.15)} 70%{transform:scale(1)}
}
@keyframes lightSpeedIn {
  from{opacity:0;transform:translateX(100%) skewX(-30deg)}
  60%{opacity:1;transform:skewX(20deg)} 80%{transform:skewX(-5deg)}
  to{opacity:1;transform:translateX(0)}
}
@keyframes rollIn {
  from{opacity:0;transform:translateX(-100%) rotate(-120deg)}
  to{opacity:1;transform:translateX(0) rotate(0)}
}
@keyframes jackInTheBox {
  0%{opacity:0;transform:scale(0.1) rotate(30deg);transform-origin:center bottom}
  50%{transform:rotate(-10deg)} 70%{transform:rotate(3deg)}
  100%{opacity:1;transform:scale(1)}
}
`

const LOOP_ANIMATIONS = ['pulse', 'heartBeat']

const FONTS = [
    'Arial','Times New Roman','Georgia','Verdana',
    'Tahoma','Trebuchet MS','Impact','Courier New',
    'Montserrat','Roboto','Open Sans','Lato',
]

const CANVAS_W = 960
const CANVAS_H = 540
const GRID_SIZE = 20
const MAX_HISTORY = 50

const makeDefaultElement = (field, index) => ({
    id: field.id,
    sourceColumn: field.sourceColumn,
    label: field.displayLabel || field.sourceColumn,
    x: CANVAS_W / 2 - 200, y: 180 + index * 100,
    width: 400, height: 60,
    fontSize: field.fontSize || 48,
    fontFamily: field.fontFamily || 'Arial',
    fontColor: field.fontColor || '#FFFFFF',
    fontWeight: field.fontWeight || 'bold',
    fontStyle: 'normal',
    textAlign: field.textAlign || 'center',
    textShadowEnabled: false, textShadowColor: '#000000', textShadowBlur: 8, textShadowX: 2, textShadowY: 2,
    textStrokeEnabled: false, textStrokeColor: '#000000', textStrokeWidth: 1,
    gradientEnabled: false, gradientColor1: '#FFFFFF', gradientColor2: '#FFD700', gradientAngle: 90,
    animationType: field.animationType || 'fadeIn',
    animationDuration: field.animationDuration || 1000,
    animationDelay: field.animationDelay || 0,
    animationEasing: 'ease',
    zIndex: index, locked: false, opacity: 100,
})

export default function BuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [screen, setScreen] = useState(null)
    const [mediaList, setMediaList] = useState([])
    const [elements, setElements] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [background, setBackground] = useState(null)
    const [bgOverlay, setBgOverlay] = useState({ enabled: false, color: '#000000', opacity: 40 })
    const [displayDuration, setDisplayDuration] = useState(5)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [saving, setSaving] = useState(false)
    const [previewing, setPreviewing] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [uploadingBg, setUploadingBg] = useState(false)
    const [pickerUploading, setPickerUploading] = useState(false)
    const [previewingEl, setPreviewingEl] = useState(null)
    const [snapEnabled, setSnapEnabled] = useState(true)
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isUndoRedo = useRef(false)
    const [clipboard, setClipboard] = useState(null)
    const bgInputRef = useRef()
    const pickerInputRef = useRef()

    // Inject keyframes 1 lần
    useEffect(() => {
        const style = document.createElement('style')
        style.innerHTML = ANIMATION_KEYFRAMES
        document.head.appendChild(style)
        return () => document.head.removeChild(style)
    }, [])

    // #1 Lưu history
    useEffect(() => {
        if (isUndoRedo.current) { isUndoRedo.current = false; return }
        setHistory(prev => {
            const newH = prev.slice(0, historyIndex + 1)
            if (newH.length >= MAX_HISTORY) newH.shift()
            return [...newH, JSON.parse(JSON.stringify(elements))]
        })
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
    }, [elements])

    const undo = useCallback(() => {
        if (historyIndex <= 0) return
        isUndoRedo.current = true
        const idx = historyIndex - 1
        setHistoryIndex(idx)
        setElements(JSON.parse(JSON.stringify(history[idx])))
        toast('↩️ Đã hoàn tác')
    }, [history, historyIndex])

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return
        isUndoRedo.current = true
        const idx = historyIndex + 1
        setHistoryIndex(idx)
        setElements(JSON.parse(JSON.stringify(history[idx])))
        toast('↪️ Đã làm lại')
    }, [history, historyIndex])

    const copyElement = useCallback(() => {
        const el = elements.find(e => e.id === selectedId)
        if (!el) return
        setClipboard({ ...el })
        toast('📋 Đã copy')
    }, [elements, selectedId])

    const pasteElement = useCallback(() => {
        if (!clipboard) return
        const newEl = { ...clipboard, id: Date.now(), x: clipboard.x + 20, y: clipboard.y + 20, zIndex: elements.length }
        setElements(prev => [...prev, newEl])
        setSelectedId(newEl.id)
        toast('📌 Đã paste')
    }, [clipboard, elements.length])

    const removeElementById = useCallback((eid) => {
        setElements(prev => prev.filter(e => e.id !== eid))
        setSelectedId(prev => prev === eid ? null : prev)
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return
            const ctrl = e.ctrlKey || e.metaKey
            if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
            if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
            if (ctrl && e.key === 'c') copyElement()
            if (ctrl && e.key === 'v') pasteElement()
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) removeElementById(selectedId)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [undo, redo, copyElement, pasteElement, selectedId, removeElementById])

    useEffect(() => { loadData() }, [id])

    const loadData = async () => {
        const [{ data: ws }, { data: media }] = await Promise.all([getById(id), getMedia()])
        setScreen(ws)
        setMediaList(media)
        if (ws.screenConfig?.layoutJson) {
            const config = JSON.parse(ws.screenConfig.layoutJson)
            setElements(config.elements || [])
            if (config.backgroundMediaId) {
                const bg = media.find(m => m.id === config.backgroundMediaId)
                setBackground(bg || null)
            }
            if (config.bgOverlay) setBgOverlay(config.bgOverlay)
            if (config.displayDuration) setDisplayDuration(config.displayDuration)
        } else if (ws.dataSource && ws.fields?.length > 0) {
            setElements(ws.fields.map((f, i) => makeDefaultElement(f, i)))
        }
    }

    const previewAnimation = (el) => {
        setPreviewingEl(null)
        setTimeout(() => {
            setPreviewingEl(el.id)
            if (!LOOP_ANIMATIONS.includes(el.animationType)) {
                setTimeout(() => setPreviewingEl(null), el.animationDuration + el.animationDelay + 500)
            }
        }, 50)
    }

    const snapToGrid = (val) => snapEnabled ? Math.round(val / GRID_SIZE) * GRID_SIZE : val

    const handleBgUpload = async (file) => {
        if (!file) return
        const allowed = ['image/png','image/jpeg','image/webp','video/mp4']
        if (!allowed.includes(file.type)) return toast.error('Chỉ chấp nhận PNG, JPG, WebP, MP4')
        setUploadingBg(true)
        try {
            const { data } = await upload(file)
            setBackground(data)
            setMediaList(prev => [data, ...prev])
            toast.success('Upload thành công!')
        } catch { toast.error('Upload thất bại') }
        finally { setUploadingBg(false) }
    }

    const handlePickerUpload = async (file) => {
        if (!file) return
        const allowed = ['image/png','image/jpeg','image/webp','video/mp4']
        if (!allowed.includes(file.type)) return toast.error('Chỉ chấp nhận PNG, JPG, WebP, MP4')
        setPickerUploading(true)
        try {
            const { data } = await upload(file)
            setMediaList(prev => [data, ...prev])
            setBackground(data)
            setShowMediaPicker(false)
            toast.success('Upload và chọn thành công!')
        } catch { toast.error('Upload thất bại') }
        finally { setPickerUploading(false); pickerInputRef.current.value = '' }
    }

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleBgUpload(file)
    }

    const selectedEl = elements.find(e => e.id === selectedId)
    const updateElement = (id, changes) =>
        setElements(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e))

    const addElementFromField = (field) => {
        if (elements.find(e => e.id === field.id)) return toast('Trường này đã có trên canvas')
        const el = { ...makeDefaultElement(field, elements.length), x: 100, y: 100 + elements.length * 80 }
        setElements(prev => [...prev, el])
        setSelectedId(el.id)
    }

    // #5 Layer
    const moveLayer = (id, dir) => {
        setElements(prev => {
            const arr = [...prev].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            const idx = arr.findIndex(e => e.id === id)
            if (dir === 'up' && idx < arr.length - 1)
                [arr[idx].zIndex, arr[idx+1].zIndex] = [arr[idx+1].zIndex, arr[idx].zIndex]
            else if (dir === 'down' && idx > 0)
                [arr[idx].zIndex, arr[idx-1].zIndex] = [arr[idx-1].zIndex, arr[idx].zIndex]
            return [...arr]
        })
    }

    // #4 Căn giữa
    const centerElement = (id, axis) => {
        const el = elements.find(e => e.id === id)
        if (!el) return
        const changes = {}
        if (axis === 'h' || axis === 'both') changes.x = Math.round((CANVAS_W - el.width) / 2)
        if (axis === 'v' || axis === 'both') changes.y = Math.round((CANVAS_H - el.height) / 2)
        updateElement(id, changes)
    }

    const buildTextStyle = (el, scale = 1) => {
        const style = {
            width: '100%',
            fontSize: el.fontSize * scale,
            fontFamily: el.fontFamily,
            fontWeight: el.fontWeight,
            fontStyle: el.fontStyle || 'normal',
            textAlign: el.textAlign,
            userSelect: 'none',
            padding: '0 8px',
            opacity: (el.opacity ?? 100) / 100,
        }
        style.textShadow = el.textShadowEnabled
            ? `${el.textShadowX}px ${el.textShadowY}px ${el.textShadowBlur}px ${el.textShadowColor}`
            : '0 2px 8px rgba(0,0,0,0.6)'
        if (el.textStrokeEnabled)
            style.WebkitTextStroke = `${el.textStrokeWidth}px ${el.textStrokeColor}`
        if (el.gradientEnabled) {
            style.background = `linear-gradient(${el.gradientAngle}deg, ${el.gradientColor1}, ${el.gradientColor2})`
            style.WebkitBackgroundClip = 'text'
            style.WebkitTextFillColor = 'transparent'
            style.backgroundClip = 'text'
        } else {
            style.color = el.fontColor
        }
        return style
    }

    const buildAnimStyle = (el, active) => {
        if (!active || !el.animationType || el.animationType === 'none') return {}
        const isLoop = LOOP_ANIMATIONS.includes(el.animationType)
        return {
            animation: `${el.animationType} ${el.animationDuration}ms ${el.animationEasing || 'ease'} ${el.animationDelay}ms ${isLoop ? 'infinite' : 'both'}`,
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const layoutJson = JSON.stringify({ elements, backgroundMediaId: background?.id || null, bgOverlay, displayDuration, })
            await api.post(`/welcomescreens/${id}/screenconfig`, {
                backgroundMediaId: background?.id || null,
                canvasWidth: 1920, canvasHeight: 1080, layoutJson,
            })
            for (const el of elements) {
                await api.put(`/welcomescreens/${id}/fields/${el.id}`, {
                    sourceColumn: el.sourceColumn, displayLabel: el.label,
                    order: elements.indexOf(el), fontSize: el.fontSize,
                    fontFamily: el.fontFamily, fontColor: el.fontColor,
                    fontWeight: el.fontWeight, textAlign: el.textAlign,
                    positionX: (el.x / CANVAS_W) * 100, positionY: (el.y / CANVAS_H) * 100,
                    width: (el.width / CANVAS_W) * 100,
                    animationType: el.animationType,
                    animationDuration: el.animationDuration,
                    animationDelay: el.animationDelay,
                })
            }
            toast.success('Đã lưu layout!')
        } catch (err) {
            toast.error('Lưu thất bại: ' + (err.response?.data?.message || err.message))
        } finally { setSaving(false) }
    }

    if (!screen) return <div className="p-4">Đang tải...</div>

    const fields = screen.fields || []
    const sortedElements = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))

    return (
        <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f5f6fa' }}>

            {/* ===== SIDEBAR TRÁI ===== */}
            <div className="bg-white border-end d-flex flex-column" style={{ width:220, minWidth:220, overflowY:'auto' }}>
                <div className="p-3 border-bottom">
                    <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => navigate('/dashboard')}>← Quay lại</button>
                    <div className="fw-bold mt-2 small">{screen.name}</div>
                </div>

                {/* Trường thông tin */}
                <div className="p-3 border-bottom">
                    <div className="small fw-bold text-muted mb-2">TRƯỜNG THÔNG TIN</div>
                    {fields.length === 0 && <div className="text-muted small">Chưa có trường. Cấu hình CSDL trước.</div>}
                    {fields.map(f => (
                        <div key={f.id} className="border rounded p-2 mb-2 small bg-light" style={{ cursor:'grab' }}
                             onClick={() => addElementFromField(f)}>
                            <div className="fw-medium">{f.displayLabel || f.sourceColumn}</div>
                            <div className="text-muted" style={{ fontSize:11 }}>{f.sourceColumn}</div>
                            <div className="text-primary" style={{ fontSize:11 }}>+ Thêm vào canvas</div>
                        </div>
                    ))}
                </div>

                {/* #5 LAYER PANEL */}
                {elements.length > 0 && (
                    <div className="p-3 border-bottom">
                        <div className="small fw-bold text-muted mb-2">LAYERS</div>
                        {sortedElements.slice().reverse().map(el => (
                            <div key={el.id}
                                 className={`d-flex align-items-center gap-1 rounded px-2 py-1 mb-1 small ${selectedId === el.id ? 'bg-primary text-white' : 'bg-light'}`}
                                 style={{ cursor:'pointer' }}
                                 onClick={() => setSelectedId(el.id)}>
                                <span className="flex-grow-1 text-truncate" style={{ maxWidth:90 }}>{el.label}</span>
                                <button className="btn btn-link p-0" style={{ fontSize:11, color:'inherit', lineHeight:1 }}
                                        onClick={e => { e.stopPropagation(); moveLayer(el.id, 'up') }}>▲</button>
                                <button className="btn btn-link p-0" style={{ fontSize:11, color:'inherit', lineHeight:1 }}
                                        onClick={e => { e.stopPropagation(); moveLayer(el.id, 'down') }}>▼</button>
                                <button className="btn btn-link p-0"
                                        style={{ fontSize:12, color: el.locked ? '#dc3545' : 'inherit', lineHeight:1 }}
                                        onClick={e => { e.stopPropagation(); updateElement(el.id, { locked: !el.locked }) }}>
                                    {el.locked ? '🔒' : '🔓'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* BACKGROUND */}
                <div className="p-3 border-bottom">
                    <div className="small fw-bold text-muted mb-2">BACKGROUND</div>
                    <div onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                         onDragLeave={() => setDragOver(false)}
                         onDrop={handleDrop}
                         onClick={() => bgInputRef.current.click()}
                         style={{
                             border:`2px dashed ${dragOver ? '#0d6efd' : '#dee2e6'}`,
                             borderRadius:8, padding:'14px 8px', textAlign:'center',
                             cursor:'pointer', background: dragOver ? '#e7f1ff' : '#f8f9fa',
                             transition:'all 0.2s', marginBottom:8
                         }}>
                        {uploadingBg ? <div className="small text-muted">Đang upload...</div> : (
                            <><div style={{ fontSize:22 }}>🖼️</div>
                                <div className="small text-muted mt-1">Kéo thả hoặc click</div>
                                <div style={{ fontSize:11, color:'#aaa' }}>PNG, JPG, MP4</div></>
                        )}
                    </div>
                    <input ref={bgInputRef} type="file" accept="image/*,video/mp4" style={{ display:'none' }}
                           onChange={e => { handleBgUpload(e.target.files[0]); e.target.value='' }} />
                    {background && (
                        <div className="border rounded overflow-hidden mb-1">
                            {background.fileType.startsWith('image/') ? (
                                <img src={BASE_URL + background.filePath}
                                     style={{ width:'100%', height:70, objectFit:'cover', display:'block' }} />
                            ) : (
                                <div className="bg-dark text-white d-flex align-items-center justify-content-center" style={{ height:70 }}>🎬 Video</div>
                            )}
                            <div className="d-flex justify-content-between align-items-center px-2 py-1 bg-light">
                                <span className="small text-truncate" style={{ maxWidth:130 }}>{background.originalName}</span>
                                <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => setBackground(null)}>✕</button>
                            </div>
                        </div>
                    )}
                    <button className="btn btn-outline-secondary btn-sm w-100 mt-1" onClick={() => setShowMediaPicker(true)}>
                        📂 Chọn từ thư viện
                    </button>
                </div>

                {/* #8 OVERLAY */}
                <div className="p-3">
                    <div className="small fw-bold text-muted mb-2">OVERLAY NỀN</div>
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="overlayCheck"
                               checked={bgOverlay.enabled}
                               onChange={e => setBgOverlay(p => ({ ...p, enabled: e.target.checked }))} />
                        <label className="form-check-label small" htmlFor="overlayCheck">Bật overlay</label>
                    </div>
                    {bgOverlay.enabled && (
                        <>
                            <div className="d-flex gap-2 align-items-center mb-2">
                                <input type="color" className="form-control form-control-color"
                                       style={{ width:36, height:28, padding:2 }}
                                       value={bgOverlay.color}
                                       onChange={e => setBgOverlay(p => ({ ...p, color: e.target.value }))} />
                                <span className="small text-muted">Màu overlay</span>
                            </div>
                            <label className="form-label small mb-0">Độ mờ: {bgOverlay.opacity}%</label>
                            <input type="range" className="form-range" min={0} max={90} step={5}
                                   value={bgOverlay.opacity}
                                   onChange={e => setBgOverlay(p => ({ ...p, opacity: +e.target.value }))} />
                        </>
                    )}
                </div>
                {/* ⏱ THỜI GIAN HIỂN THỊ */}
                <div className="p-3 border-top">
                    <div className="small fw-bold text-muted mb-2">⏱ THỜI GIAN HIỂN THỊ</div>

                    <div className="d-flex align-items-center gap-2 mb-2">
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: 70 }}
                            min={1}
                            max={300}
                            value={displayDuration}
                            onChange={e => {
                                const val = Math.max(1, Math.min(300, +e.target.value || 1))
                                setDisplayDuration(val)
                            }}
                        />
                        <span className="small text-muted">giây / người</span>
                    </div>

                    <input
                        type="range"
                        className="form-range"
                        min={1}
                        max={60}
                        step={1}
                        value={Math.min(displayDuration, 60)}
                        onChange={e => setDisplayDuration(+e.target.value)}
                    />
                    <div className="d-flex justify-content-between" style={{ fontSize: 10, color: '#aaa' }}>
                        <span>1s</span>
                        <span>Kéo đến 60s, nhập tay nếu muốn lâu hơn</span>
                        <span>60s</span>
                    </div>
                </div>            </div>

            {/* ===== CANVAS ===== */}
            <div className="flex-grow-1 d-flex flex-column">
                <div className="bg-white border-bottom px-3 py-2 d-flex align-items-center gap-2 flex-wrap">
                    <span className="small text-muted d-none d-md-inline">Canvas 1920×1080</span>
                    <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" id="snapCheck"
                               checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} />
                        <label className="form-check-label small" htmlFor="snapCheck">Snap grid</label>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={undo}
                            disabled={historyIndex <= 0} title="Ctrl+Z">↩ Undo</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={redo}
                            disabled={historyIndex >= history.length - 1} title="Ctrl+Y">↪ Redo</button>
                    {selectedId && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={copyElement} title="Ctrl+C">📋 Copy</button>
                    )}
                    {clipboard && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={pasteElement} title="Ctrl+V">📌 Paste</button>
                    )}
                    <div className="ms-auto d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPreviewing(p => !p)}>
                            {previewing ? '✏️ Chỉnh sửa' : '▶️ Preview'}
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Đang lưu...' : '💾 Lưu'}
                        </button>
                    </div>
                </div>

                <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{ overflow:'auto' }}>
                    <div onClick={() => setSelectedId(null)} style={{
                        position:'relative', width:CANVAS_W, height:CANVAS_H,
                        background: background ? 'transparent' : '#111',
                        backgroundImage: snapEnabled && !previewing
                            ? 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)' : 'none',
                        backgroundSize:`${GRID_SIZE}px ${GRID_SIZE}px`,
                        border:'2px solid #dee2e6', borderRadius:8, overflow:'hidden', flexShrink:0,
                    }}>
                        {background?.fileType.startsWith('video/') && (
                            <video src={BASE_URL + background.filePath} autoPlay loop muted
                                   style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                        )}
                        {background?.fileType.startsWith('image/') && (
                            <img src={BASE_URL + background.filePath} alt=""
                                 style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                        )}

                        {/* #8 Overlay */}
                        {bgOverlay.enabled && (
                            <div style={{
                                position:'absolute', inset:0, zIndex:1,
                                background: bgOverlay.color,
                                opacity: bgOverlay.opacity / 100,
                                pointerEvents:'none',
                            }} />
                        )}

                        {sortedElements.map(el => (
                            previewing ? (
                                <div key={el.id} style={{
                                    position:'absolute', left:el.x, top:el.y, width:el.width,
                                    zIndex:(el.zIndex ?? 0)+2, pointerEvents:'none',
                                    ...buildTextStyle(el, CANVAS_W/1920),
                                    ...buildAnimStyle(el, true),
                                }}>{el.label}</div>
                            ) : (
                                <Rnd key={el.id}
                                     position={{ x:el.x, y:el.y }}
                                     size={{ width:el.width, height:el.height }}
                                     bounds="parent"
                                     disableDragging={el.locked}
                                     enableResizing={!el.locked}
                                     dragGrid={snapEnabled ? [GRID_SIZE,GRID_SIZE] : [1,1]}
                                     resizeGrid={snapEnabled ? [GRID_SIZE,GRID_SIZE] : [1,1]}
                                     onDragStop={(e,d) => updateElement(el.id, { x:snapToGrid(d.x), y:snapToGrid(d.y) })}
                                     onResizeStop={(e,dir,ref,delta,pos) => updateElement(el.id, {
                                         width:parseInt(ref.style.width), height:parseInt(ref.style.height),
                                         x:snapToGrid(pos.x), y:snapToGrid(pos.y),
                                     })}
                                     onClick={e => { e.stopPropagation(); if (!el.locked) setSelectedId(el.id) }}
                                     style={{
                                         border: selectedId===el.id ? '2px solid #0d6efd'
                                             : el.locked ? '1px dashed rgba(255,80,80,0.7)'
                                                 : '1px dashed rgba(255,255,255,0.4)',
                                         borderRadius:4, cursor: el.locked ? 'not-allowed' : 'move',
                                         display:'flex', alignItems:'center',
                                         background: selectedId===el.id ? 'rgba(13,110,253,0.08)' : 'transparent',
                                         zIndex:(el.zIndex ?? 0)+2,
                                     }}>
                                    <div style={{
                                        ...buildTextStyle(el, CANVAS_W/1920),
                                        ...buildAnimStyle(el, previewingEl===el.id),
                                    }}>{el.label}</div>
                                    {selectedId===el.id && !el.locked && (
                                        <button onClick={e => { e.stopPropagation(); removeElementById(el.id) }}
                                                style={{
                                                    position:'absolute', top:-12, right:-12,
                                                    width:22, height:22, borderRadius:'50%',
                                                    background:'#dc3545', border:'none', color:'#fff',
                                                    fontSize:12, cursor:'pointer', display:'flex',
                                                    alignItems:'center', justifyContent:'center', zIndex:10
                                                }}>×</button>
                                    )}
                                </Rnd>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== SIDEBAR PHẢI ===== */}
            <div className="bg-white border-start d-flex flex-column" style={{ width:280, minWidth:280, overflowY:'auto' }}>
                {selectedEl ? (
                    <div className="p-3">
                        <div className="fw-bold mb-3">⚙️ {selectedEl.label}</div>

                        {/* #4 Căn giữa nhanh */}
                        <div className="mb-3">
                            <label className="form-label small fw-medium">Căn giữa nhanh</label>
                            <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-secondary flex-fill"
                                        onClick={() => centerElement(selectedEl.id,'h')}>↔ Ngang</button>
                                <button className="btn btn-sm btn-outline-secondary flex-fill"
                                        onClick={() => centerElement(selectedEl.id,'v')}>↕ Dọc</button>
                                <button className="btn btn-sm btn-outline-primary flex-fill"
                                        onClick={() => centerElement(selectedEl.id,'both')}>⊕ Cả 2</button>
                            </div>
                        </div>

                        <hr className="my-2" />

                        <div className="mb-2">
                            <label className="form-label small fw-medium">Cỡ chữ: {selectedEl.fontSize}px</label>
                            <input type="range" className="form-range" min={12} max={200}
                                   value={selectedEl.fontSize}
                                   onChange={e => updateElement(selectedEl.id, { fontSize:+e.target.value })} />
                        </div>

                        <div className="mb-2">
                            <label className="form-label small fw-medium">Font</label>
                            <select className="form-select form-select-sm" value={selectedEl.fontFamily}
                                    onChange={e => updateElement(selectedEl.id, { fontFamily:e.target.value })}>
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div className="mb-2">
                            <label className="form-label small fw-medium">Opacity: {selectedEl.opacity ?? 100}%</label>
                            <input type="range" className="form-range" min={10} max={100} step={5}
                                   value={selectedEl.opacity ?? 100}
                                   onChange={e => updateElement(selectedEl.id, { opacity:+e.target.value })} />
                        </div>

                        <div className="mb-2">
                            <label className="form-label small fw-medium">Màu chữ</label>
                            <div className="d-flex gap-2 align-items-center">
                                <input type="color" className="form-control form-control-color"
                                       value={selectedEl.fontColor}
                                       onChange={e => updateElement(selectedEl.id, { fontColor:e.target.value })} />
                                <span className="small text-muted">{selectedEl.fontColor}</span>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="d-flex gap-2">
                                <div className="flex-fill">
                                    <label className="form-label small fw-medium">Độ đậm</label>
                                    <select className="form-select form-select-sm" value={selectedEl.fontWeight}
                                            onChange={e => updateElement(selectedEl.id, { fontWeight:e.target.value })}>
                                        <option value="normal">Normal</option>
                                        <option value="bold">Bold</option>
                                    </select>
                                </div>
                                <div className="flex-fill">
                                    <label className="form-label small fw-medium">Kiểu</label>
                                    <select className="form-select form-select-sm" value={selectedEl.fontStyle || 'normal'}
                                            onChange={e => updateElement(selectedEl.id, { fontStyle:e.target.value })}>
                                        <option value="normal">Normal</option>
                                        <option value="italic">Italic</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-medium">Căn chỉnh</label>
                            <div className="btn-group w-100">
                                {['left','center','right'].map(a => (
                                    <button key={a}
                                            className={`btn btn-sm ${selectedEl.textAlign===a ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => updateElement(selectedEl.id, { textAlign:a })}>
                                        {a==='left' ? '⬅️' : a==='center' ? '↔️' : '➡️'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="my-2" />

                        {/* #2 TEXT SHADOW */}
                        <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small fw-medium">🌑 Text Shadow</span>
                                <div className="form-check form-switch mb-0">
                                    <input className="form-check-input" type="checkbox"
                                           checked={selectedEl.textShadowEnabled || false}
                                           onChange={e => updateElement(selectedEl.id, { textShadowEnabled:e.target.checked })} />
                                </div>
                            </div>
                            {selectedEl.textShadowEnabled && (
                                <div className="border rounded p-2 bg-light">
                                    <div className="d-flex gap-2 align-items-center mb-2">
                                        <input type="color" className="form-control form-control-color"
                                               style={{ width:32, height:26, padding:2 }}
                                               value={selectedEl.textShadowColor}
                                               onChange={e => updateElement(selectedEl.id, { textShadowColor:e.target.value })} />
                                        <span className="small">Màu shadow</span>
                                    </div>
                                    {[
                                        { key:'textShadowBlur', label:`Blur: ${selectedEl.textShadowBlur}px`, min:0, max:30 },
                                        { key:'textShadowX', label:`Offset X: ${selectedEl.textShadowX}px`, min:-20, max:20 },
                                        { key:'textShadowY', label:`Offset Y: ${selectedEl.textShadowY}px`, min:-20, max:20 },
                                    ].map(({ key, label, min, max }) => (
                                        <div key={key}>
                                            <label className="form-label small mb-0">{label}</label>
                                            <input type="range" className="form-range" min={min} max={max}
                                                   value={selectedEl[key]}
                                                   onChange={e => updateElement(selectedEl.id, { [key]:+e.target.value })} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* #2 TEXT STROKE */}
                        <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small fw-medium">✏️ Viền chữ</span>
                                <div className="form-check form-switch mb-0">
                                    <input className="form-check-input" type="checkbox"
                                           checked={selectedEl.textStrokeEnabled || false}
                                           onChange={e => updateElement(selectedEl.id, { textStrokeEnabled:e.target.checked })} />
                                </div>
                            </div>
                            {selectedEl.textStrokeEnabled && (
                                <div className="border rounded p-2 bg-light">
                                    <div className="d-flex gap-2 align-items-center mb-2">
                                        <input type="color" className="form-control form-control-color"
                                               style={{ width:32, height:26, padding:2 }}
                                               value={selectedEl.textStrokeColor}
                                               onChange={e => updateElement(selectedEl.id, { textStrokeColor:e.target.value })} />
                                        <span className="small">Màu viền</span>
                                    </div>
                                    <label className="form-label small mb-0">Độ dày: {selectedEl.textStrokeWidth}px</label>
                                    <input type="range" className="form-range" min={1} max={8}
                                           value={selectedEl.textStrokeWidth}
                                           onChange={e => updateElement(selectedEl.id, { textStrokeWidth:+e.target.value })} />
                                </div>
                            )}
                        </div>

                        {/* #7 GRADIENT */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small fw-medium">🌈 Gradient chữ</span>
                                <div className="form-check form-switch mb-0">
                                    <input className="form-check-input" type="checkbox"
                                           checked={selectedEl.gradientEnabled || false}
                                           onChange={e => updateElement(selectedEl.id, { gradientEnabled:e.target.checked })} />
                                </div>
                            </div>
                            {selectedEl.gradientEnabled && (
                                <div className="border rounded p-2 bg-light">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="text-center">
                                            <div style={{ fontSize:10 }} className="text-muted mb-1">Màu 1</div>
                                            <input type="color" className="form-control form-control-color"
                                                   style={{ width:40, height:30, padding:2 }}
                                                   value={selectedEl.gradientColor1}
                                                   onChange={e => updateElement(selectedEl.id, { gradientColor1:e.target.value })} />
                                        </div>
                                        <span className="flex-grow-1 text-center small text-muted">→</span>
                                        <div className="text-center">
                                            <div style={{ fontSize:10 }} className="text-muted mb-1">Màu 2</div>
                                            <input type="color" className="form-control form-control-color"
                                                   style={{ width:40, height:30, padding:2 }}
                                                   value={selectedEl.gradientColor2}
                                                   onChange={e => updateElement(selectedEl.id, { gradientColor2:e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{
                                        height:14, borderRadius:4, marginBottom:6,
                                        background:`linear-gradient(${selectedEl.gradientAngle}deg, ${selectedEl.gradientColor1}, ${selectedEl.gradientColor2})`
                                    }} />
                                    <label className="form-label small mb-0">Góc: {selectedEl.gradientAngle}°</label>
                                    <input type="range" className="form-range" min={0} max={360} step={15}
                                           value={selectedEl.gradientAngle}
                                           onChange={e => updateElement(selectedEl.id, { gradientAngle:+e.target.value })} />
                                </div>
                            )}
                        </div>

                        <hr className="my-2" />

                        {/* #3 ANIMATION */}
                        <div className="mb-2">
                            <label className="form-label small fw-medium">🎬 Animation</label>
                            <select className="form-select form-select-sm mb-2"
                                    value={selectedEl.animationType}
                                    onChange={e => updateElement(selectedEl.id, { animationType:e.target.value })}>
                                {ANIMATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                            <label className="form-label small fw-medium">Easing</label>
                            <select className="form-select form-select-sm mb-2"
                                    value={selectedEl.animationEasing || 'ease'}
                                    onChange={e => updateElement(selectedEl.id, { animationEasing:e.target.value })}>
                                <option value="ease">Ease</option>
                                <option value="ease-in">Ease In</option>
                                <option value="ease-out">Ease Out</option>
                                <option value="ease-in-out">Ease In Out</option>
                                <option value="linear">Linear</option>
                                <option value="cubic-bezier(0.34,1.56,0.64,1)">Spring</option>
                            </select>
                            <button className="btn btn-sm btn-outline-primary w-100"
                                    onClick={() => previewAnimation(selectedEl)}>
                                ▶️ Xem thử animation
                            </button>
                        </div>

                        <div className="mb-2">
                            <label className="form-label small fw-medium">Thời gian: {selectedEl.animationDuration}ms</label>
                            <input type="range" className="form-range" min={200} max={3000} step={100}
                                   value={selectedEl.animationDuration}
                                   onChange={e => updateElement(selectedEl.id, { animationDuration:+e.target.value })} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-medium">Delay: {selectedEl.animationDelay}ms</label>
                            <input type="range" className="form-range" min={0} max={3000} step={100}
                                   value={selectedEl.animationDelay}
                                   onChange={e => updateElement(selectedEl.id, { animationDelay:+e.target.value })} />
                        </div>

                        <hr className="my-2" />

                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={copyElement}>
                                📋 Copy
                            </button>
                            <button className="btn btn-sm btn-outline-danger flex-fill"
                                    onClick={() => removeElementById(selectedEl.id)}>
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 text-muted small text-center mt-4">
                        <div style={{ fontSize:32 }}>👆</div>
                        <p className="mt-2">Click vào một trường trên canvas để chỉnh sửa</p>
                        <div className="text-start border rounded p-2 bg-light mt-3" style={{ fontSize:11 }}>
                            <div className="fw-bold mb-1">⌨️ Phím tắt</div>
                            <div>Ctrl+Z — Undo</div>
                            <div>Ctrl+Y — Redo</div>
                            <div>Ctrl+C — Copy element</div>
                            <div>Ctrl+V — Paste element</div>
                            <div>Delete — Xóa element</div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MEDIA PICKER MODAL ===== */}
            {showMediaPicker && (
                <div style={{
                    position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
                    zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'
                }} onClick={() => setShowMediaPicker(false)}>
                    <div className="bg-white rounded-3 p-4 shadow"
                         style={{ width:660, maxHeight:'80vh', overflow:'auto' }}
                         onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">Chọn Background</h6>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-primary"
                                        onClick={() => pickerInputRef.current.click()}
                                        disabled={pickerUploading}>
                                    {pickerUploading ? 'Đang upload...' : '⬆️ Upload ảnh/video mới'}
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowMediaPicker(false)}>✕</button>
                            </div>
                        </div>
                        <input ref={pickerInputRef} type="file" accept="image/*,video/mp4" style={{ display:'none' }}
                               onChange={e => handlePickerUpload(e.target.files[0])} />
                        <div className="row g-2">
                            {mediaList.map(m => (
                                <div key={m.id} className="col-4">
                                    <div onClick={() => { setBackground(m); setShowMediaPicker(false) }}
                                         style={{
                                             cursor:'pointer',
                                             border: background?.id===m.id ? '2px solid #0d6efd' : '1px solid #dee2e6',
                                             borderRadius:8, overflow:'hidden'
                                         }}>
                                        {m.fileType.startsWith('image/') ? (
                                            <img src={BASE_URL + m.filePath} alt={m.originalName}
                                                 style={{ width:'100%', height:100, objectFit:'cover', display:'block' }} />
                                        ) : (
                                            <div className="bg-dark text-white d-flex align-items-center justify-content-center" style={{ height:100 }}>
                                                🎬 Video
                                            </div>
                                        )}
                                        <div className="px-2 py-1 small text-truncate bg-light">{m.originalName}</div>
                                    </div>
                                </div>
                            ))}
                            {mediaList.length === 0 && !pickerUploading && (
                                <div className="col-12 text-center text-muted py-4">
                                    Chưa có media. Bấm "Upload ảnh/video mới" để thêm.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}