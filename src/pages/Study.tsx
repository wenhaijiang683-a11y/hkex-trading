import { useState } from 'react'
import { studyList, glossary } from '@/data/stockData'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, BookOpen, Play, FileText } from 'lucide-react'

export default function Study() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('教程')
  const [search, setSearch] = useState('')
  const tabs = ['教程', '术语百科']

  const filteredGlossary = search
    ? glossary.filter(g => g.term.toLowerCase().includes(search.toLowerCase()) || g.definition.includes(search))
    : glossary

  return (
    <div className="pb-16 md:pb-4 max-w-7xl mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">投资学堂</h1>
      </div>
      <div className="pt-14 px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold">投资者学堂</h1>

      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t ? 'bg-white dark:bg-card shadow-sm text-[#003366]' : 'text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '教程' && (
        <div className="space-y-3">
          {studyList.map(item => (
            <div key={item.id} className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
              <div className="w-16 h-16 bg-[#003366]/10 rounded-xl flex items-center justify-center shrink-0">
                {item.type === '视频' ? <Play className="w-7 h-7 text-[#003366]" /> : <BookOpen className="w-7 h-7 text-[#003366]" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {item.type}</span>
                  <span>{item.readCount.toLocaleString()} 次阅读</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === '术语百科' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索术语"
              className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#003366]/30"
            />
          </div>
          <div className="space-y-3">
            {filteredGlossary.map((item, i) => (
              <div key={i} className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold text-[#003366]">{item.term}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">未找到匹配的术语</div>
            )}
          </div>
        </>
      )}
    </div>
    </div>
  )
}
