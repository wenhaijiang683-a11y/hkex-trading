import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function Asset() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const userPhone = user?.phone || localStorage.getItem('user_phone') || ''

  // 从后端API获取最新用户数据
  const profileQuery = trpc.user.getProfile.useQuery(
    { phone: userPhone },
    { enabled: !!userPhone }
  )

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => profileQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [profileQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    profileQuery.refetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500)
    })
  }

  // 优先使用后端数据，fallback到localStorage
  const profile = profileQuery.data
  const balance = profile?.balance ?? user?.balance ?? 0
  const holdValue = profile?.holdValue ?? user?.holdValue ?? 0
  const frozen = profile?.frozen ?? user?.frozen ?? 0
  const totalProfit = profile?.totalProfit ?? user?.totalProfit ?? 0
  const todayProfit = profile?.todayProfit ?? user?.todayProfit ?? 0
  const points = profile?.points ?? user?.points ?? 0

  const totalAsset = balance + holdValue

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">我的资产</h1>
        <button onClick={handleRefresh} className={`ml-auto p-1.5 ${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Asset */}
        <div className="bg-gradient-to-br from-[#003366] to-[#004080] rounded-2xl p-6 text-white">
          <p className="text-white/60 text-sm">总资产 (HKD)</p>
          <p className="text-3xl font-bold mt-1">¥{totalAsset.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            {(todayProfit || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-300" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-300" />
            )}
            <span className={`text-sm ${(todayProfit || 0) >= 0 ? 'text-red-300' : 'text-green-300'}`}>
              今日{(todayProfit || 0) >= 0 ? '+' : ''}{(todayProfit || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detail Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">可用余额</p>
            <p className="text-lg font-semibold mt-1">¥{balance.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">持仓市值</p>
            <p className="text-lg font-semibold mt-1">¥{holdValue.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">冻结金额</p>
            <p className="text-lg font-semibold mt-1">¥{frozen.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">累计盈亏</p>
            <p className={`text-lg font-semibold mt-1 ${(totalProfit || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              ¥{(totalProfit || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Points */}
        <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">积分余额</p>
            <p className="text-xs text-muted-foreground">可用于兑换服务</p>
          </div>
          <p className="text-xl font-bold text-[#003366]">{points.toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/user/recharge')} className="py-3 bg-[#003366] text-white rounded-xl font-medium">
            充值
          </button>
          <button onClick={() => navigate('/user/withdraw')} className="py-3 border border-[#003366] text-[#003366] rounded-xl font-medium">
            提现
          </button>
        </div>
      </div>
    </div>
  )
}
