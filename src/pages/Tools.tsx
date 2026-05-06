import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Target, ListOrdered, } from 'lucide-react'

export default function Tools() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState<string | null>(null)

  const tools = [
    { id: 'timer', icon: Clock, title: '定时平仓', desc: '设置持仓自动平仓时间', color: 'bg-blue-500' },
    { id: 'date', icon: Calendar, title: '时间平仓', desc: '指定日期时间自动平仓', color: 'bg-green-500' },
    { id: 'price', icon: Target, title: '价格条件单', desc: '达标价格自动触发', color: 'bg-amber-500' },
    { id: 'log', icon: ListOrdered, title: '执行日志', desc: '查看条件单执行记录', color: 'bg-purple-500' },
  ]

  return (
    <div className="pb-16 md:pb-4 max-w-7xl mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">交易工具</h1>
      </div>
      <div className="pt-14 px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold">智能工具箱</h1>

      <div className="grid grid-cols-2 gap-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setShowModal(tool.id)}
            className="bg-card border rounded-xl p-4 text-left hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mt-3">{tool.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60]" onClick={() => setShowModal(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">
              {showModal === 'timer' && '定时平仓'}
              {showModal === 'date' && '时间平仓'}
              {showModal === 'price' && '价格条件单'}
              {showModal === 'log' && '执行日志'}
            </h3>
            <div className="mt-4 space-y-3">
              {showModal === 'timer' && (
                <>
                  <p className="text-sm text-muted-foreground">设置持仓在指定时间后自动平仓</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['5分钟', '10分钟', '30分钟', '60分钟'].map(t => (
                      <button key={t} className="py-3 bg-muted rounded-lg text-sm hover:bg-[#003366]/10 transition-colors">{t}</button>
                    ))}
                  </div>
                </>
              )}
              {showModal === 'date' && (
                <>
                  <p className="text-sm text-muted-foreground">选择平仓日期和时间</p>
                  <input type="datetime-local" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
                </>
              )}
              {showModal === 'price' && (
                <>
                  <p className="text-sm text-muted-foreground">设置目标价格，达标自动触发</p>
                  <input type="number" placeholder="目标价格" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-up/10 text-up rounded-lg text-sm">≥ 涨价触发</button>
                    <button className="flex-1 py-2 bg-down/10 text-down rounded-lg text-sm">≤ 跌价触发</button>
                  </div>
                </>
              )}
              {showModal === 'log' && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {[
                    { time: '2026-05-15 14:30', action: '定时平仓 - 腾讯控股 100股 @388.20', status: '已执行' },
                    { time: '2026-05-15 11:20', action: '价格条件单 - 阿里巴巴 200股 @85.00', status: '待触发' },
                    { time: '2026-05-14 16:00', action: '时间平仓 - 美团 50股 @130.00', status: '已取消' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b text-sm">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        log.status === '已执行' ? 'bg-green-100 text-green-700' :
                        log.status === '待触发' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{log.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowModal(null); alert('设置成功！') }}
                className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium hover:bg-[#002244] transition-colors"
              >
                {showModal === 'log' ? '关闭' : '确认设置'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
