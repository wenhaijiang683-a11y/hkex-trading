import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Clock, Building2, Plus } from 'lucide-react'
import { getWithdrawRecords, saveWithdrawRecord, getBankCards } from '../../utils/userData'
import type { WithdrawRecord, BankCard } from '../../utils/userData'

export default function Withdraw() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [card, setCard] = useState(0)
  const [records, setRecords] = useState<WithdrawRecord[]>([])
  const [cards, setCards] = useState<BankCard[]>([])

  const createWithdraw = trpc.finance.createWithdraw.useMutation()

  useEffect(() => {
    setRecords(getWithdrawRecords())
    setCards(getBankCards())
  }, [])

  const isServiceTime = useMemo(() => {
    const h = new Date().getHours()
    return h >= 9 && h < 22
  }, [])

  const handleWithdraw = () => {
    if (!amount) { alert('请输入提现金额'); return }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) { alert('请输入有效金额'); return }
    if (numAmount > (user?.balance || 0)) { alert('提现金额不能超过可用余额'); return }
    if (cards.length === 0) { alert('请先绑定银行卡'); navigate('/user/bank'); return }
    
    const selectedCard = cards[card] || cards[0]
    
    if (user?.id) {
      createWithdraw.mutate({
        userId: Number(user.id),
        amount: numAmount,
        bank: selectedCard.bank + ' ' + selectedCard.cardNo,
      }, {
        onSuccess: () => {
          updateUser({ balance: (user?.balance || 0) - numAmount })
          saveWithdrawRecord({
            amount: numAmount,
            bank: selectedCard.bank + ' ' + selectedCard.cardNo,
            status: '审核中',
            time: new Date().toLocaleString(),
            userPhone: user?.phone,
          })
          setRecords(getWithdrawRecords())
          alert('提现申请已提交')
          setAmount('')
        },
        onError: (err) => alert(err.message),
      })
    } else {
      updateUser({ balance: (user?.balance || 0) - numAmount })
      saveWithdrawRecord({
        amount: numAmount,
        bank: selectedCard.bank + ' ' + selectedCard.cardNo,
        status: '审核中',
        time: new Date().toLocaleString(),
        userPhone: user?.phone,
      })
      setRecords(getWithdrawRecords())
      alert('提现申请已提交')
      setAmount('')
    }
  }

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">提现</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {!isServiceTime && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">提现服务时间 09:00-22:00</p>
              <p className="text-xs text-amber-600 mt-0.5">当前为非服务时间</p>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">可用余额: <span className="font-semibold text-foreground">¥{user?.balance.toLocaleString() || '0'}</span></p>

        {/* Card Selection - 从localStorage读取用户绑定的银行卡 */}
        <div>
          <label className="text-sm font-medium">选择提现银行卡</label>
          <div className="space-y-2 mt-2">
            {cards.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">未绑定银行卡</p>
                <button onClick={() => navigate('/user/bank')} className="text-xs text-[#003366] mt-1 flex items-center gap-1 mx-auto">
                  <Plus className="w-3 h-3" /> 去绑定银行卡
                </button>
              </div>
            ) : (
              cards.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setCard(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    card === i ? 'border-[#003366] bg-[#003366]/5' : 'border-muted'
                  } ${!isServiceTime ? 'opacity-50' : ''}`}
                  disabled={!isServiceTime}
                >
                  <div className="w-10 h-10 bg-[#003366]/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#003366]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm">{c.bank}</p>
                    <p className="text-xs text-muted-foreground">{c.cardNo}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${card === i ? 'border-[#003366]' : 'border-muted'}`}>
                    {card === i && <div className="w-2.5 h-2.5 bg-[#003366] rounded-full" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium">提现金额</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold">¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="请输入提现金额"
              disabled={!isServiceTime}
              className="w-full pl-8 pr-4 py-3 bg-muted rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-[#003366]/30 disabled:opacity-50"
            />
          </div>
          <button onClick={() => setAmount(user?.balance.toString() || '')} className="text-xs text-[#003366] mt-1">
            全部提现
          </button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>预计到账: 1-3个工作日</p>
          <p>手续费: 0（限时免费）</p>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!isServiceTime || cards.length === 0}
          className="w-full py-3 bg-[#003366] text-white rounded-xl font-semibold disabled:opacity-50"
        >
          提交提现申请
        </button>

        {/* Records - 从localStorage读取 */}
        <div>
          <h3 className="font-semibold mb-2">提现记录</h3>
          {records.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-xl">
              <p>暂无提现记录</p>
              <p className="text-xs mt-1">提现后将自动显示在此处</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map(r => (
                <div key={r.id} className="bg-card border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">¥{r.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{r.bank} · {r.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === '已放款' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
