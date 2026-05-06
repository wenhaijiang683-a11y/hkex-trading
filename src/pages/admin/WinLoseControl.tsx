import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, TrendingUp, TrendingDown, Shuffle, Users, Clock, AlertTriangle } from 'lucide-react'
import { addAdminLog } from './AdminLogs'

export default function WinLoseControl() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'random' | 'win' | 'lose'>('random')

  const modeQuery = trpc.trade.getGlobalMode.useQuery()
  const setModeMutation = trpc.trade.setGlobalMode.useMutation()
  const ordersQuery = trpc.trade.getAllOrders.useQuery()
  const usersQuery = trpc.user.getAll.useQuery()
  const autoCloseMutation = trpc.trade.autoCloseOrders.useMutation()
  const closeOrderMutation = trpc.trade.closeOrder.useMutation()

  const allOrders = ordersQuery.data || []
  const allUsers = usersQuery.data || []
  const runningOrders = allOrders.filter((o: any) => o.status === 'running')
  const closedOrders = allOrders.filter((o: any) => o.status === 'closed')

  // 同步后台模式
  useEffect(() => {
    if (modeQuery.data) {
      setMode(modeQuery.data.mode as any)
    }
  }, [modeQuery.data])

  // 定时自动平仓 + 刷新（每10秒）
  useEffect(() => {
    const timer = setInterval(() => {
      autoCloseMutation.mutate(undefined, {
        onSuccess: () => {
          ordersQuery.refetch()
          usersQuery.refetch()
        }
      })
    }, 10000)
    return () => clearInterval(timer)
  }, [autoCloseMutation, ordersQuery, usersQuery])

  // 切换全局模式
  const handleSetMode = (newMode: 'random' | 'win' | 'lose') => {
    setModeMutation.mutate({ mode: newMode }, {
      onSuccess: () => {
        setMode(newMode)
        addAdminLog(`切换全局模式: ${newMode === 'win' ? '全局赢' : newMode === 'lose' ? '全局输' : '随机'}`, '-', '盈亏控制')
        modeQuery.refetch()
      }
    })
  }

  // 手动平仓单个订单
  const handleForceClose = (orderId: number, result: 'win' | 'lose') => {
    closeOrderMutation.mutate({ id: orderId, result }, {
      onSuccess: (data) => {
        ordersQuery.refetch()
        usersQuery.refetch()
        const type = result === 'win' ? '盈利' : '亏损'
        alert(`订单#${orderId} 已强制${type} ¥${Math.abs(data.profit).toLocaleString()}`)
        addAdminLog(`手动平仓订单#${orderId}: ${type}`, `订单#${orderId}`, '盈亏控制')
      },
      onError: (err) => alert(err.message)
    })
  }

  // 获取用户名称
  const getUserName = (userId: number) => {
    const u = allUsers.find((user: any) => user.dbId === userId)
    return u ? `${u.name} (${u.phone})` : `用户#${userId}`
  }

  const modeLabels: Record<string, { label: string; color: string; desc: string }> = {
    win: { label: '全局赢模式', color: 'text-red-600 bg-red-50 border-red-300', desc: '所有到期订单自动盈利' },
    lose: { label: '全局输模式', color: 'text-green-600 bg-green-50 border-green-300', desc: '所有到期订单自动亏损' },
    random: { label: '随机模式', color: 'text-amber-600 bg-amber-50 border-amber-300', desc: '到期订单随机赢或亏' },
  }

  const current = modeLabels[mode] || modeLabels.random

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">盈亏控制台</h1>
        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">● 实时监控</span>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4 pb-8">

        {/* 当前模式 */}
        <div className={`border-2 rounded-xl p-4 ${current.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70">当前模式</p>
              <p className="text-lg font-bold">{current.label}</p>
              <p className="text-xs opacity-70">{current.desc}</p>
            </div>
            {mode === 'win' && <TrendingUp className="w-10 h-10 text-red-500" />}
            {mode === 'lose' && <TrendingDown className="w-10 h-10 text-green-500" />}
            {mode === 'random' && <Shuffle className="w-10 h-10 text-amber-500" />}
          </div>
        </div>

        {/* 模式切换 */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSetMode('win')}
            className={`py-4 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all ${mode === 'win' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-50 text-red-500 border border-red-200'}`}>
            <TrendingUp className="w-6 h-6" /><span>全局赢</span><span className="text-xs opacity-80">所有单赢</span>
          </button>
          <button onClick={() => handleSetMode('lose')}
            className={`py-4 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all ${mode === 'lose' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-50 text-green-500 border border-green-200'}`}>
            <TrendingDown className="w-6 h-6" /><span>全局输</span><span className="text-xs opacity-80">所有单亏</span>
          </button>
          <button onClick={() => handleSetMode('random')}
            className={`py-4 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all ${mode === 'random' ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
            <Shuffle className="w-6 h-6" /><span>随机</span><span className="text-xs opacity-80">随机赢亏</span>
          </button>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">持仓中</p>
            <p className="text-xl font-bold text-blue-600">{runningOrders.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">已盈利</p>
            <p className="text-xl font-bold text-red-600">{closedOrders.filter((o: any) => o.result === 'win').length}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">已亏损</p>
            <p className="text-xl font-bold text-green-600">{closedOrders.filter((o: any) => o.result === 'lose').length}</p>
          </div>
        </div>

        {/* 用户订单列表 */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">用户订单实时监控 ({runningOrders.length}单持仓)</h3>
          </div>

          {runningOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">暂无持仓订单</div>
          ) : (
            <div className="divide-y">
              {runningOrders.map((order: any) => (
                <div key={order.id} className="px-4 py-3 hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">#{order.id}</span>
                        <p className="font-medium text-sm">{order.stockName}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${order.direction === 'up' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {order.direction === 'up' ? '买涨' : '买跌'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getUserName(order.userId)} · 本金¥{order.amount?.toLocaleString()} · {order.duration}分钟({order.percent}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        预计盈亏: ±¥{Math.round(order.amount * order.percent / 100).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => handleForceClose(order.id, 'win')}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
                        赢
                      </button>
                      <button onClick={() => handleForceClose(order.id, 'lose')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                        亏
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 已平仓记录 */}
        {closedOrders.length > 0 && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-muted border-b flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <h3 className="font-semibold text-sm">已平仓记录 ({closedOrders.length})</h3>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {closedOrders.slice(0, 20).map((order: any) => (
                <div key={order.id} className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{order.stockName} · {getUserName(order.userId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.direction === 'up' ? '买涨' : '买跌'} · ¥{order.amount?.toLocaleString()} · {order.duration}分钟
                    </p>
                  </div>
                  <p className={`font-bold ${(order.profit || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {(order.profit || 0) >= 0 ? '+' : ''}¥{(order.profit || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">使用说明</p>
            <p className="text-xs text-amber-700 mt-1">
              全局赢/输：所有到期订单自动按模式结算。<br/>
              随机模式：到期订单随机赢或亏。<br/>
              单独控制：每个订单右侧有"赢"/"亏"按钮，可立即强制平仓。<br/>
              页面每10秒自动刷新，新下单会实时显示。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
