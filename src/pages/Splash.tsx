import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 金融监管机构Logo墙 - 纯CSS实现
const regulators = [
  { abbr: 'ASIC', full: 'Australian Securities and Investments Commission' },
  { abbr: 'FCA', full: 'Financial Conduct Authority' },
  { abbr: 'SEC', full: 'U.S. Securities and Exchange Commission' },
  { abbr: 'NFA', full: 'National Futures Association' },
  { abbr: 'MAS', full: 'Monetary Authority of Singapore' },
  { abbr: 'SFC', full: 'Securities and Futures Commission' },
]

// HKEX字母墙数据
const letterWall = [
  { char: 'H', delay: 0.0 },
  { char: 'K', delay: 0.1 },
  { char: 'E', delay: 0.2 },
  { char: 'X', delay: 0.3 },
]

export default function Splash() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [letterIndex, setLetterIndex] = useState(-1)

  useEffect(() => {
    // 字母依次亮起动画
    letterWall.forEach((_, i) => {
      setTimeout(() => setLetterIndex(i), i * 200 + 300)
    })

    // 进度条动画
    const pTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(pTimer)
          return 100
        }
        return p + 2
      })
    }, 50)

    // 2.5秒后跳转
    const timer = setTimeout(() => {
      const hasSeenSplash = localStorage.getItem('has_seen_splash')
      if (hasSeenSplash) {
        navigate('/login')
      } else {
        localStorage.setItem('has_seen_splash', 'true')
        navigate('/login')
      }
    }, 2800)

    return () => { clearTimeout(timer); clearInterval(pTimer) }
  }, [navigate])

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#001530] via-[#002855] to-[#001a33] flex flex-col items-center justify-center overflow-hidden">
      {/* 顶部光效 */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#F5A623]/10 to-transparent pointer-events-none" />

      {/* 网格背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* ====== HKEX 字母墙 ====== */}
      <div className="relative z-10 flex items-center gap-1 md:gap-2 mb-6">
        {letterWall.map((l, i) => (
          <div
            key={l.char}
            className={`relative flex items-center justify-center w-[60px] h-[80px] md:w-[90px] md:h-[120px] font-black text-5xl md:text-7xl transition-all duration-500 ${
              i <= letterIndex
                ? 'text-white scale-100 opacity-100'
                : 'text-white/10 scale-90 opacity-30'
            }`}
            style={{
              textShadow: i <= letterIndex ? '0 0 40px rgba(245,166,35,0.5), 0 0 80px rgba(245,166,35,0.2)' : 'none',
              transitionDelay: `${l.delay}s`,
            }}
          >
            {/* 字母背景框 */}
            <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${
              i <= letterIndex
                ? 'border-[#F5A623]/40 bg-[#F5A623]/5'
                : 'border-white/5 bg-transparent'
            }`} />
            {/* 左上角装饰 */}
            <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 transition-all duration-500 ${
              i <= letterIndex ? 'border-[#F5A623]' : 'border-transparent'
            }`} />
            {/* 右下角装饰 */}
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 transition-all duration-500 ${
              i <= letterIndex ? 'border-[#F5A623]' : 'border-transparent'
            }`} />
            {l.char}
          </div>
        ))}
      </div>

      {/* 中文名称 */}
      <h1 className={`text-white text-xl md:text-2xl font-bold tracking-[0.5em] mb-2 transition-all duration-1000 ${
        letterIndex >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        香港交易所
      </h1>

      {/* 英文副标题 */}
      <p className={`text-white/40 text-sm md:text-base tracking-widest mb-10 transition-all duration-1000 delay-500 ${
        letterIndex >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        HKEX Trading Center
      </p>

      {/* 进度条 */}
      <div className="w-[200px] md:w-[280px] h-[2px] bg-white/10 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-[#F5A623] to-[#e09516] rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 标语 */}
      <p className={`text-white/30 text-xs tracking-[0.3em] transition-all duration-1000 ${
        progress > 50 ? 'opacity-100' : 'opacity-0'
      }`}>
        港股行情 · 模拟交易 · 智能工具
      </p>

      {/* ====== 底部监管机构Logo墙 ====== */}
      <div className={`absolute bottom-12 left-0 right-0 transition-all duration-1000 ${
        progress > 30 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex items-center justify-center gap-4 md:gap-8 px-4 flex-wrap">
          {regulators.map((r, i) => (
            <div
              key={r.abbr}
              className="flex flex-col items-center gap-1 group"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* 机构缩写 */}
              <span className="text-white/20 text-[10px] md:text-xs font-bold tracking-wider group-hover:text-[#F5A623]/60 transition-colors">
                {r.abbr}
              </span>
              {/* 底部小横线 */}
              <div className="w-6 h-[1px] bg-white/10 group-hover:bg-[#F5A623]/40 transition-colors" />
            </div>
          ))}
        </div>
        <p className="text-center text-white/15 text-[9px] mt-3 tracking-wider">
          受全球金融监管机构监督
        </p>
      </div>

      {/* 底部版权 */}
      <p className="absolute bottom-3 text-white/15 text-[10px] tracking-wider">
        &copy; 2026 香港交易所
      </p>
    </div>
  )
}
