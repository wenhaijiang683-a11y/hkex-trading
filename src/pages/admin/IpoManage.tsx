import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react'
import { addAdminLog } from './AdminLogs'

interface IpoRecord {
  id: number
  code: string
  name: string
  sponsor: string
  issuePrice: string
  listingDate: string
  status: string
  createdAt: string
}

function getIpos(): IpoRecord[] {
  try {
    const saved = localStorage.getItem('hkex_ipo_list')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function saveIpos(ipos: IpoRecord[]) {
  localStorage.setItem('hkex_ipo_list', JSON.stringify(ipos))
}

export default function AdminIpo() {
  const navigate = useNavigate()
  const [ipos, setIpos] = useState<IpoRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ code: '', name: '', sponsor: '', issuePrice: '', listingDate: '', status: '招股中' })

  useEffect(() => {
    setIpos(getIpos())
  }, [])

  const handleAdd = () => {
    if (!form.code || !form.name) { alert('请填写股票代码和名称'); return }
    const newIpo: IpoRecord = {
      id: Date.now(),
      code: form.code,
      name: form.name,
      sponsor: form.sponsor,
      issuePrice: form.issuePrice,
      listingDate: form.listingDate,
      status: form.status,
      createdAt: new Date().toLocaleString(),
    }
    const updated = [newIpo, ...ipos]
    saveIpos(updated)
    setIpos(updated)
    addAdminLog(`添加新股 ${form.name} (${form.code})`, form.code, '新股管理')
    setShowForm(false)
    setForm({ code: '', name: '', sponsor: '', issuePrice: '', listingDate: '', status: '招股中' })
    alert('添加成功')
  }

  const handleEdit = (ipo: IpoRecord) => {
    setEditingId(ipo.id)
    setForm({
      code: ipo.code,
      name: ipo.name,
      sponsor: ipo.sponsor,
      issuePrice: ipo.issuePrice,
      listingDate: ipo.listingDate,
      status: ipo.status,
    })
    setShowForm(true)
  }

  const handleUpdate = () => {
    const updated = ipos.map(i => i.id === editingId ? { ...i, ...form } : i)
    saveIpos(updated)
    setIpos(updated)
    addAdminLog(`编辑新股 ${form.name} (${form.code})`, form.code, '新股管理')
    setShowForm(false)
    setEditingId(null)
    setForm({ code: '', name: '', sponsor: '', issuePrice: '', listingDate: '', status: '招股中' })
    alert('修改成功')
  }

  const handleDelete = (id: number) => {
    const ipo = ipos.find(i => i.id === id)
    if (!confirm(`确定删除 ${ipo?.name || '该股'}？`)) return
    const updated = ipos.filter(i => i.id !== id)
    saveIpos(updated)
    setIpos(updated)
    addAdminLog(`删除新股 ${ipo?.name || ''} (${ipo?.code || ''})`, ipo?.code || '', '新股管理')
    alert('已删除')
  }

  const openForm = () => {
    setEditingId(null)
    setForm({ code: '', name: '', sponsor: '', issuePrice: '', listingDate: '', status: '招股中' })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">新股管理</h1>
        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">{ipos.length}只</span>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4">
        <button onClick={openForm} className="w-full py-3 bg-[#003366] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> 添加新股
        </button>

        {ipos.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">暂无新股数据</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ipos.map(ipo => (
              <div key={ipo.id} className="bg-card border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ipo.name} <span className="text-xs text-muted-foreground">{ipo.code}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">保荐人: {ipo.sponsor || '-'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ipo.status === '招股中' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{ipo.status}</span>
                </div>
                <p className="text-sm mt-2">发行价: {ipo.issuePrice || '-'} | 上市日: {ipo.listingDate || '-'}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(ipo)} className="flex-1 py-2 border rounded-lg text-sm flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" /> 编辑</button>
                  <button onClick={() => handleDelete(ipo.id)} className="flex-1 py-2 border border-red-200 text-red-500 rounded-lg text-sm flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> 删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full bg-background rounded-t-2xl p-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">{editingId ? '编辑新股' : '添加新股'}</h3>
            <div className="mt-4 space-y-3">
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="股票名称" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="股票代码" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="text" value={form.sponsor} onChange={e => setForm({ ...form, sponsor: e.target.value })} placeholder="保荐人" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="text" value={form.issuePrice} onChange={e => setForm({ ...form, issuePrice: e.target.value })} placeholder="发行价区间" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="date" value={form.listingDate} onChange={e => setForm({ ...form, listingDate: e.target.value })} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none">
                <option>招股中</option>
                <option>待上市</option>
                <option>已上市</option>
              </select>
              <button onClick={editingId ? handleUpdate : handleAdd} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">
                {editingId ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
