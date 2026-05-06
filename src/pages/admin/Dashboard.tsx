import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, DollarSign, TrendingUp, Clock, ArrowLeft, Zap, BarChart3, Settings, Shield, RefreshCw } from 'lucide-react'
import { trpc } from '@/providers/trpc'

function AdminNavLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={className} onClick={(e) => { e.stopPropagation() }}>
      {children}
    </Link>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    todayReg: 0,
    totalRecharge: 0,
    totalWithdraw: 0,
    platformProfit: 0,
  })
  const [pendingItems, setPendingItems] = useState([
    { label: '待审核实名', count: 0, path: '/admin/auth-review' },
    { label: '待审核绑卡', count: 0, path: '/admin/bank-review' },
    { label: '待审核充值', count: 0, path: '/admin/recharge' },
    { label: '待审核提现', count: 0, path: '/admin/withdraw' },
  ])

  const statsQuery = trpc.admin.getStats.useQuery()
  const usersQuery = trpc.user.getAll.useQuery()

  const refreshData = useCallback(() => {
    statsQuery.refetch()
    usersQuery.refetch()
  }, [statsQuery, usersQuery])

  useEffect(() => {
    if (statsQuery.data) {
      const s = statsQuery.data
      setStats({
        totalUsers: s.totalUsers,
        onlineUsers: 0, // 在线状态需要额外逻辑
        todayReg: 0, // 需要单独统计
        totalRecharge: s.totalRecharge,
        totalWithdraw: s.totalWithdraw,
        platformProfit: 0,
      })
      setPendingItems([
        { label: '待审核实名', count: s.pendingAuth || 0, path: '/admin/auth-review' },
        { label: '待审核绑卡', count: s.pendingBank || 0, path: '/admin/bank-review' },
        { label: '待审核充值', count: s.pendingRecharge, path: '/admin/recharge' },
        { label: '待审核提现', count: s.pendingWithdraw, path: '/admin/withdraw' },
      ])
    }
  }, [statsQuery.data])

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData()
    }, 5000)
    return () => clearInterval(timer)
  }, [refreshData])

  const statCards = [
    { label: '注册用户', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-500' },
    { label: '在线用户', value: stats.onlineUsers.toString(), icon: Zap, color: 'bg-purple-500' },
    { label: '今日注册', value: stats.todayReg.toString(), icon: Users, color: 'bg-green-500' },
    { label: '充值总额', value: '¥' + stats.totalRecharge.toLocaleString(), icon: DollarSign, color: 'bg-amber-500' },
    { label: '提现总额', value: '¥' + stats.totalWithdraw.toLocaleString(), icon: DollarSign, color: 'bg-rose-500' },
    { label: '平台盈亏', value: '¥' + stats.platformProfit.toLocaleString(), icon: TrendingUp, color: 'bg-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">数据看板</h1>
        <button onClick={refreshData} className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="刷新数据">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4">
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold mt-2">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Review */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> 待审核事项
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pendingItems.map(item => (
              <AdminNavLink
                key={item.label}
                to={item.path}
                className="p-3 bg-muted rounded-lg text-left hover:bg-[#003366]/10 transition-colors block"
              >
                <p className="text-2xl font-bold text-[#003366]">{item.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </AdminNavLink>
            ))}
          </div>
        </div>

        {/* Quick Navigation - 所有功能 */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">功能导航</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { label: '用户管理', icon: Users, path: '/admin/users', color: 'bg-blue-500' },
              { label: '实名审核', icon: Shield, path: '/admin/auth-review', color: 'bg-amber-500' },
              { label: '银行卡审核', icon: DollarSign, path: '/admin/bank-review', color: 'bg-purple-500' },
              { label: '充值审核', icon: DollarSign, path: '/admin/recharge', color: 'bg-green-500' },
              { label: '提现审核', icon: DollarSign, path: '/admin/withdraw', color: 'bg-rose-500' },
              { label: '盈亏控制台', icon: Zap, path: '/admin/win-lose', color: 'bg-red-600' },
              { label: '大盘调控', icon: TrendingUp, path: '/admin/market-control', color: 'bg-red-500' },
              { label: '盈亏查询', icon: TrendingUp, path: '/admin/user-profit', color: 'bg-cyan-500' },
              { label: '股票管理', icon: BarChart3, path: '/admin/stocks', color: 'bg-indigo-500' },
              { label: '资金流水', icon: Clock, path: '/admin/capital-flow', color: 'bg-teal-500' },
              { label: '资讯管理', icon: Settings, path: '/admin/news', color: 'bg-pink-500' },
              { label: '系统设置', icon: Settings, path: '/admin/settings', color: 'bg-gray-500' },
              { label: '操作日志', icon: Clock, path: '/admin/logs', color: 'bg-orange-500' },
            ].map(item => (
              <AdminNavLink key={item.label} to={item.path}
                className="flex flex-col items-center gap-1.5 p-3 bg-muted rounded-lg hover:bg-[#003366]/10 transition-colors active:scale-95">
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
              </AdminNavLink>
            ))}
          </div>
        </div>

        {/* No Data Hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-800">数据统计基于真实用户操作</p>
          <p className="text-xs text-amber-600 mt-1">有用户注册、充值、提现后，此处将自动更新</p>
        </div>
      </div>
    </div>
  )
}
