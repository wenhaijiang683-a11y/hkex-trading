import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { trpc } from '@/providers/trpc'
import { Eye, EyeOff, Phone, Lock, User, Shield, TrendingUp, BookOpen, CircleDollarSign } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { setUserFromApi } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registerMutation = trpc.user.register.useMutation({
    onSuccess: (data) => {
      setLoading(false)
      // 注册成功后自动登录
      setUserFromApi({
        id: data.id,
        name: data.name,
        phone: data.phone,
        balance: 0,
        holdValue: 0,
        frozen: 0,
        totalProfit: 0,
        todayProfit: 0,
        points: 0,
        isRealName: false,
        isBankBound: false,
        realNameSubmitted: false,
      })
      localStorage.setItem('user_token', 'token_' + Date.now())
      localStorage.setItem('user_phone', data.phone)
      navigate('/index')
    },
    onError: (err) => {
      setLoading(false)
      if (err.message?.includes('already') || err.message?.includes('已注册') || err.message?.includes('unique')) {
        setError('该手机号已注册，请直接登录')
      } else {
        setError(err.message || '注册失败，请重试')
      }
    },
  })

  const handleRegister = () => {
    setError('')
    if (!phone || !password || !name) { setError('请填写完整信息'); return }
    if (password !== confirmPw) { setError('两次密码不一致'); return }
    if (password.length < 6) { setError('密码至少6位'); return }
    if (!agreed) { setError('请同意服务协议'); return }
    setLoading(true)
    registerMutation.mutate({ name, phone, password })
  }

  const features = [
    { icon: TrendingUp, title: '实时行情', desc: '港股、沪深、美股全覆盖' },
    { icon: CircleDollarSign, title: '模拟交易', desc: '零风险练习投资技巧' },
    { icon: BookOpen, title: '投资学堂', desc: '从入门到精通的投资课程' },
    { icon: Shield, title: '安全可靠', desc: '香港证监会持牌法团监管' },
  ]

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#003366]/5 to-transparent">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <img src="/logo_new.png" alt="HKEX" className="w-16 h-16 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">香港交易所</h1>
          <p className="text-muted-foreground text-sm mt-1">HKEX Trading Center</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map(f => (
            <div key={f.title} className="bg-card border rounded-xl p-3 text-center">
              <f.icon className="w-6 h-6 text-[#003366] mx-auto" />
              <p className="text-sm font-semibold mt-2">{f.title}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-center mb-1">注册账户</h2>
          <p className="text-xs text-muted-foreground text-center mb-5">欢迎加入香港交易所</p>

          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError('') }} placeholder="请输入手机号"
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="设置昵称"
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="设置密码（6-20位）"
                className="w-full pl-10 pr-10 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError('') }} placeholder="确认密码"
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
              <span>我已阅读并同意《用户服务协议》和《隐私政策》</span>
            </label>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p className="text-red-600">{error}</p>
                {error.includes('已注册') && (
                  <button onClick={() => navigate('/login')} className="text-[#003366] font-medium mt-1 underline">
                    去登录 →
                  </button>
                )}
              </div>
            )}

            <button onClick={handleRegister} disabled={loading}
              className="w-full py-3 bg-[#003366] text-white rounded-xl font-semibold hover:bg-[#002244] transition-colors disabled:opacity-50">
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm">
          <span className="text-muted-foreground">已有账号？</span>
          <Link to="/login" className="text-[#003366] font-medium ml-1">去登录</Link>
        </div>
      </div>
    </div>
  )
}
