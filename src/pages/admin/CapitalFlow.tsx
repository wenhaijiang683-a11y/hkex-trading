import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, RefreshCw, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export default function AdminCapitalFlow() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all') // all, recharge, withdraw, profit

  const rechargesQuery = trpc.finance.getAllRecharges.useQuery()
  const withdrawsQuery = trpc.finance.getAllWithdraws.useQuery()

  // 合并所有流水记录
  const allFlows: any[] = []

  if (rechargesQuery.data) {
    rechargesQuery.data.forEach((r: any) => {
      allFlows.push({
        id: `R${r.id}`,
        type: 'recharge',
        typeLabel: '充值',
        amount: Number(r.amount),
        detail: r.method,
        status: r.status === 'pending' ? '审核中' : r.status === 'approved' ? '已到账' : '已驳回',
        statusColor: r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-amber-600',
        time: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
        userId: r.userId,
      })
    })
  }

  if (withdrawsQuery.data) {
    withdrawsQuery.data.forEach((w: any) => {
      allFlows.push({
        id: `W${w.id}`,
        type: 'withdraw',
        typeLabel: '提现',
        amount: Number(w.amount),
        detail: w.bank,
        status: w.status === 'pending' ? '审核中' : w.status === 'approved' ? '已放款' : '已驳回',
        statusColor: w.status === 'approved' ? 'text-green-600' : w.status === 'rejected' ? 'text-red-600' : 'text-amber-600',
        time: w.createdAt ? new Date(w.createdAt).toLocaleString() : '-',
        userId: w.userId,
      })
    })
  }

  // 添加盈亏操作记录
  const profitLossRecords = JSON.parse(localStorage.getItem('admin_profit_loss_records') || '[]')
  profitLossRecords.forEach((r: any) => {
    allFlows.push({
      id: `P${r.id}`,
      type: r.type === '盈利' ? 'profit' : 'loss',
      typeLabel: r.type,
      amount: r.amount,
      detail: r.reason,
      status: '已完成',
      statusColor: r.type === '盈利' ? 'text-green-600' : 'text-red-600',
      time: r.time,
      userId: r.userId,
    })
  })

  // 按时间倒序
  allFlows.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const filtered = filter === 'all' ? allFlows : allFlows.filter(f => {
    if (filter === 'recharge') return f.type === 'recharge'
    if (filter === 'withdraw') return f.type === 'withdraw'
    if (filter === 'profit') return f.type === 'profit' || f.type === 'loss'
    return true
  })

  const totalRecharge = allFlows.filter(f => f.type === 'recharge' && f.status === '已到账').reduce((s, f) => s + f.amount, 0)
  const totalWithdraw = allFlows.filter(f => f.type === 'withdraw' && f.status === '已放款').reduce((s, f) => s + f.amount, 0)
  const totalProfit = allFlows.filter(f => f.type === 'profit').reduce((s, f) => s + f.amount, 0)
  const totalLoss = allFlows.filter(f => f.type === 'loss').reduce((s, f) => s + f.amount, 0)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">资金流水</h1>
        <button onClick={() => { rechargesQuery.refetch(); withdrawsQuery.refetch() }}
          className="ml-auto p-1.5 hover:bg-white/10 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总充值</p>
            <p className="text-lg font-bold text-green-600">¥{totalRecharge.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总提现</p>
            <p className="text-lg font-bold text-red-600">¥{totalWithdraw.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总盈利派送</p>
            <p className="text-lg font-bold text-blue-600">¥{totalProfit.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总亏损扣除</p>
            <p className="text-lg font-bold text-orange-600">¥{totalLoss.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'recharge', label: '充值' },
            { key: 'withdraw', label: '提现' },
            { key: 'profit', label: '盈亏调控' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${filter === f.key ? 'bg-[#003366] text-white' : 'bg-card border text-muted-foreground'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Flow List */}
        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无资金流水</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((f: any) => (
              <div key={f.id} className="bg-card border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    f.type === 'recharge' ? 'bg-green-100' : f.type === 'withdraw' ? 'bg-red-100' : f.type === 'profit' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {f.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> :
                     f.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5 text-red-600" /> :
                     f.type === 'profit' ? <DollarSign className="w-5 h-5 text-blue-600" /> :
                     <DollarSign className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{f.typeLabel}</p>
                    <p className="text-xs text-muted-foreground">{f.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${f.type === 'recharge' || f.type === 'profit' ? 'text-green-600' : 'text-red-600'}`}>
                    {f.type === 'recharge' || f.type === 'profit' ? '+' : '-'}¥{f.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${f.statusColor}`}>{f.status}</p>
                  <p className="text-xs text-muted-foreground">{f.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
