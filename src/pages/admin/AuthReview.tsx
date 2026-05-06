import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { rejectReasons } from '../../data/stockData'

interface AuthItem {
  id: number
  name: string
  phone: string
  realName: string
  idCard: string
  submitTime: string
  status: string
}

export default function AdminAuthReview() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [showReject, setShowReject] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [authData, setAuthData] = useState<AuthItem[]>([])

  const subsQuery = trpc.admin.getAuthSubmissions.useQuery()
  const approveMutation = trpc.admin.approveAuth.useMutation()

  useEffect(() => {
    if (subsQuery.data) {
      setAuthData(subsQuery.data.map((s: any) => ({
        id: s.id,
        name: s.name || '未知用户',
        phone: s.phone || '-',
        realName: s.realName || '-',
        idCard: s.idCard ? s.idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2') : '-',
        submitTime: s.submitTime || '-',
        status: s.status === 'pending' ? 'pending' : s.status === 'approved' ? 'approved' : 'rejected',
      })))
    }
  }, [subsQuery.data])

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => subsQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [subsQuery])

  const pendingData = authData.filter(d => d.status === 'pending')
  const approvedData = authData.filter(d => d.status === 'approved' || d.status === 'rejected')

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id, approved: true }, {
      onSuccess: () => {
        subsQuery.refetch()
        alert('审核通过！')
      },
      onError: (err) => alert(err.message),
    })
  }

  const handleReject = (id: number) => {
    if (!rejectReason) { alert('请选择驳回原因'); return }
    approveMutation.mutate({ id, approved: false, rejectReason }, {
      onSuccess: () => {
        setShowReject(null)
        subsQuery.refetch()
        alert('已驳回: ' + rejectReason)
      },
      onError: (err) => alert(err.message),
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">实名认证审核</h1>
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {[
            { key: 'pending', label: `待审核 (${pendingData.length})` },
            { key: 'approved', label: '已审核' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 text-sm font-medium rounded-md ${tab === t.key ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'pending' && (
          <>
            {pendingData.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">暂无待审核实名认证</p>
                <p className="text-xs mt-1">用户提交实名认证后将自动显示在此处</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingData.map(d => (
                  <div key={d.id} className="bg-card border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">用户：</span>{d.name} ({d.phone})</p>
                        <p><span className="text-muted-foreground">真实姓名：</span>{d.realName}</p>
                        <p><span className="text-muted-foreground">身份证号：</span>{d.idCard}</p>
                        <p><span className="text-muted-foreground">提交时间：</span>{d.submitTime}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleApprove(d.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4" /> 通过
                        </button>
                        <button onClick={() => setShowReject(d.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">
                          <XCircle className="w-4 h-4" /> 驳回
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'approved' && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">用户</th>
                  <th className="px-4 py-3 text-left">真实姓名</th>
                  <th className="px-4 py-3 text-left">身份证号</th>
                  <th className="px-4 py-3 text-left">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {approvedData.map(d => (
                  <tr key={d.id}>
                    <td className="px-4 py-3">{d.name}<br /><span className="text-xs text-muted-foreground">{d.phone}</span></td>
                    <td className="px-4 py-3">{d.realName}</td>
                    <td className="px-4 py-3">{d.idCard}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {d.status === 'approved' ? '已通过' : '已驳回'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {approvedData.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">暂无已审核记录</div>
            )}
          </div>
        )}

        {/* Reject Modal */}
        {showReject !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowReject(null)} />
            <div className="relative w-full max-w-sm bg-background rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">选择驳回原因</h3>
              <div className="space-y-2">
                {rejectReasons.map(r => (
                  <button key={r} onClick={() => setRejectReason(r)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${rejectReason === r ? 'bg-[#003366] text-white' : 'bg-muted hover:bg-muted/80'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowReject(null)} className="flex-1 py-2 border rounded-lg text-sm">取消</button>
                <button onClick={() => handleReject(showReject)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm">确认驳回</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
