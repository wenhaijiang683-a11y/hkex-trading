import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, MessageCircle, ExternalLink, WifiOff, Headphones } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Service() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  const getChannelUrl = () => {
    const baseUrl = 'https://47.238.145.221:1520/chat/index'
    const params = new URLSearchParams()
    params.set('channelId', 'cdc4155fe5b5433b8c4bc747935c64d6')
    if (user?.name) params.set('visitorName', user.name)
    if (user?.phone) params.set('visitorPhone', user.phone)
    if (user?.id) params.set('visitorId', user.id)
    return `${baseUrl}?${params.toString()}`
  }

  // 5秒后如果还在loading，显示打开按钮
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setLoadError(true)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  const handleOpenChat = () => {
    window.open(getChannelUrl(), '_blank')
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      {/* 头部 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm hover:opacity-80">
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-base font-semibold">在线客服</h1>
        <div className="w-12" />
      </div>

      {loading && !loadError ? (
        /* 加载中 */
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-[#003366] rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">正在连接客服系统...</p>
        </div>
      ) : loadError ? (
        /* 加载失败 - 显示手动打开按钮 */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Headphones className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">在线客服</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            客服系统需要在新窗口中打开
          </p>

          <button
            onClick={handleOpenChat}
            className="w-full max-w-xs py-3 bg-[#003366] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#002855] active:bg-[#001a33] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            打开客服对话
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="mt-8 w-full max-w-xs bg-muted rounded-xl p-4">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">无法打开？</p>
                <p>请检查网络连接，或直接联系客服热线</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* iframe 嵌入 */
        <iframe
          src={getChannelUrl()}
          className="flex-1 w-full border-0"
          title="在线客服"
          allow="camera; microphone"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setLoadError(true) }}
        />
      )}
    </div>
  )
}
