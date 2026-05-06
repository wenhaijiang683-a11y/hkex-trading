import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  ArrowLeft, User, ChevronRight, LogOut, Lock, Smartphone, FileText, CreditCard,
  Camera, Edit3, Eye, EyeOff
} from 'lucide-react'

// 预设头像颜色
const avatarColors = [
  { bg: 'bg-blue-600', label: '蓝' },
  { bg: 'bg-green-600', label: '绿' },
  { bg: 'bg-red-600', label: '红' },
  { bg: 'bg-purple-600', label: '紫' },
  { bg: 'bg-amber-600', label: '橙' },
  { bg: 'bg-cyan-600', label: '青' },
  { bg: 'bg-pink-600', label: '粉' },
  { bg: 'bg-gray-700', label: '灰' },
]

export default function Account() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showPwModal, setShowPwModal] = useState(false)
  // Edit profile modals
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  // Form states
  const [newName, setNewName] = useState(user?.name || '')
  const [newPhone, setNewPhone] = useState('')
  const [phonePassword, setPhonePassword] = useState('')
  const [showPhonePw, setShowPhonePw] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">请先登录</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-[#003366] text-white rounded-lg">去登录</button>
      </div>
    )
  }

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const avatarBg = user.avatar || 'bg-blue-600'

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 3000)
  }
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Save avatar
  const saveAvatar = () => {
    userData.avatar = selectedAvatar
    localStorage.setItem('user_data', JSON.stringify(userData))
    user.avatar = selectedAvatar
    setShowAvatarModal(false)
    showSuccess('头像更换成功')
  }

  // Save name
  const saveName = () => {
    if (!newName.trim()) { showError('昵称不能为空'); return }
    userData.name = newName.trim()
    localStorage.setItem('user_data', JSON.stringify(userData))
    user.name = newName.trim()
    // Also update reg data
    const regData = JSON.parse(localStorage.getItem(`reg_${user.phone}`) || '{}')
    regData.name = newName.trim()
    localStorage.setItem(`reg_${user.phone}`, JSON.stringify(regData))
    setShowNameModal(false)
    showSuccess('昵称修改成功')
  }

  // Change phone (requires password)
  const changePhone = () => {
    if (!newPhone.trim()) { showError('请输入新手机号'); return }
    if (!/^1[3-9]\d{9}$/.test(newPhone)) { showError('请输入有效的11位手机号'); return }
    // Check password
    const storedPw = userData.password || ''
    if (!phonePassword) { showError('请输入密码'); return }
    if (phonePassword !== storedPw) { showError('密码错误'); return }
    if (newPhone === user.phone) { showError('新号码不能与当前号码相同'); return }

    // Update all data
    const oldPhone = user.phone
    userData.phone = newPhone
    localStorage.setItem('user_data', JSON.stringify(userData))
    user.phone = newPhone
    // Copy reg data to new phone key
    const regData = JSON.parse(localStorage.getItem(`reg_${oldPhone}`) || '{}')
    localStorage.setItem(`reg_${newPhone}`, JSON.stringify(regData))
    localStorage.removeItem(`reg_${oldPhone}`)

    setShowPhoneModal(false)
    setNewPhone('')
    setPhonePassword('')
    showSuccess('手机号换绑成功')
  }

  return (
    <div className="pb-20 md:pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">账户管理</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {/* Success/Error toast */}
        {successMsg && (
          <div className="fixed top-16 left-4 right-4 z-[70] bg-green-500 text-white text-sm text-center py-2.5 rounded-xl shadow-lg animate-slide-down">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="fixed top-16 left-4 right-4 z-[70] bg-red-500 text-white text-sm text-center py-2.5 rounded-xl shadow-lg animate-slide-down">
            {errorMsg}
          </div>
        )}

        {/* Avatar - clickable */}
        <div className="text-center py-6">
          <button onClick={() => { setSelectedAvatar(user.avatar || ''); setShowAvatarModal(true) }} className="relative inline-block group">
            <div className={`w-20 h-20 ${avatarBg} rounded-full flex items-center justify-center mx-auto shadow-lg border-3 border-white ring-2 ring-[#003366]/20 group-hover:ring-[#003366]/40 transition-all`}>
              <span className="text-white text-2xl font-bold">{user.name[0]}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#003366] rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          <p className="text-sm font-medium mt-3">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
        </div>

        {/* Info List - all clickable */}
        <div className="bg-card border rounded-xl divide-y">
          <button onClick={() => { setNewName(user.name); setShowNameModal(true) }} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${avatarBg} rounded-lg flex items-center justify-center`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">昵称</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Edit3 className="w-3.5 h-3.5 text-[#003366]" />
            </div>
          </button>

          <button onClick={() => { setNewPhone(''); setPhonePassword(''); setShowPhoneModal(true) }} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm">手机号</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{user.phone}</span>
              <Edit3 className="w-3.5 h-3.5 text-[#003366]" />
            </div>
          </button>

          <button onClick={() => setShowPwModal(true)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm">修改密码</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button onClick={() => navigate('/user/auth')} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm">实名认证</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${user.isRealName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.isRealName ? '已认证' : '未认证'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>

          <button onClick={() => navigate('/user/bank')} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm">银行卡绑定</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${user.isBankBound ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.isBankBound ? '已绑定' : '未绑定'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        </div>

        <button onClick={() => { logout(); navigate('/index') }}
          className="w-full py-3 border border-red-500 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> 退出登录
        </button>
      </div>

      {/* ====== Avatar Modal ====== */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowAvatarModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full md:w-[400px] bg-background rounded-t-2xl md:rounded-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-center">选择头像</h3>
            <div className="flex justify-center my-4">
              <div className={`w-16 h-16 ${selectedAvatar || 'bg-blue-600'} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white text-xl font-bold">{user.name[0]}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {avatarColors.map(c => (
                <button key={c.label} onClick={() => setSelectedAvatar(c.bg)}
                  className={`w-full aspect-square ${c.bg} rounded-xl flex items-center justify-center transition-all ${
                    selectedAvatar === c.bg ? 'ring-3 ring-[#003366] ring-offset-2 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}>
                  <span className="text-white text-lg font-bold">{user.name[0]}</span>
                </button>
              ))}
            </div>
            <button onClick={saveAvatar} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">确认</button>
          </div>
        </div>
      )}

      {/* ====== Name Modal ====== */}
      {showNameModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowNameModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full md:w-[400px] bg-background rounded-t-2xl md:rounded-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">修改昵称</h3>
            <div className="mt-4 space-y-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="输入新昵称"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
              <button onClick={saveName} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">确认修改</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Phone Modal (requires password) ====== */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowPhoneModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full md:w-[400px] bg-background rounded-t-2xl md:rounded-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">换绑手机号</h3>
            <p className="text-xs text-muted-foreground mt-1">当前号码：{user.phone}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">新手机号</label>
                <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="输入新手机号"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">登录密码（验证身份）</label>
                <div className="relative mt-1">
                  <input type={showPhonePw ? 'text' : 'password'} value={phonePassword} onChange={e => setPhonePassword(e.target.value)} placeholder="输入密码"
                    className="w-full px-4 py-3 pr-10 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
                  <button onClick={() => setShowPhonePw(!showPhonePw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPhonePw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <button onClick={changePhone} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">确认换绑</button>
              <p className="text-[10px] text-muted-foreground text-center">换绑后需用新号码登录</p>
            </div>
          </div>
        </div>
      )}

      {/* ====== Password Modal ====== */}
      {showPwModal && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setShowPwModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full bg-background rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">修改密码</h3>
            <div className="mt-4 space-y-3">
              <input type="password" placeholder="旧密码" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="password" placeholder="新密码" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="password" placeholder="确认新密码" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <button onClick={() => { setShowPwModal(false); showSuccess('密码修改成功') }} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
