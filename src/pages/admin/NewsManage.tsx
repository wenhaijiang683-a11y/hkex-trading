import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react'
import { addAdminLog } from './AdminLogs'

interface NewsRecord {
  id: number
  title: string
  category: string
  content: string
  source: string
  time: string
}

function getNews(): NewsRecord[] {
  try {
    const saved = localStorage.getItem('hkex_news_list')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function saveNews(news: NewsRecord[]) {
  localStorage.setItem('hkex_news_list', JSON.stringify(news))
}

export default function AdminNews() {
  const navigate = useNavigate()
  const [news, setNews] = useState<NewsRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', category: '要闻', content: '', source: '平台公告' })

  useEffect(() => {
    setNews(getNews())
  }, [])

  const handlePublish = () => {
    if (!form.title) { alert('请填写标题'); return }
    const newNews: NewsRecord = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      content: form.content,
      source: form.source,
      time: new Date().toLocaleString(),
    }
    const updated = [newNews, ...news]
    saveNews(updated)
    setNews(updated)
    addAdminLog(`发布资讯：${form.title}`, '-', '资讯管理')
    setShowForm(false)
    setForm({ title: '', category: '要闻', content: '', source: '平台公告' })
    alert('发布成功')
  }

  const handleEdit = (item: NewsRecord) => {
    setEditingId(item.id)
    setForm({ title: item.title, category: item.category, content: item.content, source: item.source })
    setShowForm(true)
  }

  const handleUpdate = () => {
    const updated = news.map(n => n.id === editingId ? { ...n, ...form, time: new Date().toLocaleString() } : n)
    saveNews(updated)
    setNews(updated)
    addAdminLog(`编辑资讯：${form.title}`, '-', '资讯管理')
    setShowForm(false)
    setEditingId(null)
    setForm({ title: '', category: '要闻', content: '', source: '平台公告' })
    alert('修改成功')
  }

  const handleDelete = (id: number) => {
    const item = news.find(n => n.id === id)
    if (!confirm(`确定删除「${item?.title || '该资讯'}」？`)) return
    const updated = news.filter(n => n.id !== id)
    saveNews(updated)
    setNews(updated)
    addAdminLog(`删除资讯：${item?.title}`, '-', '资讯管理')
    alert('已删除')
  }

  const openForm = () => {
    setEditingId(null)
    setForm({ title: '', category: '要闻', content: '', source: '平台公告' })
    setShowForm(true)
  }

  const categoryColors: Record<string, string> = {
    '要闻': 'bg-red-100 text-red-700',
    '公告': 'bg-blue-100 text-blue-700',
    '研报': 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">资讯管理</h1>
        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">{news.length}条</span>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4">
        <button onClick={openForm} className="w-full py-3 bg-[#003366] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> 发布资讯
        </button>

        {news.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">暂无资讯</p>
            <p className="text-xs mt-1">点击上方按钮发布</p>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map(item => (
              <div key={item.id} className="bg-card border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${categoryColors[item.category] || 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.source} · {item.time}</p>
                    {item.content && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.content}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(item)} className="flex-1 py-1.5 border rounded-lg text-xs flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" /> 编辑</button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> 删除</button>
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
            <h3 className="font-semibold text-lg">{editingId ? '编辑资讯' : '发布资讯'}</h3>
            <div className="mt-4 space-y-3">
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="标题" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none">
                  <option>要闻</option><option>公告</option><option>研报</option>
                </select>
                <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="来源" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="内容" rows={4} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm outline-none resize-none" />
              <button onClick={editingId ? handleUpdate : handlePublish} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">
                {editingId ? '保存修改' : '确认发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
