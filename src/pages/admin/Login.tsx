import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Lock, User, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { admin, adminLogin } = useAuth()
  const [username, setUsername] = useState('whxj')
  const [password, setPassword] = useState('FF888999')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  // Already logged in, redirect
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard')
    }
  }, [admin, navigate])

  const handleLogin = async () => {
    if (!username || !password) {
      setError('请填写完整信息')
      return
    }
    try {
      const ok = await adminLogin(username, password)
      if (ok) {
        navigate('/admin/dashboard')
      } else {
        setError('账号或密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#003366] via-[#004080] to-[#001a33]">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <img src="/logo_new.png" alt="" className="w-16 h-16 mx-auto" />
          <h1 className="text-white text-xl font-bold mt-4">后台管理系统</h1>
          <p className="text-white/50 text-sm mt-1">超级管理员登录</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="管理员账号"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm outline-none placeholder:text-white/40 focus:border-white/40"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="密码"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm outline-none placeholder:text-white/40 focus:border-white/40"
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-[#F5A623] text-white rounded-xl font-semibold hover:bg-[#e09516] transition-colors active:scale-[0.98]"
          >
            登录
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">© 2026 香港交易所 后台管理系统</p>
      </div>
    </div>
  )
}
