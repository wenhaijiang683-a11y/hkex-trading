import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Search, Power, User, TrendingUp, TrendingDown } from 'lucide-react'

export default function AdminUserProfit() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  const usersQuery = trpc.user.getAll.useQuery()
  const allUsers = usersQuery.data || []

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => usersQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [usersQuery])

  const filtered = search
    ? allUsers.filter((u: any) => u.name?.includes(search) || u.phone?.includes(search) || String(u.dbId).includes(search))
    : allUsers

  const selectedUserData = allUsers.find((u: any) => String(u.dbId || u.id) === selectedUser)

  // 资产调控（增加/减少余额）
  const handleAdjustBalance = (type: 'add' | 'subtract') => {
    if (!selectedUser || !adjustAmount || isNaN(Number(adjustAmount))) {
      alert('请输入有效金额'); return
    }
    const amount = Number(adjustAmount)
    const records = JSON.parse(localStorage.getItem('admin_profit_loss_records') || '[]')
    records.push({
      id: Date.now(),
      userId: selectedUser,
      userName: selectedUserData?.name || '用户',
      type: type === 'add' ? '盈利' : '亏损',
      amount,
      reason: adjustReason || `管理员${type === 'add' ? '增加' : '减少'}余额`,
      time: new Date().toLocaleString(),
    })
    localStorage.setItem('admin_profit_loss_records', JSON.stringify(records))
    alert(`${type === 'add' ? '增加' : '减少'} ¥${amount.toLocaleString()} 成功`)
    setAdjustAmount('')
    setAdjustReason('')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">用户盈亏查询</h1>
        <button onClick={() => usersQuery.refetch()} className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">刷新</button>
      </div>
      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用户"
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-lg text-sm outline-none" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总用户</p>
            <p className="text-xl font-bold text-[#003366]">{allUsers.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">总资金</p>
            <p className="text-xl font-bold text-green-600">¥{allUsers.reduce((sum: number, u: any) => sum + (u.balance || 0), 0).toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">已认证</p>
            <p className="text-xl font-bold text-blue-600">{allUsers.filter((u: any) => u.isRealName).length}</p>
          </div>
        </div>

        {/* User List */}
        {allUsers.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无注册用户</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">用户</th>
                  <th className="px-4 py-3 text-left">余额</th>
                  <th className="px-4 py-3 text-left">实名</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u: any) => (
                  <tr key={u.dbId || u.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">¥{(u.balance || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isRealName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.isRealName ? '已认证' : '未认证'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUser(String(u.dbId || u.id))}
                        className="px-3 py-1 bg-[#003366] text-white rounded text-xs">管理</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUserData && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setSelectedUser(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full md:w-[500px] bg-background rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">{selectedUserData.name} - 盈亏管理</h3>
            <p className="text-xs text-muted-foreground">{selectedUserData.phone}</p>

            <div className="mt-4 space-y-4">
              {/* Asset Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">余额</p>
                  <p className="font-bold">¥{(selectedUserData.balance || 0).toLocaleString()}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">今日盈亏</p>
                  <p className="font-bold">¥0</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">持仓市值</p>
                  <p className="font-bold">¥0</p>
                </div>
              </div>

              {/* Win/Lose Control */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-medium text-sm text-amber-800 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> 盈亏控制
                </h4>
                <p className="text-xs text-amber-600 mt-1">直接操作用户余额</p>
                <div className="mt-3 space-y-2">
                  <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                    placeholder="操作原因（如：盈利派送、活动奖励）"
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border" />
                  <div className="flex gap-2">
                    <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)}
                      placeholder="金额"
                      className="flex-1 px-3 py-2 bg-white rounded-lg text-sm outline-none border" />
                    <button onClick={() => handleAdjustBalance('add')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 盈利
                    </button>
                    <button onClick={() => handleAdjustBalance('subtract')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> 亏损
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Close Control */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-sm text-blue-800">自动平仓设定</h4>
                <p className="text-xs text-blue-600 mt-1">设定用户平仓时的盈亏结果</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => alert(`已设定 ${selectedUserData.name} 平仓盈利`)}
                    className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">设定盈利</button>
                  <button onClick={() => alert(`已设定 ${selectedUserData.name} 平仓亏损`)}
                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">设定亏损</button>
                  <button onClick={() => alert(`已设定 ${selectedUserData.name} 随机结果`)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">随机</button>
                </div>
              </div>

              {/* Force Logout */}
              <button onClick={() => { alert(`已强制 ${selectedUserData.name} 下线`); setSelectedUser(null) }}
                className="w-full py-2 border border-red-500 text-red-500 rounded-lg text-sm flex items-center justify-center gap-1">
                <Power className="w-4 h-4" /> 强制下线
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
