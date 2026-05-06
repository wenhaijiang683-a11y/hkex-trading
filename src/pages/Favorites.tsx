import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockList, cryptoAndGold } from '@/data/stockData'
import { ArrowLeft, Star, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]')
  })

  const allStocks = [...stockList, ...cryptoAndGold]
  const favStocks = allStocks.filter(s => favorites.includes(s.code))

  const removeFav = (code: string) => {
    const newFavs = favorites.filter(f => f !== code)
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify(newFavs))
  }

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">我的自选</h1>
        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{favorites.length}只</span>
      </div>

      <div className="p-4 space-y-3">
        {favStocks.length === 0 && (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">暂无自选股票</p>
            <button onClick={() => navigate('/market')} className="mt-3 px-4 py-2 bg-[#003366] text-white rounded-lg text-sm">
              去行情中心添加
            </button>
          </div>
        )}

        {favStocks.map(stock => (
          <div key={stock.code}
            className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/stock/${stock.code}`)}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                stock.changePercent >= 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                {stock.name[0]}
              </div>
              <div>
                <p className="font-semibold">{stock.name}</p>
                <p className="text-xs text-muted-foreground">{stock.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <div className={`flex items-center gap-1 justify-end text-xs ${stock.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                {stock.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); removeFav(stock.code) }}
              className="ml-2 p-2 hover:bg-red-50 rounded-full transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
