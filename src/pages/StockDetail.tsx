import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowLeft, TrendingUp, TrendingDown, Heart, Share2, Wallet
} from 'lucide-react'
import {
  Area, AreaChart as ReAreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// 定时平仓收益计算：每5分钟3%
function getAutoCloseRate(minutes: number): number {
  if (minutes <= 0) return 0
  return (minutes / 5) * 3
}

const autoCloseOptions = [
  { value: 0, label: '不平仓', rate: 0 },
  { value: 5, label: '5分钟', rate: 3 },
  { value: 10, label: '10分钟', rate: 6 },
  { value: 30, label: '30分钟', rate: 18 },
  { value: 60, label: '60分钟', rate: 36 },
]

export default function StockDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('1D')
  const [showBuy, setShowBuy] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [buyPrice, setBuyPrice] = useState('')
  const [buyQty, setBuyQty] = useState('100')
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit')
  const [autoClose, setAutoClose] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState('')

  const stocksQuery = trpc.stock.list.useQuery()
  const allStocks = stocksQuery.data || []
  const rawStock = allStocks.find((s: any) => s.code === id) || allStocks[0]
  // 添加默认值避免null
  const stock = {
    code: rawStock?.code || id || '',
    name: rawStock?.name || '加载中...',
    price: Number(rawStock?.price) || 0,
    change: Number(rawStock?.change) || 0,
    changePercent: Number(rawStock?.changePercent) || 0,
    market: rawStock?.market || '港股',
    volume: rawStock?.volume || '-',
    turnover: rawStock?.turnover || '-',
    high: Number(rawStock?.high) || 0,
    low: Number(rawStock?.low) || 0,
    open: Number(rawStock?.open) || 0,
    prevClose: Number(rawStock?.prevClose) || 0,
    marketCap: rawStock?.marketCap || '-',
    pe: rawStock?.pe || '-',
    dividend: rawStock?.dividend || '-',
    week52High: Number(rawStock?.week52High) || 0,
    week52Low: Number(rawStock?.week52Low) || 0,
  }
  // 模拟K线数据
  const chartData = useMemo(() => {
    const base = Number(stock?.price || 0)
    if (!base) return []
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15 || '00'}`,
      price: base + (Math.random() - 0.5) * base * 0.02,
    }))
  }, [stock?.price, activeTab])

  const tabs = ['1D', '1W', '1M', '3M']

  const totalAmount = (parseFloat(buyPrice || stock.price.toString()) * parseInt(buyQty || '0'))
  const fee = totalAmount * 0.001

  // 定时平仓预期盈亏
  const autoCloseRate = getAutoCloseRate(autoClose)
  const estimatedProfit = totalAmount * (autoCloseRate / 100)

  const totalCost = totalAmount + fee

  const handleBuy = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // 检查余额是否足够
    if (user.balance <= 0) {
      setShowError('账户余额不足，请先充值')
      return
    }
    if (totalCost > user.balance) {
      setShowError(`余额不足，当前余额 ¥${user.balance.toLocaleString()}，需要 ¥${totalCost.toFixed(2)}`)
      return
    }
    setShowConfirm(true)
  }

  const confirmBuy = () => {
    // 最终余额检查
    if (!user || totalCost > user.balance) {
      setShowError('余额不足，请充值后再试')
      setShowConfirm(false)
      return
    }
    // 扣除余额并保存到localStorage
    const newBalance = user.balance - totalCost
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    userData.balance = newBalance
    localStorage.setItem('user_data', JSON.stringify(userData))
    // 更新前端状态
    user.balance = newBalance
    setShowBuy(false)
    setShowConfirm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="pb-32 md:pb-24">
      {/* Header */}
      <div className="bg-[#003366] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold">{stock.name}</p>
            <p className="text-xs text-white/60">{stock.code} &middot; {stock.market}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFavorited(!favorited)}>
              <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-3xl font-bold">{stock.price.toFixed(2)}</span>
          <span className={`flex items-center gap-1 text-sm ${stock.changePercent >= 0 ? 'text-red-300' : 'text-green-300'}`}>
            {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Chart Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === t ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'
              }`}
            >
              {t === '1D' ? '分时' : t === '1W' ? '日K' : t === '1M' ? '周K' : '月K'}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[250px] bg-card border rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stock.changePercent >= 0 ? '#E63946' : '#06A77D'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={stock.changePercent >= 0 ? '#E63946' : '#06A77D'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stock.changePercent >= 0 ? '#E63946' : '#06A77D'}
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={1.5}
              />
            </ReAreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-card border rounded-lg p-2">
            <p className="text-muted-foreground">最高</p>
            <p className="font-medium">{stock.high.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-2">
            <p className="text-muted-foreground">最低</p>
            <p className="font-medium">{stock.low.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-2">
            <p className="text-muted-foreground">今开</p>
            <p className="font-medium">{stock.open.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-2">
            <p className="text-muted-foreground">昨收</p>
            <p className="font-medium">{stock.prevClose.toFixed(2)}</p>
          </div>
        </div>

        {/* Volume */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-card border rounded-lg p-3">
            <p className="text-muted-foreground">成交量</p>
            <p className="font-semibold text-base">{stock.volume}</p>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <p className="text-muted-foreground">成交额</p>
            <p className="font-semibold text-base">{stock.turnover}</p>
          </div>
        </div>

        {/* Financial Data */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">财务数据</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">市值</p>
              <p className="font-medium">{stock.marketCap}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">市盈率</p>
              <p className="font-medium">{stock.pe}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">股息率</p>
              <p className="font-medium">{stock.dividend}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">52周最高</p>
              <p className="font-medium">{stock.week52High.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">52周最低</p>
              <p className="font-medium">{stock.week52Low.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">五档盘口</h3>
          <div className="space-y-1 text-sm">
            {[5, 4, 3, 2, 1].map(i => (
              <div key={`ask${i}`} className="flex items-center justify-between">
                <span className="text-down w-10">卖{i}</span>
                <span className="font-mono">{(stock.price + i * 0.2).toFixed(2)}</span>
                <div className="flex-1 mx-2 h-4 bg-green-50 dark:bg-green-900/20 rounded overflow-hidden">
                  <div className="h-full bg-down/20" style={{ width: `${20 + i * 15}%` }} />
                </div>
                <span className="text-muted-foreground text-xs">{(1000 + i * 500).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t my-2" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`bid${i}`} className="flex items-center justify-between">
                <span className="text-up w-10">买{i}</span>
                <span className="font-mono">{(stock.price - i * 0.2).toFixed(2)}</span>
                <div className="flex-1 mx-2 h-4 bg-red-50 dark:bg-red-900/20 rounded overflow-hidden">
                  <div className="h-full bg-up/20" style={{ width: `${25 + i * 12}%` }} />
                </div>
                <span className="text-muted-foreground text-xs">{(1200 + i * 400).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== 底部购买按钮栏 - 全设备可见 z-50 确保不被遮挡 ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t p-3">
        <div className="flex gap-3 max-w-7xl mx-auto">
          <button
            onClick={() => setFavorited(!favorited)}
            className="px-4 py-3 border-2 border-[#003366] text-[#003366] rounded-xl text-sm font-medium hover:bg-[#003366]/5 transition-colors shrink-0"
          >
            <Heart className={`w-4 h-4 inline mr-1 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            {favorited ? '已自选' : '自选'}
          </button>
          <button
            onClick={() => {
              if (!user) { navigate('/login'); return }
              setShowBuy(true)
              setBuyPrice(stock.price.toString())
            }}
            className="flex-1 py-3 bg-[#003366] text-white rounded-xl text-base font-semibold hover:bg-[#002244] transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" /> 买入
          </button>
        </div>
      </div>

      {/* ====== 买入弹窗 ====== */}
      {showBuy && (
        <div className="fixed inset-0 z-[60]" onClick={() => setShowBuy(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">买入 {stock.name} {stock.code}</h3>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">可用资金: &yen;{user.balance.toLocaleString()}</p>
            )}

            <div className="mt-4 space-y-4">
              {/* Price */}
              <div>
                <label className="text-sm text-muted-foreground">买入价格</label>
                <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-lg font-mono outline-none focus:ring-2 focus:ring-[#003366]/30" />
                <div className="flex gap-3 mt-2">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" checked={orderType === 'limit'} onChange={() => setOrderType('limit')} /> 限价
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" checked={orderType === 'market'} onChange={() => setOrderType('market')} /> 市价
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm text-muted-foreground">买入数量</label>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setBuyQty(Math.max(100, parseInt(buyQty) - 100).toString())}
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg font-medium">-</button>
                  <input type="number" value={buyQty} onChange={e => setBuyQty(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-muted rounded-lg text-center font-mono outline-none focus:ring-2 focus:ring-[#003366]/30" />
                  <button onClick={() => setBuyQty((parseInt(buyQty || '0') + 100).toString())}
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg font-medium">+</button>
                </div>
                <div className="flex gap-2 mt-2">
                  {['100', '500', '1000', '全部'].map(q => (
                    <button key={q} onClick={() => setBuyQty(q === '全部' ? '10000' : q)}
                      className="px-3 py-1 bg-muted rounded text-xs hover:bg-[#003366]/10 transition-colors">{q}</button>
                  ))}
                </div>
              </div>

              {/* Auto Close with Rate */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">定时平仓（可选）</label>
                  {autoClose > 0 && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      预期盈亏 &plusmn;{autoCloseRate}%
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {autoCloseOptions.map(opt => (
                    <button key={opt.value} onClick={() => setAutoClose(opt.value)}
                      className={`py-2 rounded-lg text-sm transition-colors relative ${
                        autoClose === opt.value ? 'bg-[#003366] text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}>
                      {opt.label}
                      {opt.rate > 0 && (
                        <span className={`block text-[10px] mt-0.5 ${autoClose === opt.value ? 'text-white/70' : 'text-muted-foreground'}`}>
                          &plusmn;{opt.rate}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {autoClose > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2">
                    定时平仓规则：每5分钟对应3%收益/亏损
                    <span className="text-amber-700 font-medium ml-1">{autoClose}分钟 &times; 0.6% = &plusmn;{autoCloseRate}%</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">预估金额</span>
                  <span className="font-mono">&yen;{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">手续费</span>
                  <span className="font-mono">&yen;{fee.toFixed(2)}</span>
                </div>
                {autoClose > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span className="text-muted-foreground">定时平仓盈亏({autoCloseRate}%)</span>
                    <span className="font-mono font-medium">&plusmn;&yen;{estimatedProfit.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>总计</span>
                  <span className="font-mono text-[#003366]">&yen;{(totalAmount + fee).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleBuy}
                className="w-full py-3 bg-[#003366] text-white rounded-xl font-semibold hover:bg-[#002244] transition-colors">
                确认买入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== 确认弹窗 ====== */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-center">确认买入</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">股票</span>
                <span>{stock.name} ({stock.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">价格</span>
                <span className="font-mono">&yen;{parseFloat(buyPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">数量</span>
                <span>{buyQty}股</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">总计</span>
                <span className="font-mono font-bold">&yen;{(totalAmount + fee).toFixed(2)}</span>
              </div>
              {autoClose > 0 && (
                <>
                  <div className="flex justify-between text-amber-600">
                    <span>定时平仓</span>
                    <span>{autoClose}分钟后</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span>预期盈亏比例</span>
                    <span className="font-bold">&plusmn;{autoCloseRate}%</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span>预期盈亏金额</span>
                    <span className="font-mono font-bold">&plusmn;&yen;{estimatedProfit.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium">取消</button>
              <button onClick={confirmBuy} className="flex-1 py-2.5 bg-[#003366] text-white rounded-xl text-sm font-medium">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== 成功弹窗 - 居中显示完成 ====== */}
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
            {autoClose > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-1">已设置{autoClose}分钟后自动平仓（&plusmn;{autoCloseRate}%）</p>
            )}
                   </div>
        </div>
      )}

      {/* ====== 错误弹窗 - 余额不足 ====== */}
      {showError && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={() => setShowError('')}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-8 w-full max-w-[320px] animate-scale-in flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-center text-red-600">余额不足</p>
            <p className="text-sm text-muted-foreground text-center mt-2">{showError}</p>
            <div className="flex gap-3 mt-6 w-full">
              <button onClick={() => setShowError('')} className="flex-1 py-2.5 border rounded-xl text-sm">取消</button>
              <button onClick={() => { setShowError(''); navigate('/user/recharge') }} className="flex-1 py-2.5 bg-[#003366] text-white rounded-xl text-sm">去充值</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}