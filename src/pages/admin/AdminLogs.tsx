import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Clock, Search, Trash2 } from 'lucide-react'

interface LogRecord {
  id: number
  admin: string
  action: string
  target: string
  time: string
  module: string
}

const MODULE_COLORS: Record<string, string> = {
  '实名审核': 'bg-amber-100 text-amber-700',
  '行情控盘': 'bg-blue-100 text-blue-700',
  '盈亏控制': 'bg-purple-100 text-purple-700',
  '充值审核': 'bg-green-100 text-green-700',
  '提现审核': 'bg-rose-100 text-rose-700',
  '用户管理': 'bg-cyan-100 text-cyan-700',
  '系统设置': 'bg-gray-100 text-gray-700',
  '资讯管理': 'bg-pink-100 text-pink-700',
  '银行卡审核': 'bg-indigo-100 text-indigo-700',
  '股票管理': 'bg-orange-100 text-orange-700',
}

function getLogs(): LogRecord[] {
  try {
    const saved = localStorage.getItem('hkex_admin_logs')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function addAdminLog(action: string, target: string, module: string) {
  const logs = getLogs()
  const adminData = JSON.parse(localStorage.getItem('admin_data') || '{}')
  logs.unshift({
    id: Date.now(),
    admin: adminData.name || adminData.username || 'whxj',
    action,
    target: target || '-',
    time: new Date().toLocaleString(),
    module,
  })
  // 最多保留200条
  if (logs.length > 200) logs.length = 200
  localStorage.setItem('hkex_admin_logs', JSON.stringify(logs))
}

export default function AdminLogs() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [logs, setLogs] = useState<LogRecord[]>([])
  const [filterModule, setFilterModule] = useState('全部')

  useEffect(() => {
    setLogs(getLogs())
  }, [])

  const modules = ['全部', ...new Set(logs.map(l => l.module))]

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.action.includes(search) || l.target.includes(search) || l.admin.includes(search)
    const matchModule = filterModule === '全部' || l.module === filterModule
    return matchSearch && matchModule
  })

  const handleClear = () => {
    if (confirm('确定清空所有日志？此操作不可恢复。')) {
      localStorage.removeItem('hkex_admin_logs')
      setLogs([])
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">操作日志</h1>
        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">{logs.length}条</span>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索操作内容"
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-sm outline-none" />
        </div>

        {/* Module Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {modules.map(m => (
            <button key={m} onClick={() => setFilterModule(m)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filterModule === m ? 'bg-[#003366] text-white' : 'bg-card border text-muted-foreground'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">操作日志自动记录，最多保留200条</p>
        </div>

        {/* Logs Table */}
        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无操作日志</p>
            <p className="text-xs mt-1">后台操作后将自动记录</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-3 text-left">时间</th>
                  <th className="px-3 py-3 text-left">操作人</th>
                  <th className="px-3 py-3 text-left">模块</th>
                  <th className="px-3 py-3 text-left">操作内容</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="px-3 py-3 font-medium">{log.admin}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${MODULE_COLORS[log.module] || 'bg-gray-100 text-gray-700'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p>{log.action}</p>
                      {log.target !== '-' && <p className="text-xs text-muted-foreground">对象: {log.target}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Clear Button */}
        {logs.length > 0 && (
          <button onClick={handleClear}
            className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm flex items-center justify-center gap-1">
            <Trash2 className="w-4 h-4" /> 清空日志
          </button>
        )}
      </div>
    </div>
  )
}
