import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Gift, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react'
import { pointsProducts } from '../../data/stockData'

export default function Points() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showConfirm, setShowConfirm] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState('')
  const [records, setRecords] = useState<{name: string, time: string, points: number}[]>([
    { name: '腾讯视频月卡', time: '2026-05-15', points: 500 }
  ])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">请先登录</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-[#003366] text-white rounded-lg">去登录</button>
      </div>
    )
  }

  const handleExchange = (productId: number) => {
    const product = pointsProducts.find(p => p.id === productId)
    if (!product) return

    // 检查积分是否足够
    if (user.points <= 0) {
      setShowError('积分不足，当前积分为0')
      setShowConfirm(null)
      return
    }
    if (user.points < product.points) {
      setShowError(`积分不足，当前 ${user.points} 积分，需要 ${product.points} 积分`)
      setShowConfirm(null)
      return
    }

    // 扣除积分
    const newPoints = user.points - product.points
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    userData.points = newPoints
    localStorage.setItem('user_data', JSON.stringify(userData))
    user.points = newPoints

    // 添加兑换记录
    setRecords(prev => [{ name: product.name, time: new Date().toISOString().slice(0, 10), points: product.points }, ...prev])

    // 关闭确认弹窗，显示成功弹窗
    setShowConfirm(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">积分商城</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-[#F5A623] to-[#e09516] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm text-white/80">我的积分</span>
          </div>
          <p className="text-3xl font-bold mt-2">{user.points.toLocaleString()} <span className="text-base font-normal">分</span></p>
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold mb-3">可兑换商品</h3>
          <div className="grid grid-cols-2 gap-3">
            {pointsProducts.map(p => {
              const canAfford = user.points >= p.points
              return (
                <div key={p.id} className="bg-card border rounded-xl p-3">
                  <div className="w-full h-24 bg-gradient-to-br from-[#003366]/10 to-[#F5A623]/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#003366]" />
                  </div>
                  <p className="text-sm font-medium mt-2">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-bold ${canAfford ? 'text-[#F5A623]' : 'text-muted-foreground'}`}>{p.points}积分</span>
                    <span className="text-xs text-muted-foreground">剩{p.stock}</span>
                  </div>
                  <button
                    onClick={() => canAfford ? setShowConfirm(p.id) : setShowError(`积分不足，需要 ${p.points} 积分`)}
                    disabled={!canAfford}
                    className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      canAfford ? 'bg-[#003366] text-white hover:bg-[#002855]' : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '兑换' : '积分不足'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Records */}
        <div>
          <h3 className="font-semibold mb-2">兑换记录</h3>
          {records.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-xl">
              <p>暂无兑换记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.time}</p>
                  </div>
                  <span className="text-sm text-[#F5A623] font-medium">-{r.points}积分</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowConfirm(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-center">确认兑换</h3>
            <p className="text-center text-muted-foreground mt-2">
              {pointsProducts.find(p => p.id === showConfirm)?.name}
            </p>
            <p className="text-center text-[#F5A623] font-bold mt-1">
              -{pointsProducts.find(p => p.id === showConfirm)?.points}积分
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 border rounded-xl text-sm">取消</button>
              <button onClick={() => handleExchange(showConfirm)} className="flex-1 py-2.5 bg-[#003366] text-white rounded-xl text-sm">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - 居中显示完成 */}
      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-8 w-full max-w-[280px] animate-scale-in flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-center">完成</p>
          </div>
        </div>
      )}

      {/* Error Modal - 积分不足 */}
      {showError && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={() => setShowError('')}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background rounded-2xl p-8 w-full max-w-[320px] animate-scale-in flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-base font-semibold text-center text-red-600">积分不足</p>
            <p className="text-sm text-muted-foreground text-center mt-2">{showError}</p>
            <button onClick={() => setShowError('')} className="w-full mt-4 py-2.5 bg-[#003366] text-white rounded-xl text-sm">确定</button>
          </div>
        </div>
      )}
    </div>
  )
}
