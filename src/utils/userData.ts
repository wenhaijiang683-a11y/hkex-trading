// 用户数据管理工具 - 所有数据从localStorage读取，不硬编码任何虚假数据
// 统一用户数据库：hkex_users_db，前后台共享

export interface RegUser {
  name: string
  password: string
  regTime: string
}

export interface AdminUser {
  id: string
  name: string
  phone: string
  balance: number
  todayProfit: number
  regTime: string
  isOnline: boolean
  isRealName: boolean
  realName?: string
  idCard?: string
  address?: string
  bankCard?: string
  bankName?: string
  ip?: string
  location?: string
  device?: string
  loginTime?: string
}

// ========== 统一用户数据库 ==========
export interface UserDBRecord {
  id: string
  name: string
  phone: string
  password: string
  balance: number
  holdValue: number
  frozen: number
  totalProfit: number
  todayProfit: number
  points: number
  isRealName: boolean
  isBankBound: boolean
  realNameSubmitted: boolean
  regTime: string
  lastLoginTime?: string
  avatar?: string
}

const USERS_DB_KEY = 'hkex_users_db'

export function getUsersDB(): Record<string, UserDBRecord> {
  try {
    const saved = localStorage.getItem(USERS_DB_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
}

export function saveUsersDB(db: Record<string, UserDBRecord>) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db))
}

export function getUserFromDB(phone: string): UserDBRecord | null {
  const db = getUsersDB()
  return db[phone] || null
}

export function saveUserToDB(user: UserDBRecord) {
  const db = getUsersDB()
  db[user.phone] = user
  saveUsersDB(db)
}

// 将当前登录用户同步到数据库
export function syncCurrentUserToDB() {
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    if (!userData.phone) return
    const db = getUsersDB()
    const existing = db[userData.phone]
    const updated: UserDBRecord = {
      id: userData.id || existing?.id || 'U' + Date.now().toString().slice(-5),
      name: userData.name || existing?.name || '用户' + userData.phone.slice(-4),
      phone: userData.phone,
      password: userData.password || existing?.password || '',
      balance: userData.balance ?? existing?.balance ?? 0,
      holdValue: userData.holdValue ?? existing?.holdValue ?? 0,
      frozen: userData.frozen ?? existing?.frozen ?? 0,
      totalProfit: userData.totalProfit ?? existing?.totalProfit ?? 0,
      todayProfit: userData.todayProfit ?? existing?.todayProfit ?? 0,
      points: userData.points ?? existing?.points ?? 0,
      isRealName: userData.isRealName ?? existing?.isRealName ?? false,
      isBankBound: userData.isBankBound ?? existing?.isBankBound ?? false,
      realNameSubmitted: userData.realNameSubmitted ?? existing?.realNameSubmitted ?? false,
      regTime: existing?.regTime || new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
      avatar: userData.avatar || existing?.avatar,
    }
    db[userData.phone] = updated
    saveUsersDB(db)
  } catch { /* ignore */ }
}

// 从数据库构建 AdminUser 列表（后台使用）
export function getAllUsers(): AdminUser[] {
  const users: AdminUser[] = []
  try {
    const db = getUsersDB()
    const currentUserData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const authSubmitted = JSON.parse(localStorage.getItem('auth_submitted') || '{}')
    const bankCards = JSON.parse(localStorage.getItem('user_bank_cards') || '[]')
    const isCurrentOnline = !!localStorage.getItem('user_token')

    Object.values(db).forEach((record: UserDBRecord) => {
      const isCurrentUser = currentUserData.phone === record.phone
      const hasBank = bankCards.length > 0
      const bankCardStr = hasBank ? `${bankCards[0]?.bank} ${bankCards[0]?.cardNo}` : undefined

      users.push({
        id: record.id,
        name: record.name,
        phone: record.phone,
        balance: record.balance,
        todayProfit: record.todayProfit,
        regTime: record.regTime ? new Date(record.regTime).toLocaleString() : '-',
        isOnline: isCurrentUser && isCurrentOnline,
        isRealName: record.isRealName,
        realName: authSubmitted.realName || undefined,
        idCard: authSubmitted.idCard || undefined,
        bankCard: bankCardStr,
        bankName: hasBank ? bankCards[0]?.bank : undefined,
        ip: isCurrentUser ? '-' : '-',
        location: isCurrentUser ? '-' : '-',
        device: isCurrentUser ? '-' : '-',
        loginTime: record.lastLoginTime ? new Date(record.lastLoginTime).toLocaleString() : '-',
      })
    })

    // 兼容旧数据：扫描 reg_* 键，如果不在数据库中则导入
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('reg_')) {
        const phone = key.replace('reg_', '')
        if (!db[phone]) {
          const regData = JSON.parse(localStorage.getItem(key) || '{}')
          const isCurrentUser = currentUserData.phone === phone
          users.push({
            id: 'U' + phone.slice(-5),
            name: regData.name || '用户' + phone.slice(-4),
            phone: phone,
            balance: isCurrentUser ? (currentUserData.balance || 0) : 0,
            todayProfit: 0,
            regTime: regData.regTime || '-',
            isOnline: isCurrentUser && isCurrentOnline,
            isRealName: isCurrentUser ? (currentUserData.isRealName || false) : false,
            bankCard: bankCards.length > 0 ? `${bankCards[0]?.bank} ${bankCards[0]?.cardNo}` : undefined,
            ip: '-',
            location: '-',
            device: '-',
            loginTime: isCurrentUser ? new Date().toLocaleString() : '-',
          })
        }
      }
    }
  } catch { /* ignore */ }
  return users
}

