import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '@/contexts/LangContext'
import { trpc } from '@/providers/trpc'
import { indexData, cryptoAndGold } from '@/data/stockData'
import {
  TrendingUp, TrendingDown, ChevronRight,
  Clock, CircleDollarSign, Banknote, ArrowDownUp, Info, BookOpen, Phone, Newspaper, Wallet
} from 'lucide-react'

// 纯CSS动画Banner内容，无图片
const banners = [
  { title: '港股行情实时追踪', subtitle: '精准把握投资机会', color: 'from-[#003366] via-[#004080] to-[#001a33]' },
  { title: '智能交易辅助工具', subtitle: '数据驱动投资决策', color: 'from-[#0a2540] via-[#003366] to-[#00152e]' },
  { title: '零风险模拟交易', subtitle: '实战练手提升技能', color: 'from-[#001a33] via-[#002855] to-[#003366]' },
  { title: '贵金属与数字货币', subtitle: '多元化资产配置', color: 'from-[#0d2137] via-[#003366] to-[#001a33]' },
]

// 浮动粒子数据
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 4,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
}))

// K线柱状数据
// 实时倒计时组件 - 距收市/距开市/已休市
function LiveCountdown() {
  const [text, setText] = useState('距收市')
  const [timeStr, setTimeStr] = useState('--:--:--')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      const s = now.getSeconds()
      const currentMinutes = h * 60 + m

      // 港股交易时间：09:30 - 16:00
      const openMinutes = 9 * 60 + 30  // 570
      const closeMinutes = 16 * 60      // 960

      let targetLabel = ''
      let targetMinutes = 0

      if (currentMinutes < openMinutes) {
        // 开市前
        targetLabel = '距开市'
        targetMinutes = openMinutes
      } else if (currentMinutes >= closeMinutes) {
        // 已收市
        setText('已休市')
        setTimeStr('明日 09:30')
        return
      } else {
        // 交易中
        targetLabel = '距收市'
        targetMinutes = closeMinutes
      }

      const diffSeconds = (targetMinutes - currentMinutes) * 60 - s
      const dh = Math.floor(diffSeconds / 3600)
      const dm = Math.floor((diffSeconds % 3600) / 60)
      const ds = diffSeconds % 60

      setText(targetLabel)
      setTimeStr(`${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}:${String(ds).padStart(2, '0')}`)
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right">
      <p className="text-xs text-muted-foreground">{text}</p>
      <p className="text-sm font-mono text-[#003366] font-bold tabular-nums">{timeStr}</p>
    </div>
  )
}

// 实时日历组件
function LiveCalendar() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  const days: (number | null)[] = []
  // 填充空白（周日=0，周一=1...）
  const offset = firstDay === 0 ? 6 : firstDay - 1
  for (let i = 0; i < offset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
      {weekdays.map(d => <span key={d} className="text-muted-foreground py-1 font-medium">{d}</span>)}
      {days.map((d, i) => (
        <span key={i} className={`py-1.5 rounded ${
          d === today ? 'bg-[#003366] text-white font-bold shadow-md' :
          d === null ? 'text-transparent' : ''
        }`}>{d || ''}</span>
      ))}
    </div>
  )
}

const klineBars = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  height: 20 + Math.random() * 60,
  isUp: Math.random() > 0.4,
  delay: i * 0.1,
}))

