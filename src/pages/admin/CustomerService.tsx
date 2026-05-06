import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Send, Search, MessageCircle, Users, Clock, ChevronLeft,
  Power, Zap, BarChart3, Settings,
  TrendingUp, MapPin, Smartphone, User,
  ChevronDown, CheckCircle, Volume2, VolumeX, ArrowLeft, ImagePlus, LogOut
} from 'lucide-react'
import { useAllChatMessages } from '../../hooks/useChatSync'
import { getAllUsers } from '../../utils/userData'
import { quickReplies } from '../../data/stockData'

const rejectReasons = [
  '身份信息不清晰，请重新上传',
  '身份证已过期，请使用有效证件',
  '银行卡与实名信息不一致',
  '转账凭证不清晰，请重新上传',
  '充值金额与转账金额不符',
]

export default function CustomerService() {
  const navigate = useNavigate()
  const { adminLogout } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [showQuickPanel, setShowQuickPanel] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { allMessages, sendToUser, unreadCount } = useAllChatMessages()

  // Load users
  useEffect(() => {
    const realUsers = getAllUsers()
    const mappedUsers = realUsers.map(u => {
      const userMsgs = allMessages[u.id] || []
      const lastMsg = userMsgs[userMsgs.length - 1]
      return {
        ...u,
        lastMessage: lastMsg ? (lastMsg.type === 'image' || lastMsg.image ? '[图片]' : lastMsg.content) : '暂无消息',
        time: lastMsg ? lastMsg.time : '-',
        unread: unreadCount(u.id),
      }
    })
    setChatUsers(mappedUsers)
  }, [allMessages, unreadCount])

  // Sound
  const playSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.1
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch { /* ignore */ }
  }, [soundEnabled])

  const filteredUsers = search
    ? chatUsers.filter(u => u.name.includes(search) || u.phone.includes(search) || u.id.includes(search))
    : chatUsers

  const currentUser = chatUsers.find(u => u.id === selectedUserId)
  const currentMessages = selectedUserId ? (allMessages[selectedUserId] || []) : []

  // Mark as read
  useEffect(() => {
    if (selectedUserId) {
      const stored = localStorage.getItem('hkex_chat_messages')
      if (!stored) return
      const all = JSON.parse(stored)
      const updated = all.map((m: any) => {
        if (m.userId === selectedUserId && m.from === 'user' && !m.read) return { ...m, read: true }
        return m
      })
      localStorage.setItem('hkex_chat_messages', JSON.stringify(updated))
    }
  }, [selectedUserId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [allMessages, selectedUserId])

  const sendMessage = () => {
    if (!input.trim() || !selectedUserId) return
    sendToUser(selectedUserId, input)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Send image from admin
  const sendImage = (base64: string) => {
    if (!selectedUserId) return
    const stored = localStorage.getItem('hkex_chat_messages')
    const all = stored ? JSON.parse(stored) : []
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    all.push({ id: Date.now(), userId: selectedUserId, from: 'admin', content: '', image: base64, time, read: false, type: 'image' })
    localStorage.setItem('hkex_chat_messages', JSON.stringify(all))
    window.dispatchEvent(new StorageEvent('storage', { key: 'hkex_chat_messages' }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片'); return }
    if (file.size > 5 * 1024 * 1024) { alert('不能超过5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => sendImage(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const sendQuickReply = (text: string) => {
    if (!selectedUserId) return
    sendToUser(selectedUserId, text)
  }

  const handleBack = () => {
    if (selectedUserId) setSelectedUserId(null)
    else navigate('/admin/dashboard')
  }

  const quickReplyCategories = [
    { name: '常用', replies: quickReplies.slice(0, 3) },
    { name: '充值', replies: ['充值服务时间为09:00-22:00', '请提供转账凭证', '审核预计1-2个工作日'] },
    { name: '提现', replies: ['提现服务时间为09:00-22:00', '请确认银行卡信息', '提现1-3个工作日到账'] },
    { name: '驳回', replies: rejectReasons },
  ]

  return (
    <div className="h-[100dvh] flex bg-[#f0f2f5]">
      {/* ====== Left Panel - User List ====== */}
      <div className={`w-full md:w-[320px] lg:w-[340px] bg-white border-r border-gray-200 flex flex-col shadow-sm ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="shrink-0 p-3 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#004080] text-white">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={handleBack} className="p-1.5 hover:bg-white/15 rounded-full transition-colors">
              {selectedUserId ? <ChevronLeft className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <img src="/cs_avatar.png" alt="" className="w-7 h-7 rounded-full object-cover border border-white/30" />
            <span className="font-semibold">客服工作台</span>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="ml-auto p-1.5 hover:bg-white/15 rounded-full transition-colors"
              title={soundEnabled ? '关闭提示音' : '开启提示音'}>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/50" />}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用户"
              className="w-full pl-9 pr-3 py-2 bg-white/15 border border-white/25 rounded-xl text-xs text-white outline-none placeholder:text-white/40 focus:bg-white/25 transition-colors" />
          </div>
        </div>

        {/* Stats */}
        <div className="shrink-0 flex gap-2 px-3 py-2 border-b border-gray-100 text-[10px]">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 在线 {chatUsers.filter((u: any) => u.isOnline).length}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
            <Clock className="w-2.5 h-2.5" /> 未读 {chatUsers.reduce((sum: number, u: any) => sum + u.unread, 0)}
          </span>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {chatUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm">暂无注册用户</p>
              <p className="text-xs mt-1 text-gray-300">用户注册后将显示</p>
            </div>
          ) : (
            filteredUsers.map((user: any) => (
              <button key={user.id} onClick={() => { setSelectedUserId(user.id); playSound(); }}
                className={`w-full flex items-start gap-3 p-3.5 text-left transition-all border-b border-gray-50 ${
                  selectedUserId === user.id ? 'bg-[#e6f0ff] border-l-[3px] border-l-[#003366]' : 'hover:bg-gray-50'
                }`}>
                <div className="relative shrink-0 self-start">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white text-sm font-bold">{user.name[0]}</span>
                  </div>
                  {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{user.location || '-'}</span>
                    <span>{user.time}</span>
                  </div>
                </div>
                {user.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5 animate-pulse shadow-sm">
                    {user.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Bottom Nav */}
        <div className="shrink-0 border-t border-gray-200 p-1.5 grid grid-cols-6 gap-0.5 text-[9px] text-center text-gray-500 bg-white">
          {[
            { icon: Zap, label: '看板', path: '/admin/dashboard' },
            { icon: Users, label: '用户', path: '/admin/users' },
            { icon: BarChart3, label: '控盘', path: '/admin/market-control' },
            { icon: TrendingUp, label: '盈亏', path: '/admin/user-profit' },
            { icon: Settings, label: '设置', path: '/admin/settings' },
            { icon: LogOut, label: '退出', path: 'logout', isLogout: true },
          ].map(item => (
            <button key={item.label}
              onClick={() => {
                if (item.isLogout) {
                  if (confirm('确认退出后台登录？')) {
                    adminLogout()
                    navigate('/admin/login')
                  }
                } else {
                  navigate(item.path)
                }
              }}
              className={`p-1.5 rounded-lg flex flex-col items-center gap-0.5 transition-colors ${
                item.isLogout ? 'hover:bg-red-100 text-gray-500 hover:text-red-600' : 'hover:bg-gray-100'
              }`}>
              <item.icon className={`w-3.5 h-3.5 ${item.isLogout ? '' : ''}`} />{item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ====== Middle - Chat ====== */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedUserId ? 'hidden md:flex' : ''}`}>
        {currentUser ? (
          <>
            {/* Chat Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white text-sm font-bold">{currentUser.name[0]}</span>
                  </div>
                  {currentUser.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{currentUser.location || '-'}</span>
                    <span className="flex items-center gap-0.5"><Smartphone className="w-2.5 h-2.5" />{currentUser.device || '-'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => navigate(`/admin/user-profit?user=${currentUser.id}`)}
                  className="px-3 py-1.5 text-xs bg-[#003366] text-white hover:bg-[#002855] rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <TrendingUp className="w-3 h-3" /> 盈亏
                </button>
                <button onClick={() => alert(`已强制用户 ${currentUser.name} 下线`)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 border border-red-200">
                  <Power className="w-3 h-3" /> 下线
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]" style={{ WebkitOverflowScrolling: 'touch' }}>
              {currentMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                    <MessageCircle className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-sm font-medium">选择一个用户开始对话</p>
                </div>
              )}
              {currentMessages.map((msg: any) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  {/* User Avatar */}
                  {msg.from !== 'admin' && (
                    <div className="shrink-0 self-start w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm border border-white">
                      <span className="text-white text-xs font-bold">{msg.from === 'system' ? 'S' : currentUser.name[0]}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[70%] overflow-hidden ${
                    msg.from === 'admin'
                      ? 'bg-gradient-to-r from-[#003366] to-[#004080] text-white rounded-2xl rounded-br-sm border border-[#003366]/20 shadow-sm'
                      : 'bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.type === 'image' || msg.image ? (
                      <img src={msg.image || msg.content} alt="" className="max-w-full max-h-[200px] object-cover rounded-xl cursor-pointer"
                        onClick={() => window.open(msg.image || msg.content, '_blank')} />
                    ) : (
                      <div className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">{msg.content}</div>
                    )}
                    <p className={`text-[10px] px-3.5 pb-2 ${msg.from === 'admin' ? 'text-white/45' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>

                  {/* CS Avatar */}
                  {msg.from === 'admin' && (
                    <div className="shrink-0 self-start">
                      <img src="/cs_avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Reply Bar */}
            <div className="shrink-0 px-3 pt-2 bg-white border-t border-gray-200">
              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-1">
                {quickReplies.slice(0, 5).map((text, i) => (
                  <button key={i} onClick={() => sendQuickReply(text)}
                    className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-[#003366] hover:text-white rounded-full text-xs transition-colors cursor-pointer border border-transparent hover:border-[#003366]">
                    {text.length > 10 ? text.slice(0, 10) + '...' : text}
                  </button>
                ))}
                <button onClick={() => setShowQuickPanel(!showQuickPanel)} className="shrink-0 p-1.5 text-gray-400 hover:text-[#003366] hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showQuickPanel ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 p-3 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <button onClick={() => fileRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0 text-gray-400 hover:text-[#003366]">
                  <ImagePlus className="w-5 h-5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="输入消息..." className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 focus:bg-white border border-transparent focus:border-[#003366]/15 transition-all" />
                <button onClick={sendMessage}
                  className="w-10 h-10 bg-gradient-to-r from-[#003366] to-[#004080] rounded-xl flex items-center justify-center hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#f0f2f5]">
            <img src="/cs_avatar.png" alt="" className="w-20 h-20 rounded-full object-cover shadow-md mb-4 border-4 border-white" />
            <p className="text-sm font-medium">选择一个用户开始对话</p>
            <p className="text-xs text-gray-300 mt-1">点击左侧用户列表进入聊天</p>
          </div>
        )}
      </div>

      {/* ====== Right Panel - Quick Replies ====== */}
      {showQuickPanel && (
        <div className="hidden lg:flex w-[280px] bg-white border-l border-gray-200 flex-col shadow-sm">
          {currentUser ? (
            <div className="shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#004080] text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white/30">
                  {currentUser.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-white/60">{currentUser.phone}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between bg-white/10 rounded-lg px-3 py-1.5">
                  <span className="text-white/60">实名状态</span><span>{currentUser.isRealName ? '已认证' : '未认证'}</span>
                </div>
                <div className="flex justify-between bg-white/10 rounded-lg px-3 py-1.5">
                  <span className="text-white/60">银行卡</span><span className="font-mono">{currentUser.bankCard || '未绑定'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-white/50 text-[10px]">余额</p><p className="font-medium">¥{currentUser.balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-white/50 text-[10px]">今日盈亏</p><p className="font-medium">¥0</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 p-4 border-b border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-400">选择用户查看详情</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-[#003366]" /> 快捷话术库
            </p>
            {quickReplyCategories.map(cat => (
              <div key={cat.name} className="mb-3">
                <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wider">{cat.name}</p>
                <div className="space-y-1">
                  {cat.replies.map((reply, i) => (
                    <button key={i} onClick={() => { if (selectedUserId) { sendQuickReply(reply); playSound(); } }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        selectedUserId ? 'bg-gray-50 hover:bg-[#e6f0ff] hover:text-[#003366] cursor-pointer border border-transparent hover:border-[#003366]/20' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}>
                      {reply.length > 20 ? reply.slice(0, 20) + '...' : reply}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