// 获取用户数量
export function getUserCount(): number {
  const db = getUsersDB()
  return Object.keys(db).length
}

// 获取在线用户数量（当前登录的用户）
export function getOnlineCount(): number {
  return localStorage.getItem('user_token') ? 1 : 0
}

// 获取充值记录
export interface RechargeRecord {
  id: number
  amount: number
  method: string
  status: string
  time: string
  userPhone?: string
}

export function getRechargeRecords(): RechargeRecord[] {
  try {
    const saved = localStorage.getItem('user_recharge_records')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function saveRechargeRecord(record: Omit<RechargeRecord, 'id'>): RechargeRecord {
  const records = getRechargeRecords()
  const newRecord = { ...record, id: Date.now() }
  records.unshift(newRecord)
  localStorage.setItem('user_recharge_records', JSON.stringify(records))
  return newRecord
}

// 获取提现记录
export interface WithdrawRecord {
  id: number
  amount: number
  bank: string
  status: string
  time: string
  userPhone?: string
}

export function getWithdrawRecords(): WithdrawRecord[] {
  try {
    const saved = localStorage.getItem('user_withdraw_records')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function saveWithdrawRecord(record: Omit<WithdrawRecord, 'id'>): WithdrawRecord {
  const records = getWithdrawRecords()
  const newRecord = { ...record, id: Date.now() }
  records.unshift(newRecord)
  localStorage.setItem('user_withdraw_records', JSON.stringify(records))
  return newRecord
}

// 获取银行卡
export interface BankCard {
  id: number
  bank: string
  cardNo: string
  branch?: string
  phone?: string
  isDefault: boolean
}

export function getBankCards(): BankCard[] {
  try {
    const saved = localStorage.getItem('user_bank_cards')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function saveBankCard(card: Omit<BankCard, 'id'>): BankCard {
  const cards = getBankCards()
  const newCard = { ...card, id: Date.now() }
  cards.push(newCard)
  localStorage.setItem('user_bank_cards', JSON.stringify(cards))
  // 同时更新用户数据中的isBankBound
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  if (userData.phone) {
    userData.isBankBound = true
    localStorage.setItem('user_data', JSON.stringify(userData))
    // 同步到统一数据库
    syncCurrentUserToDB()
  }
  return newCard
}

export function removeBankCard(id: number) {
  const cards = getBankCards().filter(c => c.id !== id)
  localStorage.setItem('user_bank_cards', JSON.stringify(cards))
  if (cards.length === 0) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    if (userData.phone) {
      userData.isBankBound = false
      localStorage.setItem('user_data', JSON.stringify(userData))
      syncCurrentUserToDB()
    }
  }
}

// 充值后自动发消息给客服（带格式化信息和自动回复）
export function sendRechargeMessageToCS(amount: number, method: string, cardDetail: string = '', userName?: string) {
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userId = userData.id || 'guest'
    const name = userName || userData.name || '用户'
    const stored = localStorage.getItem('hkex_chat_messages')
    const allMessages: any[] = stored ? JSON.parse(stored) : []
    const now = new Date().toLocaleString()

    // 1. 用户发送的充值申请消息
    const userMsg = {
      id: Date.now(),
      userId: userId,
      from: 'user',
      content: `用户${name}申请入金¥${amount.toLocaleString()}，支付方式：${method}${cardDetail ? ' ' + cardDetail : ''}`,
      time: now,
      read: false,
    }
    allMessages.push(userMsg)

    // 2. 系统自动客服回复
    const csReply = {
      id: Date.now() + 1,
      userId: userId,
      from: 'admin',
      content: `好的，现在就为你匹配相应的财务账号。请稍等片刻，财务账号匹配成功后将立即发送给您。`,
      time: new Date(Date.now() + 1000).toLocaleString(),
      read: false,
    }
    allMessages.push(csReply)

    localStorage.setItem('hkex_chat_messages', JSON.stringify(allMessages))
    // 触发storage事件通知其他标签页
    window.dispatchEvent(new StorageEvent('storage', { key: 'hkex_chat_messages' }))
  } catch { /* ignore */ }
}

// 获取待审核数量（从充值和提现记录中统计）
export function getPendingCount(type: 'recharge' | 'withdraw' | 'auth' | 'bank'): number {
  if (type === 'recharge') {
    return getRechargeRecords().filter(r => r.status === '审核中').length
  }
  if (type === 'withdraw') {
    return getWithdrawRecords().filter(r => r.status === '审核中').length
  }
  if (type === 'auth') {
    // 实名认证审核：用户提交了但未认证
    const db = getUsersDB()
    return Object.values(db).filter((u: UserDBRecord) => u.realNameSubmitted && !u.isRealName).length
  }
  if (type === 'bank') {
    // 银行卡审核：用户添加了银行卡
    const db = getUsersDB()
    return Object.values(db).filter((u: UserDBRecord) => u.isBankBound).length
  }
  return 0
}

// 获取总充值金额
export function getTotalRecharge(): number {
  return getRechargeRecords()
    .filter(r => r.status === '已到账')
    .reduce((sum, r) => sum + r.amount, 0)
}

// 获取总提现金额
export function getTotalWithdraw(): number {
  return getWithdrawRecords()
    .filter(r => r.status === '已放款')
    .reduce((sum, r) => sum + r.amount, 0)
}