export default function Index() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [tabIdx, setTabIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  // 从后端API获取股票数据
  const stocksQuery = trpc.stock.list.useQuery()
  const apiStocks = (stocksQuery.data || []).map((s: any) => ({
    ...s, nameEn: s.nameEn || s.name,
  }))

  // 合并股票和数字货币/贵金属数据
  const allAssets = [
    ...apiStocks,
    ...cryptoAndGold.map(c => ({
      code: c.code, name: c.name, nameEn: c.code, price: c.price, change: c.change, changePercent: c.changePercent,
      volume: '-', turnover: '-', high: c.price, low: c.price, open: c.price, prevClose: c.price - c.change,
      market: c.market, marketCap: '-', pe: '-', dividend: '-', week52High: c.price * 1.5, week52Low: c.price * 0.5,
      isDigital: true,
    })),
  ]

  const sortedStocks = [...allAssets].sort((a, b) => {
    if (tabIdx === 0) return b.changePercent - a.changePercent
    if (tabIdx === 1) return a.changePercent - b.changePercent
    return parseFloat(b.turnover || '0') - parseFloat(a.turnover || '0')
  }).slice(0, 5)

  const quickEntries = [
    { icon: CircleDollarSign, label: '充值', path: '/user/recharge', color: 'bg-emerald-500' },
    { icon: Banknote, label: '提现', path: '/user/withdraw', color: 'bg-blue-500' },
    { icon: ArrowDownUp, label: '持仓', path: '/user/position', color: 'bg-[#003366]' },
    { icon: Wallet, label: '资产', path: '/user/asset', color: 'bg-orange-500' },
    { icon: Newspaper, label: '新股', path: '/ipo', color: 'bg-cyan-600' },
    { icon: Info, label: '关于', path: '/about', color: 'bg-amber-500' },
    { icon: BookOpen, label: '学堂', path: '/study', color: 'bg-purple-500' },
    { icon: Phone, label: '客服', path: '/service', color: 'bg-rose-500' },
  ]

  return (
    <div className="pb-16 md:pb-0">
      {/* Banner - 纯CSS动画，无图片 */}
      <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden bg-gradient-to-br from-[#003366] via-[#002855] to-[#001a33]">
        {/* 动态渐变层 */}
        {banners.map((b, i) => (
          <div key={i} className={`absolute inset-0 bg-gradient-to-br ${b.color} transition-opacity duration-1000 ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`} />
        ))}

        {/* 浮动粒子效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* K线柱状图背景动画 */}
        <div className="absolute bottom-0 left-0 right-0 h-[80px] md:h-[120px] flex items-end justify-center gap-[2px] md:gap-1 px-4 opacity-20 pointer-events-none overflow-hidden">
          {klineBars.map(bar => (
            <div
              key={bar.id}
              className={`w-[3px] md:w-[6px] rounded-t-sm animate-kline ${bar.isUp ? 'bg-up' : 'bg-down'}`}
              style={{
                height: `${bar.height}%`,
                animationDelay: `${bar.delay}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        {/* 网格线装饰 */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* 文字内容 */}
        {banners.map((b, i) => (
          <div key={i} className={`absolute inset-0 flex items-center transition-all duration-700 ${i === currentBanner ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="px-6 md:px-12 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#F5A623]" />
                </div>
                <span className="text-[#F5A623] text-xs md:text-sm font-medium tracking-wider">HKEX SIMULATION</span>
              </div>
              <h2 className="text-white text-xl md:text-4xl font-bold tracking-tight">{b.title}</h2>
              <p className="text-white/60 text-sm md:text-lg mt-2 md:mt-3">{b.subtitle}</p>
              {i === banners.length - 1 && (
                <button onClick={() => navigate('/market')} className="mt-4 md:mt-6 px-6 py-2.5 bg-[#F5A623] text-white rounded-xl text-sm font-semibold hover:bg-[#e09516] transition-colors shadow-lg">
                  立即开始
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 轮播指示器 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)} className={`h-1.5 rounded-full transition-all ${i === currentBanner ? 'bg-[#F5A623] w-6' : 'bg-white/30 w-1.5'}`} />
          ))}
        </div>

        {/* 右上角装饰圆 */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/5 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
        {/* Quick Entries */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('index.quick')}</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickEntries.map(entry => (
              <Link key={entry.label} to={entry.path} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 ${entry.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <entry.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-foreground">{entry.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Index Cards */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('index.indices')}</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
            {indexData.map(idx => (
              <div key={idx.nameEn} className="snap-start flex-shrink-0 w-[140px] md:w-[180px] bg-card border rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/market')}>
                <p className="text-xs text-muted-foreground">{idx.name}</p>
                <p className="text-lg font-bold mt-1">{idx.value.toLocaleString()}</p>
                <div className={`flex items-center gap-1 mt-1 ${idx.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                  {idx.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-medium">{idx.changePercent >= 0 ? '+' : ''}{idx.changePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Ranking */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{t('index.ranking')}</h3>
            <Link to="/market" className="text-xs text-[#003366] flex items-center gap-0.5">查看更多 <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex border-b">
            {['涨幅榜', '跌幅榜', '成交额'].map((t, i) => (
              <button key={t} onClick={() => setTabIdx(i)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tabIdx === i ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-muted-foreground'}`}>{t}</button>
            ))}
          </div>
          <div className="divide-y">
            {sortedStocks.map((stock, i) => (
              <div key={stock.code} className="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/stock/${(stock as any).isDigital ? stock.code : stock.code}`)}>
                <span className={`w-5 text-xs font-bold ${i < 3 ? 'text-[#F5A623]' : 'text-muted-foreground'}`}>{i + 1}</span>
                <div className="flex-1 ml-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    {stock.name}
                    {(stock as any).isDigital && (
                      <span className={`text-[9px] px-1 py-0 rounded ${stock.market === '数字货币' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>{stock.market}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{stock.code}</p>
                </div>
                <p className="text-sm font-medium w-20 text-right">{stock.price > 1000 ? stock.price.toLocaleString(undefined, {maximumFractionDigits: 0}) : stock.price.toFixed(2)}</p>
                <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium w-16 text-center ${stock.changePercent >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Calendar */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">{t('index.calendar')}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#003366]" />
              <div>
                <p className="text-sm font-medium">今日开市</p>
                <p className="text-xs text-muted-foreground">09:30 - 16:00</p>
              </div>
            </div>
            <div className="text-right">
              <LiveCountdown />
            </div>
          </div>
          <LiveCalendar />
        </div>

        {/* Footer with ICP */}
        <footer className="bg-muted rounded-xl p-6 text-sm space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-2">{t('footer.about')}</h4>
              <Link to="/about" className="block text-muted-foreground hover:text-foreground py-0.5">{t('footer.about')}</Link>
              <Link to="/about" className="block text-muted-foreground hover:text-foreground py-0.5">{t('footer.license')}</Link>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('footer.trade')}</h4>
              <Link to="/market" className="block text-muted-foreground hover:text-foreground py-0.5">{t('market.title')}</Link>
              <Link to="/ipo" className="block text-muted-foreground hover:text-foreground py-0.5">{t('ipo.title')}</Link>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('footer.help')}</h4>
              <Link to="/study" className="block text-muted-foreground hover:text-foreground py-0.5">{t('study.title')}</Link>
              <Link to="/service" className="block text-muted-foreground hover:text-foreground py-0.5">{t('service.title')}</Link>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('footer.contact')}</h4>
              <p className="text-muted-foreground py-0.5">客服微信: HKEX888</p>
              <p className="text-muted-foreground py-0.5">客服QQ: 800888888</p>
              <p className="text-muted-foreground py-0.5">热线: 400-888-8888</p>
            </div>
          </div>
          <div className="border-t pt-3 text-center text-xs text-muted-foreground space-y-1">
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.icp')}</p>
            <p>{t('footer.license')}</p>
            <p className="text-amber-600 font-medium">{t('footer.risk')}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
