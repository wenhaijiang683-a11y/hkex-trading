import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Splash from './pages/Splash'
import Index from './pages/Index'
import Market from './pages/Market'
import StockDetail from './pages/StockDetail'
import Ipo from './pages/Ipo'
import News from './pages/News'
import Study from './pages/Study'
import Tools from './pages/Tools'
import About from './pages/About'
import Service from './pages/Service'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/user/Account'
import AuthPage from './pages/user/Auth'
import Bank from './pages/user/Bank'
import Asset from './pages/user/Asset'
import Recharge from './pages/user/Recharge'
import Withdraw from './pages/user/Withdraw'
import Position from './pages/user/Position'
import Points from './pages/user/Points'
import Favorites from './pages/Favorites'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminAuthReview from './pages/admin/AuthReview'
import AdminBankReview from './pages/admin/BankReview'
import AdminRecharge from './pages/admin/RechargeOrders'
import AdminWithdraw from './pages/admin/WithdrawOrders'
import AdminCapitalFlow from './pages/admin/CapitalFlow'
import AdminMarketControl from './pages/admin/MarketControl'
import AdminUserProfit from './pages/admin/UserProfit'
import AdminIpo from './pages/admin/IpoManage'
import AdminNews from './pages/admin/NewsManage'
import AdminSettings from './pages/admin/Settings'
import AdminLogs from './pages/admin/AdminLogs'
import StockManage from './pages/admin/StockManage'
import WinLoseControl from './pages/admin/WinLoseControl'
import Trade from './pages/Trade'
import BottomNav from './components/BottomNav'
import TopNav from './components/TopNav'
import TickerBar from './components/TickerBar'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isSplash = location.pathname === '/splash'
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  // Public pages don't need login

  // Show/hide navigation
  const showNav = !isAdminRoute && !isSplash && !isAuthPage
  // 底部导航在四个主页面显示（客服页是全屏独立布局，不显示底部导航）
  const mainPages = ['/index', '/market', '/favorites', '/user/account']
  const showBottomNav = showNav && mainPages.includes(location.pathname)

  // Route guard: public pages
  function PublicRoute({ children }: { children: React.ReactNode }) {
    // If already logged in, redirect to home
    if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/splash')) {
      return <Navigate to="/index" replace />
    }
    return <>{children}</>
  }

  // Route guard: protected pages (require login)
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    return <>{children}</>
  }

  // Route guard: admin pages
  function AdminRoute({ children }: { children: React.ReactNode }) {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      return <Navigate to="/admin/login" replace />
    }
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {showNav && !isSplash && <TickerBar />}
      {showNav && !isSplash && <TopNav />}
      <main className={showNav ? 'pt-[88px]' : ''}>
        <Routes>
          {/* Public routes - no login needed */}
          <Route path="/splash" element={<PublicRoute><Splash /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<Navigate to={user ? '/index' : '/splash'} replace />} />

          {/* Protected routes - login required */}
          <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
          <Route path="/stock/:id" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
          <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
          <Route path="/ipo" element={<ProtectedRoute><Ipo /></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
          <Route path="/tool" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/user/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/user/auth" element={<ProtectedRoute><AuthPage /></ProtectedRoute>} />
          <Route path="/user/bank" element={<ProtectedRoute><Bank /></ProtectedRoute>} />
          <Route path="/user/asset" element={<ProtectedRoute><Asset /></ProtectedRoute>} />
          <Route path="/user/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
          <Route path="/user/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/user/position" element={<ProtectedRoute><Position /></ProtectedRoute>} />
          <Route path="/user/points" element={<ProtectedRoute><Points /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/auth-review" element={<AdminRoute><AdminAuthReview /></AdminRoute>} />
          <Route path="/admin/bank-review" element={<AdminRoute><AdminBankReview /></AdminRoute>} />
          <Route path="/admin/recharge" element={<AdminRoute><AdminRecharge /></AdminRoute>} />
          <Route path="/admin/withdraw" element={<AdminRoute><AdminWithdraw /></AdminRoute>} />
          <Route path="/admin/capital-flow" element={<AdminRoute><AdminCapitalFlow /></AdminRoute>} />
          <Route path="/admin/market-control" element={<AdminRoute><AdminMarketControl /></AdminRoute>} />
          <Route path="/admin/win-lose" element={<AdminRoute><WinLoseControl /></AdminRoute>} />
          <Route path="/admin/user-profit" element={<AdminRoute><AdminUserProfit /></AdminRoute>} />
          <Route path="/admin/ipo" element={<AdminRoute><AdminIpo /></AdminRoute>} />
          <Route path="/admin/news" element={<AdminRoute><AdminNews /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
          <Route path="/admin/stocks" element={<AdminRoute><StockManage /></AdminRoute>} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return <AppContent />
}
