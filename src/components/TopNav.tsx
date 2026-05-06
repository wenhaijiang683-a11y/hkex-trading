import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLang } from '../contexts/LangContext'
import {
  Search, Sun, Moon, Globe, User, LogOut,
  TrendingUp, Gift, Settings, ChevronDown
} from 'lucide-react'

export default function TopNav() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { lang, t, setLang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const navItems = [
    { path: '/index', label: t('nav.home') },
    { path: '/market', label: t('nav.market') },
    { path: '/ipo', label: t('nav.ipo') },
    { path: '/news', label: t('nav.news') },
    { path: '/study', label: t('nav.study') },
    { path: '/tool', label: t('nav.tools') },
    { path: '/about', label: t('nav.about') },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#003366]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/index" className="flex items-center gap-2">
          <img src="/logo_new.png" alt="HKEX" className="w-8 h-8" />
          <span className="text-white font-bold text-lg hidden sm:block">{t('app.name')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg px-2 py-1">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t('market.search')}
              className="bg-transparent border-none outline-none text-white text-sm w-28 placeholder:text-white/40 ml-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchVal) {
                  navigate(`/stock/${searchVal}`)
                  setSearchVal('')
                }
              }}
            />
          </div>

          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              onBlur={() => setTimeout(() => setShowLangMenu(false), 150)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <Globe className="w-5 h-5 text-white" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg py-1 min-w-[80px] z-50">
                <div className={`px-3 py-1.5 text-sm hover:bg-muted cursor-pointer ${lang === 'zh-TW' ? 'text-[#003366] font-bold' : ''}`} onClick={() => { setLang('zh-TW'); setShowLangMenu(false) }}>繁體中文</div>
                <div className={`px-3 py-1.5 text-sm hover:bg-muted cursor-pointer ${lang === 'zh-CN' ? 'text-[#003366] font-bold' : ''}`} onClick={() => { setLang('zh-CN'); setShowLangMenu(false) }}>简体中文</div>
                <div className={`px-3 py-1.5 text-sm hover:bg-muted cursor-pointer ${lang === 'en' ? 'text-[#003366] font-bold' : ''}`} onClick={() => { setLang('en'); setShowLangMenu(false) }}>English</div>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                className="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-3 h-3 text-white/60" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px] z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                  <Link to="/user/account" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    <Settings className="w-4 h-4" /> {t('account.title')}
                  </Link>
                  <Link to="/user/asset" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    <TrendingUp className="w-4 h-4" /> {t('asset.title')}
                  </Link>
                  <Link to="/user/position" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    <TrendingUp className="w-4 h-4" /> {t('position.title')}
                  </Link>
                  <Link to="/user/points" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    <Gift className="w-4 h-4" /> {t('points.title')}
                  </Link>
                  <div className="border-t">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate('/index') }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted w-full"
                    >
                      <LogOut className="w-4 h-4" /> {t('account.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="px-3 py-1 text-sm text-white hover:bg-white/10 rounded transition-colors">{t('login.title')}</Link>
              <Link to="/register" className="px-3 py-1 text-sm bg-white text-[#003366] rounded hover:bg-white/90 transition-colors">{t('register.title')}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
