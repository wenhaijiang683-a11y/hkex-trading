import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, X } from 'lucide-react'

export default function AuthPage() {
  const navigate = useNavigate()
  const submitAuth = trpc.user.submitAuth.useMutation()
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified')
  const [name, setName] = useState('')
  const [idCard, setIdCard] = useState('')
  const [frontImg, setFrontImg] = useState('')
  const [backImg, setBackImg] = useState('')
  const [holdImg, setHoldImg] = useState('')
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)
  const holdRef = useRef<HTMLInputElement>(null)

  const statusConfig = {
    unverified: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: '未认证', desc: '请完成实名认证以解锁全部功能' },
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100', label: '审核中', desc: '预计1-2个工作日完成审核' },
    verified: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: '已认证', desc: '您已完成实名认证' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: '已驳回', desc: '请根据驳回原因修改后重新提交' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  // 读取图片文件为base64
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    if (file.size > 5 * 1024 * 1024) { alert('图片大小不能超过5MB'); return }
    const base64 = await readFile(file)
    setter(base64)
  }

  const handleSubmit = () => {
    if (!name || !idCard) { alert('请填写完整信息'); return }
    if (!frontImg || !backImg) { alert('请上传身份证正反面照片'); return }
    
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userId = Number(userData.id)
    
    if (userId && userId > 0) {
      submitAuth.mutate({
        userId,
        realName: name,
        idCard,
        frontImg,
        backImg,
        holdImg,
      }, {
        onSuccess: () => {
          userData.realNameSubmitted = true
          localStorage.setItem('user_data', JSON.stringify(userData))
          setStatus('pending')
        },
        onError: (err: any) => alert(err.message),
      })
    } else {
      // fallback: 只存localStorage
      localStorage.setItem('auth_submitted', JSON.stringify({
        userId: userData.id,
        name: userData.name,
        phone: userData.phone,
        realName: name,
        idCard,
        frontImg,
        backImg,
        holdImg,
        submitTime: new Date().toLocaleString(),
        status: 'pending',
      }))
      userData.realNameSubmitted = true
      localStorage.setItem('user_data', JSON.stringify(userData))
      setStatus('pending')
    }
  }

  // Upload box component
  const UploadBox = ({ label, img, onClick, onClear }: { label: string, img: string, onClick: () => void, onClear: () => void }) => (
    <div className="relative">
      <button onClick={onClick}
        className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#003366]/50 transition-colors overflow-hidden ${
          img ? 'border-[#003366]/30 p-0 h-40' : 'border-muted-foreground/30 p-4 h-32'
        }`}>
        {img ? (
          <img src={img} alt={label} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <>
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </>
        )}
      </button>
      {img && (
        <button onClick={onClear}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  )

  return (
    <div className="pb-16 md:pb-4 max-w-lg mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">实名认证</h1>
      </div>

      <div className="pt-14 p-4 space-y-4">
        {/* Status Banner */}
        <div className={`${config.bg} rounded-xl p-4 flex items-center gap-3`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
          <div>
            <p className={`font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.desc}</p>
          </div>
        </div>

        {status === 'unverified' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">真实姓名 *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="请输入真实姓名"
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">身份证号码 *</label>
              <input type="text" value={idCard} onChange={e => setIdCard(e.target.value)} placeholder="请输入18位身份证号码"
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#003366]/30" />
            </div>

            {/* Upload Areas */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">身份证照片 *</label>
              <div className="grid grid-cols-2 gap-3">
                <UploadBox label="点击上传正面" img={frontImg}
                  onClick={() => frontRef.current?.click()}
                  onClear={() => setFrontImg('')} />
                <UploadBox label="点击上传反面" img={backImg}
                  onClick={() => backRef.current?.click()}
                  onClear={() => setBackImg('')} />
              </div>
              <input ref={frontRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFileChange(e, setFrontImg)} />
              <input ref={backRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFileChange(e, setBackImg)} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">手持身份证照片（可选）</label>
              <UploadBox label="点击上传手持照" img={holdImg}
                onClick={() => holdRef.current?.click()}
                onClear={() => setHoldImg('')} />
              <input ref={holdRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFileChange(e, setHoldImg)} />
            </div>

            <button onClick={handleSubmit} className="w-full py-3 bg-[#003366] text-white rounded-xl font-semibold">
              提交审核
            </button>
          </div>
        )}

        {status === 'verified' && (
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">姓名</span><span>{name || '张**'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">身份证号</span><span>{idCard ? idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2') : '440***********1234'}</span></div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium">驳回原因</p>
            <p className="text-sm text-red-600 mt-1">身份证照片不清晰，请重新上传清晰的证件照片。</p>
            <button onClick={() => setStatus('unverified')} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
              重新提交
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
