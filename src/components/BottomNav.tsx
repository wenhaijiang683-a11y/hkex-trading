import { Link, useLocation } from 'react-router-dom'
import { Home, BarChart3, Star, MessageCircle, User } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()

  const tabs = [
    { path: '/index', label: '首页', icon: Home },
    { path: '/market', label: '行情', icon: BarChart3 },
    { path: '/favorites', label: '自选', icon: Star },
    { path: '/service', label: '客服', icon: MessageCircle },
    { path: '/user/account', label: '我的', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-14 pb-safe">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive ? 'text-[#003366]' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px]">{tab.label}</span>
              {isActive && <span className="absolute bottom-1 w-5 h-0.5 bg-[#003366] rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
