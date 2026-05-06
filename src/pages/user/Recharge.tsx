import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Clock, CheckCircle, Building2 } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { getRechargeRecords, saveRechargeRecord, getBankCards } from '../../utils/userData'
import type { RechargeRecord, BankCard } from '../../utils/userData'

const payMethods = [
  { id: 'bank', name: '银行卡转账', icon: '💳', color: 'bg-gradient-to-r from-blue-600 to-blue-800', desc: '支持国内各大银行' },
  { id: 'usdt', name: 'USDT', icon: '₮', color: 'bg-gradient-to-r from-teal-500 to-teal-700', desc: 'TRC20/BEP20网络' },
  { id: 'alipay', name: '支付宝', icon: '支', color: 'bg-gradient-to-r from-blue-400 to-blue-600', desc: '扫码转账' },
  { id: 'wechat', name: '微信支付', icon: '微', color: 'bg-gradient-to-r from-green-500 to-green-700', desc: '扫码转账' },
]

export default function Recharge() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [custom, setCustom] = useState('')
  const [method, setMethod] = useState('bank')
  const [bankSource, setBankSource] = useState<'bound' | 'other'>('bound')
  const [selectedBoundCard, setSelectedBoundCard] = useState(0)
  const [otherBankName, setOtherBankName] = useState('')
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [cards, setCards] = useState<BankCard[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const amounts = ['5000', '10000', '50000', '100000']

  const createRecharge = trpc.finance.createRecharge.useMutation()

  useEffect(() => {
    setRecords(getRechargeRecords())
    setCards(getBankCards())
  }, [])

  const isServiceTime = useMemo(() => {
    const h = new Date().getHours()
    return h >= 9 && h < 22
  }, [])

  const selectedAmount = amount || custom

  const handleRecharge = () => {
    if (!selectedAmount) { alert('请选择充值金额'); return }
    const numAmount = parseFloat(selectedAmount)
    if (isNaN(numAmount) || numAmount <= 0) { alert('请输入有效金额'); return }

    const methodName = payMethods.find(m => m.id === method)?.name || method

    // 构建银行卡详细信息
    let cardDetail = ''
    if (method === 'bank') {
      if (bankSource === 'bound' && cards.length > 0) {
        const card = cards[selectedBoundCard]
        cardDetail = `（使用已绑定银行卡：${card.bank} ${card.cardNo}）`
      } else if (bankSource === 'other') {
        if (!otherBankName) { alert('请选择或输入转账银行'); return }
        cardDetail = `（使用其他银行卡：${otherBankName}）`
      }
    }

    // 先保存到后端数据库
    if (user?.id) {
      createRecharge.mutate({
        userId: Number(user.id),
        amount: numAmount,
        method: methodName + cardDetail,
      }, {
        onSuccess: () => {
          // 同时保存到localStorage兼容
          saveRechargeRecord({
            amount: numAmount,
            method: methodName + cardDetail,
            status: '审核中',
            time: new Date().toLocaleString(),
            userPhone: user?.phone,
          })
          setShowSuccess(true)
          setRecords(getRechargeRecords())
        },
        onError: (err) => {
          alert(err.message)
        },
      })
    } else {
      // 无用户ID时只存localStorage
      saveRechargeRecord({
        amount: numAmount,
        method: methodName + cardDetail,
        status: '审核中',
        time: new Date().toLocaleString(),
        userPhone: user?.phone,
      })
      setShowSuccess(true)
      setRecords(getRechargeRecords())
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    navigate('/service')
  }

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">充值</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {/* Time Warning - 醒目提示 */}
        {!isServiceTime && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <Clock className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">非服务时间</p>
              <p className="text-xs text-red-600 mt-1">充值服务时间为每日 09:00-22:00，当前时间无法提交充值申请，请在服务时间内操作。</p>
            </div>
          </div>
        )}

        {/* Balance */}
        <div className="bg-gradient-to-r from-[#003366] to-[#004080] rounded-xl p-4 text-white">
          <p className="text-white/60 text-sm">账户余额</p>
          <p className="text-2xl font-bold mt-1">¥{user?.balance.toLocaleString() || '0'}</p>
        </div>

        {/* Amount Selection */}
        <div>
          <label className="text-sm font-medium">选择充值金额</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {amounts.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustom('') }}
                disabled={!isServiceTime}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  amount === a ? 'bg-[#003366] text-white shadow-lg' : 'bg-muted hover:bg-[#003366]/10'
                } ${!isServiceTime ? 'opacity-40' : ''}`}>
                ¥{parseInt(a).toLocaleString()}
              </button>
            ))}
          </div>
          <input type="number" value={custom} onChange={e => { setCustom(e.target.value); setAmount('') }}
            placeholder="自定义金额" disabled={!isServiceTime}
            className="w-full mt-2 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#003366]/30 disabled:opacity-40" />
        </div>

        {/* Payment Methods - 4 options */}
        <div>
          <label className="text-sm font-medium">选择支付方式</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {payMethods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                disabled={!isServiceTime}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  method === m.id ? 'border-[#003366] bg-[#003366]/5 shadow-md' : 'border-muted hover:border-gray-300'
                } ${!isServiceTime ? 'opacity-40' : ''}`}>
                <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white text-lg font-bold mb-2`}>
                  {m.icon}
                </div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                {method === m.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#003366] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Card Sub-options - 当选择银行卡转账时显示 */}
        {method === 'bank' && (
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <label className="text-sm font-medium flex items-center gap-1">
              <Building2 className="w-4 h-4 text-[#003366]" /> 选择转账银行卡
            </label>

            {/* Option 1: Use bound card */}
            <button
              onClick={() => setBankSource('bound')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                bankSource === 'bound' ? 'border-[#003366] bg-[#003366]/5' : 'border-muted'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${bankSource === 'bound' ? 'border-[#003366]' : 'border-muted'}`}>
                {bankSource === 'bound' && <div className="w-2.5 h-2.5 bg-[#003366] rounded-full" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">使用已绑定银行卡</p>
                <p className="text-xs text-muted-foreground">选择您已绑定的银行卡进行转账</p>
              </div>
            </button>

            {/* Show bound cards list */}
            {bankSource === 'bound' && (
              <div className="ml-8 space-y-2">
                {cards.length === 0 ? (
                  <div className="text-center py-3 text-muted-foreground text-sm border border-dashed rounded-lg">
                    <p>未绑定银行卡</p>
                    <button onClick={() => navigate('/user/bank')} className="text-xs text-[#003366] mt-1">去绑定银行卡</button>
                  </div>
                ) : (
                  cards.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedBoundCard(i)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
                        selectedBoundCard === i ? 'bg-[#003366]/10 border border-[#003366]/30' : 'bg-muted border border-transparent'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#003366]" />
                      <span className="text-sm">{c.bank}</span>
                      <span className="text-xs text-muted-foreground font-mono">{c.cardNo}</span>
                      {selectedBoundCard === i && <CheckCircle className="w-4 h-4 text-[#003366] ml-auto" />}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Option 2: Use other card */}
            <button
              onClick={() => setBankSource('other')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                bankSource === 'other' ? 'border-[#003366] bg-[#003366]/5' : 'border-muted'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${bankSource === 'other' ? 'border-[#003366]' : 'border-muted'}`}>
                {bankSource === 'other' && <div className="w-2.5 h-2.5 bg-[#003366] rounded-full" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">使用其他银行卡</p>
                <p className="text-xs text-muted-foreground">使用未绑定的其他银行卡转账</p>
              </div>
            </button>

            {bankSource === 'other' && (
              <div className="ml-8">
                <select
                  value={otherBankName}
                  onChange={e => setOtherBankName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
                >
                  <option value="">请选择开户行</option>
                  <option value="中国银行">中国银行</option>
                  <option value="工商银行">工商银行</option>
                  <option value="建设银行">建设银行</option>
                  <option value="农业银行">农业银行</option>
                  <option value="招商银行">招商银行</option>
                  <option value="交通银行">交通银行</option>
                  <option value="邮储银行">邮储银行</option>
                  <option value="平安银行">平安银行</option>
                  <option value="浦发银行">浦发银行</option>
                  <option value="光大银行">光大银行</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleRecharge} disabled={!isServiceTime}
          className="w-full py-3.5 bg-[#003366] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#002855] transition-colors shadow-lg">
          确定
        </button>

        {/* Records */}
        <div>
          <h3 className="font-semibold mb-2">充值记录</h3>
          {records.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-xl">
              <p>暂无充值记录</p>
              <p className="text-xs mt-1">充值后将自动显示在此处</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map(r => (
                <div key={r.id} className="bg-card border rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm">
                      {r.method === '微信支付' ? '💚' : r.method === '支付宝' ? '🔵' : r.method === 'USDT' ? '₮' : '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">¥{r.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.method}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === '已到账' ? 'bg-green-100 text-green-700' :
                    r.status === '审核中' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal - 只显示完成文字，居中 */}
      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-8 w-full max-w-[280px] animate-scale-in flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-center">完成</p>
            <p className="text-xs text-muted-foreground text-center mt-2">已发送充值申请给客服</p>
            <button onClick={handleCloseSuccess}
              className="w-full mt-4 py-2.5 bg-[#003366] text-white rounded-xl text-sm font-medium">
              前往客服对话
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
