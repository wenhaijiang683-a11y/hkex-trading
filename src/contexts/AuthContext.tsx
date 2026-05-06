import React, { createContext, useContext, useState, useCallback } from 'react'

export interface User {
  id: string
  name: string
  phone: string
  avatar: string
  password: string
  balance: number
  holdValue: number
  frozen: number
  totalProfit: number
  todayProfit: number
  points: number
  isRealName: boolean
  isBankBound: boolean
  realNameSubmitted?: boolean
}

export interface Admin {
  username: string
  name: string
  role: 'superadmin'
}

interface AuthContextType {
  user: User | null
  admin: Admin | null
  login: (phone: string, password: string) => boolean
  setUserFromApi: (apiUser: any) => void
  adminLogin: (username: string, password: string) => Promise<boolean>
  logout: () => void
  adminLogout: () => void
  updateUser: (u: Partial<User>) => void
}

const Context = createContext<AuthContextType>({
  user: null, admin: null, login: () => false, setUserFromApi: () => {}, adminLogin: async () => false, logout: () => {}, adminLogout: () => {}, updateUser: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_data')
    return saved ? JSON.parse(saved) : null
  })
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const token = localStorage.getItem('admin_token')
    return token ? { username: 'whxj', name: '超级管理员', role: 'superadmin' } : null
  })

  const login = useCallback((phone: string, password: string) => {
    // 兼容旧模式，用于Register.tsx的自动登录
    if (!phone || !password) return false
    const id = 'U' + Date.now().toString().slice(-5)
    const newUser: User = {
      id, name: '用户' + phone.slice(-4), phone, avatar: '', password,
      balance: 0, holdValue: 0, frozen: 0, totalProfit: 0, todayProfit: 0, points: 0,
      isRealName: false, isBankBound: false,
    }
    localStorage.setItem('user_token', 'token_' + Date.now())
    localStorage.setItem('user_data', JSON.stringify(newUser))
    localStorage.setItem('user_phone', phone)
    setUser(newUser)
    return true
  }, [])

  const setUserFromApi = useCallback((apiUser: any) => {
    const user: User = {
      id: String(apiUser.id),
      name: apiUser.name,
      phone: apiUser.phone,
      avatar: apiUser.avatar || '',
      password: '',
      balance: apiUser.balance || 0,
      holdValue: apiUser.holdValue || 0,
      frozen: apiUser.frozen || 0,
      totalProfit: apiUser.totalProfit || 0,
      todayProfit: apiUser.todayProfit || 0,
      points: apiUser.points || 0,
      isRealName: apiUser.isRealName || false,
      isBankBound: apiUser.isBankBound || false,
      realNameSubmitted: apiUser.realNameSubmitted || false,
    }
    localStorage.setItem('user_data', JSON.stringify(user))
    localStorage.setItem('user_phone', apiUser.phone)
    setUser(user)
  }, [])

  const adminLogin = useCallback(async (username: string, password: string) => {
    try {
      // 调用后端API验证管理员
      const res = await fetch('/api/trpc/admin.login?input=' + encodeURIComponent(JSON.stringify({ json: { username, password } })))
      const data = await res.json()
      if (data.result?.data?.json) {
        localStorage.setItem('admin_token', 'admin_' + Date.now())
        setAdmin({ username: data.result.data.json.username, name: data.result.data.json.name, role: 'superadmin' })
        return true
      }
    } catch { /* fallback */ }
    // fallback: 本地验证
    if (username === 'whxj' && password === 'FF888999') {
      localStorage.setItem('admin_token', 'admin_' + Date.now())
      setAdmin({ username: 'whxj', name: '超级管理员', role: 'superadmin' })
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_phone')
    setUser(null)
  }, [])

  const adminLogout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setAdmin(null)
  }, [])

  const updateUser = useCallback((u: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...u }
      localStorage.setItem('user_data', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <Context.Provider value={{ user, admin, login, setUserFromApi, adminLogin, logout, adminLogout, updateUser }}>
      {children}
    </Context.Provider>
  )
}

export const useAuth = () => useContext(Context)
