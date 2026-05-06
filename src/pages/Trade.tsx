import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react'

const DURATIONS = [
  { min: 5, percent: 3 },
  { min: 10, percent: 6 },
  { min: 15, percent: 9 },
  { min: 20, percent: 12 },
  { min: 30, percent: 18 },
  { min: 60, percent: 36 },
]

export default function Trade() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [durationIdx, setDurationIdx] = useState(0) // 默认5分钟
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const stocksQuery = trpc.stock.list.useQuery()
  const ordersQuery = trpc.trade.getUserOrders.useQuery(
    { userId: Number(user?.id) || 0 },
    { enabled: !!user?.id }
  )

  const { min: duration, percent } = DURATIONS[durationIdx]
  const numAmount = parseFloat(amount) || 0
  const profitEstimate = Math.round(numAmount * percent / 100)

  const createOrder = trpc.trade.createOrder.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message)
      setAmount('')
      ordersQuery.refetch()
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => {
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    },
  })

  const handleSubmit = () => {
    setError('')
    if (!selectedStock) { setError('请选择交易品种'); return }
    if (!amount || numAmount <= 0) { setError('请输入交易金额'); return }
    if (!user?.id) { setError('请先登录'); return }

    createOrder.mutate({
      userId: Number(user.id),
      stockCode: selectedStock.code,
      stockName: selectedStock.name,
      amount: numAmount,
      duration,
      percent,
      direction,
    })
  }

  const allStocks = stocksQuery.data || []
  const runningOrders = (ordersQuery.data || []).filter((o: any) => o.status === 'running')
  const closedOrders = (ordersQuery.data || []).filter((o: any) => o.status === 'closed')

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">模拟交易</h1>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {/* 余额 */}
        <div className="bg-gradient-to-br from-[#003366] to-[#004080] rounded-2xl p-4 text-white">
          <p className="text-white/60 text-xs">可用余额</p>
          <p className="text-2xl font-bold">¥{(user?.balance || 0).toLocaleString()}</p>
        </div>

        {/* 选择品种 */}
        <div>
          <label className="text-sm font-medium mb-2 block">选择交易品种</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allStocks.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedStock(s)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedStock?.id === s.id
                    ? 'bg-[#003366] text-white'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                {s.name}
                <span className="block text-xs opacity-80">{s.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 买涨/买跌 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDirection('up')}
            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all ${
              direction === 'up' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 border border-red-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 买涨
          </button>
          <button
            onClick={() => setDirection('down')}
            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all ${
              direction === 'down' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-500 border border-green-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" /> 买跌
          </button>
        </div>

        {/* 金额 */}
        <div>
          <label className="text-sm font-medium mb-2 block">交易金额 (¥)</label>
          <input
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError('') }}
            placeholder="输入金额"
            className="w-full px-4 py-3 bg-muted rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#003366]/30"
          />
          <div className="flex gap-2 mt-2">
            {['100', '500', '1000', '5000', '10000'].map(a => (
              <button key={a} onClick={() => setAmount(a)}
                className="flex-1 py-2 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-[#003366]/10">
                ¥{a}
              </button>
            ))}
          </div>
        </div>

        {/* 时间选择 */}
        <div>
          <label className="text-sm font-medium mb-2 block">自动平仓时间</label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d, idx) => (
              <button
                key={d.min}
                onClick={() => setDurationIdx(idx)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  durationIdx === idx ? 'bg-[#003366] text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <div>{d.min}分钟</div>
                <div className="text-xs opacity-80">盈亏{d.percent}%</div>
              </button>
            ))}
          </div>
        </div>

        {/* 预计盈亏 */}
        {numAmount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-sm text-amber-800">预计盈亏</h4>
            <p className="text-xs text-amber-600 mt-1">
              本金 ¥{numAmount.toLocaleString()} × {direction === 'up' ? '买涨' : '买跌'} × {duration}分钟({percent}%)
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center py-2 bg-red-100 rounded-lg">
                <p className="text-xs text-red-600">盈利</p>
                <p className="font-bold text-red-600">+¥{profitEstimate.toLocaleString()}</p>
              </div>
              <div className="text-center py-2 bg-green-100 rounded-lg">
                <p className="text-xs text-green-600">亏损</p>
                <p className="font-bold text-green-600">-¥{profitEstimate.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* 错误/成功提示 */}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">{success}</div>}

        {/* 下单按钮 */}
        <button
          onClick={handleSubmit}
          disabled={createOrder.isPending}
          className={`w-full py-4 text-white rounded-xl font-bold text-lg transition-all ${
            direction === 'up' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {createOrder.isPending ? '下单中...' : `${direction === 'up' ? '买涨' : '买跌'} ¥${numAmount.toLocaleString()}`}
        </button>

        {/* 运行中订单 */}
        {runningOrders.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">运行中 ({runningOrders.length})</h3>
            <div className="space-y-2">
              {runningOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* 已平仓订单 */}
        {closedOrders.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">已平仓 ({closedOrders.length})</h3>
            <div className="space-y-2">
              {closedOrders.slice(0, 10).map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 订单卡片组件
function OrderCard({ order }: { order: any }) {
  const isWin = order.result === 'win'
  const isRunning = order.status === 'running'

  return (
    <div className={`border rounded-xl p-3 ${
      isRunning ? 'bg-blue-50 border-blue-200' :
      isWin ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{order.stockName}</p>
          <p className="text-xs text-muted-foreground">
            {isRunning ? (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 持仓中 {order.duration}分钟</span>
            ) : (
              <span>{isWin ? '✓ 盈利' : '✗ 亏损'} ¥{Math.abs(order.profit || 0).toLocaleString()}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">¥{order.amount?.toLocaleString()}</p>
          {isRunning ? (
            <p className="text-xs text-blue-600">等待平仓</p>
          ) : (
            <p className={`text-xs font-medium ${isWin ? 'text-red-600' : 'text-green-600'}`}>
              {isWin ? '+' : '-'}{(order.percent || 0)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
