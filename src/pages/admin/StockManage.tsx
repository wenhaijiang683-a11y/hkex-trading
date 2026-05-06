import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import {
  ArrowLeft, Plus, Trash2, Edit3, TrendingUp, TrendingDown, Search, Check, X
} from 'lucide-react'

export default function AdminStockManage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [editingCode, setEditingCode] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editChange, setEditChange] = useState('')
  const [editChangePercent, setEditChangePercent] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newStock, setNewStock] = useState({ code: '', name: '', nameEn: '', price: '' })

  const stocksQuery = trpc.stock.list.useQuery()
  const deleteMutation = trpc.stock.delete.useMutation({
    onSuccess: () => stocksQuery.refetch()
  })
  const updateMutation = trpc.stock.update.useMutation({
    onSuccess: () => { stocksQuery.refetch(); setEditingCode('') }
  })
  const createMutation = trpc.stock.create.useMutation({
    onSuccess: () => { stocksQuery.refetch(); setShowAdd(false); setNewStock({ code: '', name: '', nameEn: '', price: '' }) }
  })

  const allStocks = stocksQuery.data || []

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => stocksQuery.refetch(), 5000)
    return () => clearInterval(timer)
  }, [stocksQuery])

  const filtered = search
    ? allStocks.filter((s: any) =>
        s.code?.includes(search) ||
        s.name?.includes(search) ||
        s.nameEn?.toLowerCase().includes(search.toLowerCase())
      )
    : allStocks

  const handleDelete = (code: string, id: number) => {
    if (confirm(`确定删除 ${code}？`)) {
      deleteMutation.mutate({ id })
    }
  }

  const handleEdit = (s: any) => {
    setEditingCode(s.code)
    setEditPrice(String(s.price || 0))
    setEditChange(String(s.change || 0))
    setEditChangePercent(String(s.changePercent || 0))
  }

  const handleSaveEdit = (id: number) => {
    updateMutation.mutate({
      id,
      price: parseFloat(editPrice) || 0,
      change: parseFloat(editChange) || 0,
      changePercent: parseFloat(editChangePercent) || 0,
    })
  }

  const handleAddStock = () => {
    if (!newStock.code || !newStock.name) { alert('请填写股票代码和名称'); return }
    createMutation.mutate({
      code: newStock.code,
      name: newStock.name,
      nameEn: newStock.nameEn,
      price: parseFloat(newStock.price) || 0,
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">股票管理</h1>
        <button onClick={() => stocksQuery.refetch()} className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">刷新</button>
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">港股</p>
            <p className="text-xl font-bold text-[#003366]">{allStocks.filter((s: any) => s.market === '港股').length}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">上涨</p>
            <p className="text-xl font-bold text-red-500">{allStocks.filter((s: any) => (s.change || 0) > 0).length}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">下跌</p>
            <p className="text-xl font-bold text-green-500">{allStocks.filter((s: any) => (s.change || 0) < 0).length}</p>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索股票代码/名称"
              className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-sm outline-none" />
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#003366] text-white rounded-xl text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>

        {/* Stock List */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-3 text-left">股票</th>
                <th className="px-3 py-3 text-right">价格</th>
                <th className="px-3 py-3 text-right">涨跌</th>
                <th className="px-3 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <td className="px-3 py-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.code} · {s.market}</p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {editingCode === s.code ? (
                      <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                        className="w-20 px-2 py-1 bg-muted rounded text-right text-sm" />
                    ) : (
                      <span className="font-medium">{s.price?.toFixed ? s.price.toFixed(2) : s.price}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {editingCode === s.code ? (
                      <div className="flex flex-col gap-1 items-end">
                        <input type="number" value={editChange} onChange={e => setEditChange(e.target.value)}
                          className="w-20 px-2 py-1 bg-muted rounded text-right text-sm" placeholder="涨跌" />
                        <input type="number" value={editChangePercent} onChange={e => setEditChangePercent(e.target.value)}
                          className="w-20 px-2 py-1 bg-muted rounded text-right text-sm" placeholder="%" />
                      </div>
                    ) : (
                      <div className={`flex items-center justify-end gap-1 ${(s.change || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {(s.change || 0) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{(s.change || 0) > 0 ? '+' : ''}{s.change?.toFixed ? s.change.toFixed(2) : s.change} ({s.changePercent?.toFixed ? s.changePercent.toFixed(2) : s.changePercent}%)</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {editingCode === s.code ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleSaveEdit(s.id)} className="p-1 text-green-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCode('')} className="p-1 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(s)} className="p-1 text-[#003366]"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.code, s.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">没有找到股票</div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-sm bg-background rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">添加股票</h3>
            <div className="space-y-3">
              <input type="text" value={newStock.code} onChange={e => setNewStock({ ...newStock, code: e.target.value })} placeholder="股票代码（如 09999）" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="text" value={newStock.name} onChange={e => setNewStock({ ...newStock, name: e.target.value })} placeholder="股票名称" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="text" value={newStock.nameEn} onChange={e => setNewStock({ ...newStock, nameEn: e.target.value })} placeholder="英文名称（可选）" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <input type="number" value={newStock.price} onChange={e => setNewStock({ ...newStock, price: e.target.value })} placeholder="价格" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border rounded-lg text-sm">取消</button>
              <button onClick={handleAddStock} className="flex-1 py-2 bg-[#003366] text-white rounded-lg text-sm">添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
