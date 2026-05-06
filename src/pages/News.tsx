import { useState } from 'react'
import { newsList } from '@/data/stockData'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Tag } from 'lucide-react'

export default function News() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('全部')
  const categories = ['全部', '要闻', '公告', '研报']

  const filtered = category === '全部' ? newsList : newsList.filter(n => n.category === category)

  return (
    <div className="pb-16 md:pb-4 max-w-7xl mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">资讯中心</h1>
      </div>
      <div className="pt-14 px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold">最新资讯</h1>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === c ? 'bg-[#003366] text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(news => (
          <div key={news.id} className="bg-card border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                {news.category === '要闻' ? '新' : news.category === '公告' ? '公' : '研'}
              </span>
              <div className="flex-1">
                <h3 className="font-medium leading-snug">{news.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{news.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {news.source}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {news.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}
