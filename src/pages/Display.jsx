import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { getById } from '../api/welcomescreen'
import api from '../api/axios'

const BASE_URL =  import.meta.env.VITE_API_URL

const ANIMATION_CSS = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-40px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideUp { from { opacity: 0; transform: translateY(60px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-60px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(80px) } to { opacity: 1; transform: translateX(0) } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-80px) } to { opacity: 1; transform: translateX(0) } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.3) } to { opacity: 1; transform: scale(1) } }
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
`

export default function DisplayPage() {
    const { id } = useParams()
    const [screen, setScreen] = useState(null)
    const [config, setConfig] = useState(null)
    const [guestData, setGuestData] = useState(null)
    const [visible, setVisible] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...')

    const connectionRef = useRef(null)
    const hideTimerRef = useRef(null)
    const replayTimersRef = useRef([])
    const configRef = useRef(null)

    useEffect(() => {
        const style = document.createElement('style')
        style.textContent = ANIMATION_CSS
        document.head.appendChild(style)

        function clearReplayTimers() {
            replayTimersRef.current.forEach(t => clearTimeout(t))
            replayTimersRef.current = []
        }

        async function loadScreen() {
            try {
                const { data: ws } = await getById(id)
                setScreen(ws)
                if (ws.screenConfig?.layoutJson) {
                    const cfg = JSON.parse(ws.screenConfig.layoutJson)
                    setConfig(cfg)
                    configRef.current = cfg

                    // ✅ Đọc displayDuration từ config, mặc định 5s nếu chưa set
                    const duration = (cfg.displayDuration || 5) * 1000

                    try {
                        const { data: processed } = await api.get(`/welcomescreens/${id}/processedguests`)
                        if (processed?.length > 0) {
                            clearReplayTimers()
                            processed.forEach((guest, index) => {
                                // ✅ Dùng duration thay vì hardcode 9000
                                const t = setTimeout(() => {
                                    setGuestData(guest)
                                    setVisible(false)
                                    setTimeout(() => setVisible(true), 100)
                                }, index * duration)
                                replayTimersRef.current.push(t)
                            })
                        }
                    } catch {
                        // không có processed guests thì bỏ qua
                    }
                }
            } catch (err) {
                console.error('Load screen error:', err)
            }
        }

        async function connectSignalR() {
            const token = localStorage.getItem('token')
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(`${BASE_URL}/hubs/display?access_token=${token}`)
                .withAutomaticReconnect()
                .build()

            connection.on('GuestCheckedIn', (data) => {
                console.log('📡 GuestCheckedIn:', data)
                clearReplayTimers()
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
                setGuestData(data)
                setVisible(false)
                setTimeout(() => {
                    setVisible(true)
                    // ✅ Dùng duration từ config thay vì hardcode 8000
                    // Đọc lại từ ref để luôn có giá trị mới nhất
                    const currentDuration = (configRef.current?.displayDuration || 5) * 1000
                    hideTimerRef.current = setTimeout(() => setVisible(false), currentDuration)
                }, 100)
            })

            connection.onreconnecting(() => setConnectionStatus('Đang kết nối lại...'))
            connection.onreconnected(async () => {
                setConnectionStatus('Đã kết nối')
                await connection.invoke('JoinScreen', id.toString())
            })

            try {
                await connection.start()
                await connection.invoke('JoinScreen', id.toString())
                setConnectionStatus('Đã kết nối')
                connectionRef.current = connection
            } catch (err) {
                setConnectionStatus('Lỗi kết nối')
                console.error('SignalR error:', err)
            }
        }

        loadScreen()
        connectSignalR()

        return () => {
            document.head.removeChild(style)
            clearReplayTimers()
            if (connectionRef.current) connectionRef.current.stop()
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        }
    }, [id])
    if (!screen || !config) {
        return (
            <div style={{
                width: '100vw', height: '100vh', background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 20, flexDirection: 'column', gap: 12
            }}>
                <div>Đang tải...</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{connectionStatus}</div>
            </div>
        )
    }

    const elements = config.elements || []
    const bgOverlay = config.bgOverlay || null
    const scaleX = window.innerWidth / 960
    const scaleY = window.innerHeight / 540

    return (
        <div style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#000' }}>

            {/* Background video/image */}
            {screen.screenConfig?.backgroundMedia?.fileType?.startsWith('video/') && (
                <video src={BASE_URL + screen.screenConfig.backgroundMedia.filePath}
                       autoPlay loop muted
                       style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
            )}
            {screen.screenConfig?.backgroundMedia?.fileType?.startsWith('image/') && (
                <img src={BASE_URL + screen.screenConfig.backgroundMedia.filePath} alt=""
                     style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
            )}

            {/* ✅ Overlay từ config Builder */}
            {bgOverlay?.enabled && (
                <div style={{
                    position:'absolute', inset:0, zIndex:1,
                    background: bgOverlay.color,
                    opacity: bgOverlay.opacity / 100,
                    pointerEvents:'none',
                }} />
            )}

            {visible && guestData && elements.map((el) => {
                const value = guestData[el.sourceColumn]
                    || guestData[el.sourceColumn?.toLowerCase()]
                    || guestData[el.sourceColumn?.toUpperCase()]
                    || el.label

                // ✅ Build text style đầy đủ (shadow, stroke, gradient)
                const textStyle = {
                    position: 'absolute',
                    left: el.x * scaleX,
                    top: el.y * scaleY,
                    width: el.width * scaleX,
                    fontSize: el.fontSize * scaleX,
                    fontFamily: el.fontFamily,
                    fontWeight: el.fontWeight,
                    fontStyle: el.fontStyle || 'normal',
                    textAlign: el.textAlign,
                    lineHeight: 1.2,
                    zIndex: (el.zIndex ?? 0) + 2,
                    opacity: (el.opacity ?? 100) / 100,
                    animation: el.animationType && el.animationType !== 'none'
                        ? `${el.animationType} ${el.animationDuration}ms ${el.animationEasing || 'ease'} ${el.animationDelay}ms both`
                        : 'none',
                }

                // Text shadow
                textStyle.textShadow = el.textShadowEnabled
                    ? `${el.textShadowX}px ${el.textShadowY}px ${el.textShadowBlur}px ${el.textShadowColor}`
                    : '0 4px 16px rgba(0,0,0,0.9)'

                // Text stroke
                if (el.textStrokeEnabled)
                    textStyle.WebkitTextStroke = `${el.textStrokeWidth}px ${el.textStrokeColor}`

                // Gradient hoặc màu thường
                if (el.gradientEnabled) {
                    textStyle.background = `linear-gradient(${el.gradientAngle}deg, ${el.gradientColor1}, ${el.gradientColor2})`
                    textStyle.WebkitBackgroundClip = 'text'
                    textStyle.WebkitTextFillColor = 'transparent'
                    textStyle.backgroundClip = 'text'
                } else {
                    textStyle.color = el.fontColor
                }

                return <div key={el.id} style={textStyle}>{value}</div>
            })}

            {/* Connection status */}
            <div style={{
                position:'absolute', bottom:12, right:16,
                fontSize:12, color:'rgba(255,255,255,0.4)', zIndex:20
            }}>
                {connectionStatus}
            </div>
        </div>
    )
}