import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { trpc } from '@/providers/trpc'
import { Eye, EyeOff, Phone, Lock } from 'lucide-react'

const letterWall = [
  { char: 'H', delay: 0.0 },
  { char: 'K', delay: 0.1 },
  { char: 'E', delay: 0.2 },
  { char: 'X', delay: 0.3 },
]

export default function Login() {
  const navigate = useNavigate()
  const { setUserFromApi } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [letterIndex, setLetterIndex] = useState(-1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      setLoading(false)
      setUserFromApi(data)
      localStorage.setItem('user_token', 'token_' + Date.now())
      localStorage.setItem('user_phone', data.phone)
      navigate('/index')
    },
    onError: (err) => {
      setLoading(false)
      // 中文错误提示
      if (err.message?.includes('not found') || err.message?.includes('不存在')) {
        setError('该手机号未注册，请先注册账号')
      } else if (err.message?.includes('password') || err.message?.includes('密码')) {
        setError('密码错误，请重新输入')
      } else {
        setError(err.message || '登录失败，请重试')
      }
    },
  })

  useEffect(() => {
    letterWall.forEach((_, i) => {
      setTimeout(() => setLetterIndex(i), i * 200 + 200)
    })
  }, [])

  const handleLogin = () => {
    setError('')
    if (!phone || !password) {
      setError('请填写手机号和密码')
      return
    }
    setLoading(true)
    loginMutation.mutate({ phone, password })
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#003366]/5 to-transparent">
      <div className="w-full max-w-sm">
        {/* HKEX字母墙Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {letterWall.map((l, i) => (
              <div
                key={l.char}
                className={`relative flex items-center justify-center w-[48px] h-[64px] font-black text-4xl transition-all duration-500 ${
                  i <= letterIndex ? 'text-[#003366] scale-100 opacity-100' : 'text-[#003366]/10 scale-90 opacity-30'
                }`}
                style={{ transitionDelay: `${l.delay}s` }}
              >
                <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${
                  i <= letterIndex ? 'border-[#003366]/20 bg-[#003366]/3' : 'border-transparent'
                }`} />
                <div className={`absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 transition-all duration-500 ${
                  i <= letterIndex ? 'border-[#F5A623]' : 'border-transparent'
                }`} />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 transition-all duration-500 ${
                  i <= letterIndex ? 'border-[#F5A623]' : 'border-transparent'
                }`} />
                {l.char}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold mt-2">香港交易所</h1>
          <p className="text-muted-foreground mt-1">欢迎回来</p>
        </div>

        <div className="space-y-4">
          {/* 手机号 */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError('') }}
              placeholder="请输入手机号"
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30"
            />
          </div>

          {/* 密码 */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="请输入密码"
              className="w-full pl-10 pr-10 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30"
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="text-red-600">{error}</p>
              {error.includes('未注册') && (
                <button onClick={() => navigate('/register')} className="text-[#003366] font-medium mt-1 underline">
                  去注册账号 →
                </button>
              )}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#003366] text-white rounded-xl font-semibold hover:bg-[#002244] transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <button onClick={() => navigate('/service')} className="text-[#003366]">忘记密码？</button>
          <Link to="/register" className="text-[#003366] font-medium">立即注册</Link>
        </div>
      </div>
    </div>
  )
}
