import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, FileText } from 'lucide-react'

export default function AdminBankReview() {
  const navigate = useNavigate()
  const [tab, _setTab] = useState('approved')

  const cardsQuery = trpc.admin.getAllBankCards.useQuery()
  const usersQuery = trpc.user.getAll.useQuery()
  
  const allCards = cardsQuery.data || []
  const allUsers = usersQuery.data || []

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => cardsQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [cardsQuery])

  const cardsWithUser = allCards.map((card: any) => {
    const user = allUsers.find((u: any) => u.dbId === card.userId)
    return {
      id: card.id,
      userId: card.userId,
      name: user?.name || '未知用户',
      phone: user?.phone || '-',
      bank: card.bank,
      cardNo: card.cardNo,
      branch: card.branch,
      submitTime: card.createdAt ? new Date(card.createdAt).toLocaleString() : '-',
      status: 'approved' as const,
    }
  })

  const approved = cardsWithUser

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">银行卡审核</h1>
        <button onClick={() => cardsQuery.refetch()} className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">刷新</button>
      </div>
      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
          <button className={`flex-1 py-2 text-sm font-medium rounded-md ${tab === 'approved' ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'}`}>
            已绑卡 ({approved.length})
          </button>
        </div>
        
        {approved.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无已绑卡记录</p>
            <p className="text-xs mt-1">用户绑定银行卡后将自动显示在此处</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr><th className="px-4 py-3 text-left">用户</th><th className="px-4 py-3 text-left">银行</th><th className="px-4 py-3 text-left">卡号</th><th className="px-4 py-3 text-left">时间</th></tr>
              </thead>
              <tbody className="divide-y">
                {approved.map(b => (
                  <tr key={b.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.phone}</p>
                    </td>
                    <td className="px-4 py-3">{b.bank}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.cardNo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b.submitTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
