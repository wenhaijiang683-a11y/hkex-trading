import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { TrendingUp, TrendingDown, Search, ArrowLeft } from 'lucide-react'

export default function Market() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('港股')

  const stocksQuery = trpc.stock.list.useQuery()
  const allStocks = stocksQuery.data || []

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => stocksQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [stocksQuery])

  const filtered = search
    ? allStocks.filter((s: any) =>
        s.code?.includes(search) || s.name?.includes(search)
      )
    : allStocks

  const tabs = ['港股', '沪深', '美股']

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索股票代码/名称"
              className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm pb-2 border-b-2 transition-colors ${activeTab === tab ? 'border-[#003366] text-[#003366] font-medium' : 'border-transparent text-muted-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Indices */}
      <div className="px-4 py-3 flex gap-3 overflow-x-auto">
        <div className="bg-muted rounded-xl p-3 min-w-[140px]">
          <p className="text-xs text-muted-foreground">恒生指数</p>
          <p className="text-sm font-bold">19,532.32</p>
          <p className="text-xs text-red-500">+1.23%</p>
        </div>
        <div className="bg-muted rounded-xl p-3 min-w-[140px]">
          <p className="text-xs text-muted-foreground">恒生科技</p>
          <p className="text-sm font-bold">4,521.67</p>
          <p className="text-xs text-green-500">-0.45%</p>
        </div>
        <div className="bg-muted rounded-xl p-3 min-w-[140px]">
          <p className="text-xs text-muted-foreground">国企指数</p>
          <p className="text-sm font-bold">6,891.45</p>
          <p className="text-xs text-red-500">+0.89%</p>
        </div>
      </div>

      {/* Stock List */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between py-2">
          <h3 className="text-xs text-muted-foreground">股票名称</h3>
          <div className="flex gap-8">
            <span className="text-xs text-muted-foreground">最新价</span>
            <span className="text-xs text-muted-foreground">涨跌幅</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">暂无股票数据</div>
        ) : (
          filtered.map((stock: any) => (
            <button
              key={stock.id}
              onClick={() => navigate(`/stock/${stock.code}`)}
              className="w-full flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-sm">{stock.name}</p>
                <p className="text-xs text-muted-foreground">{stock.code}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium tabular-nums">{stock.price?.toFixed ? stock.price.toFixed(2) : stock.price}</span>
                <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-0.5 min-w-[60px] justify-center ${
                  (stock.change || 0) >= 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}>
                  {(stock.change || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {(stock.changePercent || 0) > 0 ? '+' : ''}{(stock.changePercent || 0).toFixed ? (stock.changePercent).toFixed(2) : stock.changePercent}%
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
