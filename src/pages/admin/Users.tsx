import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import {
  ArrowLeft, Search, MapPin, Smartphone,
  Power, Lock, Eye
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  phone: string
  balance: number
  isOnline: boolean
  isRealName: boolean
  regTime: string
  location?: string
  device?: string
  ip?: string
  loginTime?: string
}

export default function AdminUsers() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])

  const usersQuery = trpc.user.getAll.useQuery()

  useEffect(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data.map((u: any) => ({
        id: u.id || String(u.dbId),
        name: u.name,
        phone: u.phone,
        balance: u.balance || 0,
        isOnline: u.isOnline || false,
        isRealName: u.isRealName || false,
        regTime: u.regTime || '-',
        location: '-',
        device: '-',
        ip: '-',
        loginTime: '-',
      })))
    }
  }, [usersQuery.data])

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => {
      usersQuery.refetch()
    }, 5000)
    return () => clearInterval(timer)
  }, [usersQuery])

  const filtered = search
    ? users.filter(u => u.name.includes(search) || u.phone.includes(search) || u.id.includes(search))
    : users

  const user = users.find(u => u.id === selectedUser)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">用户管理</h1>
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索用户ID/昵称/手机号"
            className="w-full pl-9 pr-4 py-2.5 bg-card border rounded-lg text-sm outline-none"
          />
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">在线: {users.filter(u => u.isOnline).length}</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">总用户: {users.length}</span>
        </div>

        {/* User List */}
        {users.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">暂无注册用户</p>
            <p className="text-xs mt-1">用户注册后将自动显示在此处</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
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
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 bg-[#003366]/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-[#003366]">{u.name[0]}</span>
                            </div>
                            {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">¥{u.balance.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isRealName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.isRealName ? '已认证' : '未认证'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedUser(u.id)} className="p-1.5 hover:bg-muted rounded" title="查看详情">
                            <Eye className="w-4 h-4 text-[#003366]" />
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded" title="强制下线" onClick={() => alert(`已强制用户 ${u.name} 下线`)}>
                            <Power className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {user && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setSelectedUser(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full md:w-96 bg-background rounded-t-2xl md:rounded-2xl p-6 animate-slide-up md:animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">用户详情</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">用户ID</span><span>{user.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">昵称</span><span>{user.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">手机号</span><span>{user.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">实名状态</span><span className={user.isRealName ? 'text-green-600' : 'text-amber-600'}>{user.isRealName ? '已认证' : '未认证'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">资产余额</span><span>¥{user.balance.toLocaleString()}</span></div>
              <div className="border-t pt-3 mt-3">
                <p className="text-muted-foreground mb-2">登录信息</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.location || '-'}</div>
                  <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {user.device || '-'}</div>
                  <div className="flex items-center gap-1">IP: {user.ip || '-'}</div>
                  <div className="flex items-center gap-1">登录时间: {user.loginTime || '-'}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button onClick={() => { alert(`已强制用户 ${user.name} 下线`); setSelectedUser(null) }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center justify-center gap-1">
                  <Power className="w-4 h-4" /> 强制下线
                </button>
                <button onClick={() => { alert('密码已重置为默认密码'); setSelectedUser(null) }} className="flex-1 py-2 border rounded-lg text-sm flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4" /> 重置密码
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
