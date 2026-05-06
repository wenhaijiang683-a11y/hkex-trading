import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Plus, Building2, CreditCard, Trash2, MapPin } from 'lucide-react'
import { getBankCards, saveBankCard, removeBankCard } from '../../utils/userData'
import type { BankCard } from '../../utils/userData'

export default function Bank() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<BankCard[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newBank, setNewBank] = useState('')
  const [newCardNo, setNewCardNo] = useState('')
  const [newBranch, setNewBranch] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const addBankCard = trpc.user.addBankCard.useMutation()

  useEffect(() => {
    setCards(getBankCards())
  }, [])

  const setDefault = (id: number) => {
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }))
    setCards(updated)
    localStorage.setItem('user_bank_cards', JSON.stringify(updated))
  }

  const removeCard = (id: number) => {
    removeBankCard(id)
    setCards(getBankCards())
  }

  const handleAddCard = () => {
    if (!newBank || !newCardNo) { alert('请填写完整信息'); return }
    const formattedNo = newCardNo.length > 4 ? '**** **** **** ' + newCardNo.slice(-4) : newCardNo
    
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userId = Number(userData.id)
    
    if (userId && userId > 0) {
      addBankCard.mutate({
        userId,
        bank: newBank,
        cardNo: formattedNo,
        branch: newBranch,
        phone: newPhone,
      }, {
        onSuccess: () => {
          saveBankCard({
            bank: newBank,
            cardNo: formattedNo,
            branch: newBranch,
            phone: newPhone,
            isDefault: cards.length === 0,
          })
          setCards(getBankCards())
          setShowAdd(false)
          setNewBank('')
          setNewCardNo('')
          setNewBranch('')
          setNewPhone('')
          alert('银行卡绑定成功')
        },
        onError: (err) => alert(err.message),
      })
    } else {
      saveBankCard({
        bank: newBank,
        cardNo: formattedNo,
        branch: newBranch,
        phone: newPhone,
        isDefault: cards.length === 0,
      })
      setCards(getBankCards())
      setShowAdd(false)
      setNewBank('')
      setNewCardNo('')
      setNewBranch('')
      setNewPhone('')
      alert('银行卡绑定成功')
    }
  }

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">银行卡管理</h1>
      </div>

      <div className="pt-14 p-4 space-y-3">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">未绑定银行卡</p>
            <p className="text-xs mt-1">请添加您的银行卡用于提现</p>
          </div>
        ) : (
          cards.map(card => (
            <div key={card.id} className="bg-gradient-to-r from-[#003366] to-[#004080] rounded-xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold">{card.bank}</span>
                </div>
                {card.isDefault && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">默认</span>}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <CreditCard className="w-5 h-5 text-white/60" />
                <span className="text-lg tracking-widest font-mono">{card.cardNo}</span>
              </div>
              {card.branch && (
                <div className="flex items-center gap-1.5 mt-2 text-white/60 text-xs">
                  <MapPin className="w-3 h-3" /> {card.branch}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {!card.isDefault && (
                  <button onClick={() => setDefault(card.id)} className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                    设为默认
                  </button>
                )}
                <button onClick={() => removeCard(card.id)} className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-red-500/50 transition-colors">
                  <Trash2 className="w-3 h-3 inline" /> 解绑
                </button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => setShowAdd(true)}
          className="w-full py-4 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-[#003366]/50 hover:text-[#003366] transition-colors">
          <Plus className="w-5 h-5" /> 添加银行卡
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full bg-background rounded-t-2xl p-4 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg">添加银行卡</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">开户银行 *</label>
                <select value={newBank} onChange={e => setNewBank(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none">
                  <option value="">请选择开户行</option>
                  <option value="中国银行">中国银行</option>
                  <option value="工商银行">工商银行</option>
                  <option value="建设银行">建设银行</option>
                  <option value="农业银行">农业银行</option>
                  <option value="招商银行">招商银行</option>
                  <option value="交通银行">交通银行</option>
                  <option value="邮储银行">邮储银行</option>
                  <option value="平安银行">平安银行</option>
                  <option value="浦发银行">浦发银行</option>
                  <option value="光大银行">光大银行</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">银行卡号 *</label>
                <input type="text" value={newCardNo} onChange={e => setNewCardNo(e.target.value)} placeholder="请输入银行卡号"
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">开户支行/地址</label>
                <input type="text" value={newBranch} onChange={e => setNewBranch(e.target.value)} placeholder="如：深圳市南山区支行"
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">预留手机号</label>
                <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="银行预留手机号"
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <button onClick={handleAddCard} className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium">
                提交审核
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
