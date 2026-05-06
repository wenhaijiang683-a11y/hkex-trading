import { indexData } from '../data/stockData'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

export default function TickerBar() {
  const announcements = [
    '港股通今日净流入45.23亿港元',
    '美联储维持基准利率不变',
    '腾讯控股发布2026年财报，净利润超预期',
    '南向资金连续5个交易日净流入',
  ]

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="flex items-center h-8 overflow-hidden">
        <div className="flex items-center gap-1 px-3 shrink-0 border-r border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-xs font-medium text-amber-800 dark:text-amber-200">公告</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
            {[...announcements, ...announcements].map((text, i) => (
              <span key={i} className="text-xs text-amber-800 dark:text-amber-200">{text}</span>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 px-3 shrink-0 border-l border-amber-200 dark:border-amber-800">
          {indexData.slice(0, 3).map(idx => (
            <div key={idx.nameEn} className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{idx.nameEn}</span>
              <span className={idx.changePercent >= 0 ? 'text-up font-medium' : 'text-down font-medium'}>
                {idx.value.toLocaleString()}
              </span>
              {idx.changePercent >= 0 ? (
                <TrendingUp className="w-3 h-3 text-up" />
              ) : (
                <TrendingDown className="w-3 h-3 text-down" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
