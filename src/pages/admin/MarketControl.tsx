import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Activity, Settings } from 'lucide-react'

export default function AdminMarketControl() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'market' | 'users'>('market')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [profitAmount, setProfitAmount] = useState('')
  const [isProfit, setIsProfit] = useState(true)
  const [reason, setReason] = useState('')
  const [globalTrend, setGlobalTrend] = useState('normal')
  const [marketOpen, setMarketOpen] = useState(true)
  const [updateMsg, setUpdateMsg] = useState('')

  const usersQuery = trpc.user.getAll.useQuery()
  const allUsers = usersQuery.data || []

  // 发送盈亏给用户
  const handleSendProfitLoss = () => {
    if (!selectedUser) { alert('请选择用户'); return }
    if (!profitAmount || isNaN(Number(profitAmount))) { alert('请输入有效金额'); return }

    const user = allUsers.find((u: any) => String(u.dbId) === selectedUser || u.id === selectedUser)
    const userName = user?.name || '用户'
    const amount = Number(profitAmount)
    const type = isProfit ? '盈利' : '亏损'

    // 保存盈亏记录到localStorage（前后台共享）
    const records = JSON.parse(localStorage.getItem('admin_profit_loss_records') || '[]')
    records.push({
      id: Date.now(),
      userId: selectedUser,
      userName,
      type,
      amount,
      reason: reason || `管理员设置${type}`,
      time: new Date().toLocaleString(),
    })
    localStorage.setItem('admin_profit_loss_records', JSON.stringify(records))

    setUpdateMsg(`已为用户 ${userName} 设置${type} ¥${amount.toLocaleString()}`)
    setTimeout(() => setUpdateMsg(''), 3000)
    alert(`已设置${type} ¥${amount.toLocaleString()}`)
  }

  // 全局市场控制
  const handleGlobalUpdate = () => {
    localStorage.setItem('admin_market_config', JSON.stringify({
      trend: globalTrend,
      marketOpen,
      updatedAt: new Date().toISOString(),
    }))
    setUpdateMsg('市场全局配置已更新')
    setTimeout(() => setUpdateMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">大盘调控</h1>
        {updateMsg && (
          <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded-full">{updateMsg}</span>
        )}
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 bg-muted p-1 mx-4 mt-4 rounded-lg">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${activeTab === 'market' ? 'bg-white shadow-sm text-[#003366]' : 'text-muted-foreground'}`}
        >
          <Activity className="w-4 h-4" /> 市场控制
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${activeTab === 'users' ? 'bg-white shadow-sm text-[#003366]' : 'text-muted-foreground'}`}
        >
          <Users className="w-4 h-4" /> 用户盈亏
        </button>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4">

        {/* ====== 市场控制 Tab ====== */}
        {activeTab === 'market' && (
          <>
            {/* 开关盘控制 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> 交易开关</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">市场交易状态</p>
                  <p className="text-xs text-muted-foreground">关闭后用户无法交易</p>
                </div>
                <button
                  onClick={() => setMarketOpen(!marketOpen)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${marketOpen ? 'bg-green-500' : 'bg-gray-400'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${marketOpen ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <p className={`mt-2 text-sm font-medium ${marketOpen ? 'text-green-600' : 'text-red-600'}`}>
                {marketOpen ? '● 交易中' : '● 已停盘'}
              </p>
            </div>

            {/* 市场走势控制 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> 市场走势控制</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">整体走势方向</label>
                  <select
                    value={globalTrend}
                    onChange={e => setGlobalTrend(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
                  >
                    <option value="normal">正常波动</option>
                    <option value="bullish">看涨（涨多跌少）</option>
                    <option value="bearish">看跌（跌多涨少）</option>
                    <option value="strong_bull">强势看涨（全部上涨）</option>
                    <option value="strong_bear">强势看跌（全部下跌）</option>
                  </select>
                </div>
                <button
                  onClick={handleGlobalUpdate}
                  className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium"
                >
                  应用全局配置
                </button>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setGlobalTrend('strong_bull'); handleGlobalUpdate() }}
                  className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"
                >
                  <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <p className="text-sm font-medium text-green-700">一键全涨</p>
                </button>
                <button
                  onClick={() => { setGlobalTrend('strong_bear'); handleGlobalUpdate() }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-center"
                >
                  <TrendingDown className="w-6 h-6 mx-auto text-red-600 mb-1" />
                  <p className="text-sm font-medium text-red-700">一键全跌</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ====== 用户盈亏 Tab ====== */}
        {activeTab === 'users' && (
          <>
            {/* 选择用户 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> 选择用户</h3>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
              >
                <option value="">请选择用户</option>
                {allUsers.map((u: any) => (
                  <option key={u.dbId || u.id} value={String(u.dbId || u.id)}>
                    {u.name} ({u.phone}) - 余额: ¥{(u.balance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* 盈亏设置 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> 盈亏设置</h3>

              {/* 盈利/亏损切换 */}
              <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
                <button
                  onClick={() => setIsProfit(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${isProfit ? 'bg-green-500 text-white' : 'text-muted-foreground'}`}
                >
                  <TrendingUp className="w-4 h-4" /> 让用户赢
                </button>
                <button
                  onClick={() => setIsProfit(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${!isProfit ? 'bg-red-500 text-white' : 'text-muted-foreground'}`}
                >
                  <TrendingDown className="w-4 h-4" /> 让用户亏
                </button>
              </div>

              {/* 金额 */}
              <div className="mb-3">
                <label className="text-sm text-muted-foreground">
                  {isProfit ? '盈利金额' : '亏损金额'} (¥)
                </label>
                <input
                  type="number"
                  value={profitAmount}
                  onChange={e => setProfitAmount(e.target.value)}
                  placeholder="输入金额"
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
                />
              </div>

              {/* 原因 */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground">操作原因（可选）</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="如：盈利派送、活动奖励等"
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none"
                />
              </div>

              {/* 执行按钮 */}
              <button
                onClick={handleSendProfitLoss}
                className={`w-full py-3 text-white rounded-xl font-medium ${isProfit ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isProfit ? '✓ 给用户发送盈利' : '✓ 给用户设置亏损'}
              </button>
            </div>

            {/* 操作记录 */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3">最近操作记录</h3>
              <ProfitLossHistory />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 盈亏操作历史组件
function ProfitLossHistory() {
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('admin_profit_loss_records') || '[]')
    setRecords(saved.reverse().slice(0, 20)) // 最新20条
  }, [])

  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">暂无操作记录</p>
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {records.map((r: any) => (
        <div key={r.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
          <div>
            <p className="font-medium">{r.userName}</p>
            <p className="text-xs text-muted-foreground">{r.reason}</p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${r.type === '盈利' ? 'text-green-600' : 'text-red-600'}`}>
              {r.type === '盈利' ? '+' : '-'}¥{r.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{r.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
