import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Building2, FileText } from 'lucide-react'
import { trpc } from '@/providers/trpc'

interface WithdrawRecord {
  id: number
  amount: number
  bank: string
  status: string
  time: string
}

export default function AdminWithdraw() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [records, setRecords] = useState<WithdrawRecord[]>([])

  const recordsQuery = trpc.finance.getAllWithdraws.useQuery()
  const approveMutation = trpc.finance.approveWithdraw.useMutation()

  useEffect(() => {
    if (recordsQuery.data) {
      setRecords(recordsQuery.data.map((r: any) => ({
        id: r.id,
        amount: Number(r.amount),
        bank: r.bank,
        status: r.status === 'pending' ? '审核中' : r.status === 'approved' ? '已放款' : '已驳回',
        time: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
      })))
    }
  }, [recordsQuery.data])

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => recordsQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [recordsQuery])

  const pendingOrders = records.filter(r => r.status === '审核中')
  const completedOrders = records.filter(r => r.status !== '审核中')

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id, approved: true }, {
      onSuccess: () => {
        recordsQuery.refetch()
        alert('已通过，请线下转账')
      },
      onError: (err) => alert(err.message),
    })
  }

  const handleReject = (id: number) => {
    approveMutation.mutate({ id, approved: false }, {
      onSuccess: () => {
        recordsQuery.refetch()
        alert('已驳回，余额已退还用户')
      },
      onError: (err) => alert(err.message),
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">提现订单</h1>
      </div>
      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['pending', 'completed'].map(k => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 text-sm font-medium rounded-md ${tab === k ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'}`}>
              {k === 'pending' ? `待审核 (${pendingOrders.length})` : '已完成'}
            </button>
          ))}
        </div>

        {records.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无提现订单</p>
            <p className="text-xs mt-1">用户提现后将自动显示在此处</p>
          </div>
        ) : (
          <>
            {tab === 'pending' && (
              <>
                {pendingOrders.length === 0 ? (
                  <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                    暂无待审核订单
                  </div>
                ) : (
                  pendingOrders.map(o => (
                    <div key={o.id} className="bg-card border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">#{o.id}</p>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">待审核</span>
                      </div>
                      <p className="text-lg font-bold text-rose-500 mt-1">¥{o.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> {o.bank}</p>
                      <p className="text-xs text-muted-foreground">{o.time}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleApprove(o.id)} className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> 通过</button>
                        <button onClick={() => handleReject(o.id)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center justify-center gap-1"><XCircle className="w-4 h-4" /> 驳回</button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
            {tab === 'completed' && (
              <>
                {completedOrders.length === 0 ? (
                  <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                    暂无已完成订单
                  </div>
                ) : (
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted"><tr><th className="px-4 py-3 text-left">订单号</th><th className="px-4 py-3 text-left">金额</th><th className="px-4 py-3 text-left">状态</th></tr></thead>
                      <tbody className="divide-y">
                        {completedOrders.map(o => (
                          <tr key={o.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-xs">#{o.id}</td>
                            <td className="px-4 py-3 font-medium">¥{o.amount.toLocaleString()}</td>
                            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === '已放款' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
