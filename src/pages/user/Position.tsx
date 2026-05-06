import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, TrendingUp, TrendingDown, } from 'lucide-react'

interface Position {
  id: number
  stockCode: string
  stockName: string
  quantity: number
  costPrice: number
  currentPrice: number
  profit: number
  profitPercent: number
}

export default function Position() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('持仓中')
  const [positions, setPositions] = useState<Position[]>([])
  const [action, setAction] = useState<{ type: string; pos: Position } | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_positions')
      if (saved) setPositions(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">请先登录</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-[#003366] text-white rounded-lg">去登录</button>
      </div>
    )
  }

  const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0)

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">持仓管理</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {/* Summary */}
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">总持仓市值</p>
          <p className="text-xl font-bold">¥{totalValue.toLocaleString()}</p>
          <div className={`flex items-center gap-1 mt-1 text-sm ${totalProfit >= 0 ? 'text-up' : 'text-down'}`}>
            {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>今日盈亏 {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['持仓中', '已平仓'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Position List */}
        {tab === '持仓中' && (
          <>
            {positions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-xl">
                <p className="text-sm">暂无持仓</p>
                <p className="text-xs mt-1">买入股票后将自动显示在此处</p>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map(pos => (
                  <div key={pos.id} className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{pos.stockName}</p>
                        <p className="text-xs text-muted-foreground">{pos.stockCode}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${pos.profit >= 0 ? 'text-up' : 'text-down'}`}>
                          {pos.profit >= 0 ? '+' : ''}¥{pos.profit}
                        </p>
                        <p className="text-xs text-muted-foreground">{pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                      <span>持仓: {pos.quantity}股</span>
                      <span>成本: ¥{pos.costPrice.toFixed(2)}</span>
                      <span>现价: ¥{pos.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setAction({ type: 'add', pos })} className="flex-1 py-2 bg-[#003366] text-white rounded-lg text-xs font-medium">加仓</button>
                      <button onClick={() => setAction({ type: 'reduce', pos })} className="flex-1 py-2 border border-[#003366] text-[#003366] rounded-lg text-xs font-medium">减仓</button>
                      <button onClick={() => setAction({ type: 'close', pos })} className="flex-1 py-2 border border-red-500 text-red-500 rounded-lg text-xs font-medium">平仓</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === '已平仓' && (
          <div className="text-center py-12 text-muted-foreground border rounded-xl">
            <p className="text-sm">暂无已平仓记录</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {action && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setAction(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full bg-background rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">
              {action.type === 'add' ? '加仓' : action.type === 'reduce' ? '减仓' : '平仓'} {action.pos.stockName}
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">当前持仓</span>
                <span>{action.pos.quantity}股</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">现价</span>
                <span>¥{action.pos.currentPrice.toFixed(2)}</span>
              </div>
              {action.type !== 'close' && (
                <input
                  type="number"
                  placeholder={action.type === 'add' ? '买入数量' : '卖出数量'}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
                />
              )}
              {action.type === 'close' && (
                <p className="text-sm text-red-500">确认平仓将全部卖出 {action.pos.quantity} 股 {action.pos.stockName}</p>
              )}
              <button onClick={() => { setAction(null); alert('操作成功！') }} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">
                确认{action.type === 'add' ? '买入' : action.type === 'reduce' ? '卖出' : '平仓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
