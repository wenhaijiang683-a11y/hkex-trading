import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ipoList } from '@/data/stockData'
import { ArrowLeft, Calendar, Building2, ChevronDown, ChevronUp, FileText } from 'lucide-react'

export default function Ipo() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)

  const statusColors: Record<string, string> = {
    '招股中': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    '待招股': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    '已上市': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <div className="pb-16 md:pb-4 max-w-7xl mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">新股IPO</h1>
      </div>
      <div className="pt-14 px-4 py-4 space-y-4">
        <h1 className="text-xl font-bold">新股日历</h1>

      {/* Calendar */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">2026年5月</h3>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => (
            <span key={d} className="text-muted-foreground py-1">{d}</span>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
            const hasIpo = [8, 15, 20, 22, 27, 28].includes(d)
            return (
              <span
                key={d}
                className={`py-1 rounded relative ${
                  d === 15 ? 'bg-[#003366] text-white' : hasIpo ? 'text-[#003366] font-bold bg-[#003366]/10' : ''
                }`}
              >
                {d}
                {hasIpo && d !== 15 && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#003366] rounded-full" />}
              </span>
            )
          })}
        </div>
      </div>

      {/* IPO List */}
      <div className="space-y-3">
        {ipoList.map(ipo => (
          <div key={ipo.code} className="bg-card border rounded-xl overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpanded(expanded === ipo.code ? null : ipo.code)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ipo.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ipo.status]}`}>
                      {ipo.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ipo.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{ipo.issuePrice}港元</p>
                  {expanded === ipo.code ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {ipo.sponsor}</span>
                <span>上市: {ipo.listingDate}</span>
              </div>
            </div>
            {expanded === ipo.code && (
              <div className="px-4 pb-4 border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">招股期</span><span>{ipo.startDate} - {ipo.endDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">上市日</span><span>{ipo.listingDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">发行价</span><span>{ipo.issuePrice}港元</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">保荐人</span><span>{ipo.sponsor}</span></div>
                <button className="w-full mt-2 py-2 border border-[#003366] text-[#003366] rounded-lg text-sm flex items-center justify-center gap-1">
                  <FileText className="w-4 h-4" /> 查看招股书
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
