import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

export default function AdminSettings() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    siteName: '港股模拟交易平台',
    serviceTime: '09:00-22:00',
    minRecharge: 100,
    minWithdraw: 100,
    maxWithdraw: 50000,
    withdrawFee: 2,
    marketOpen: true,
    registerOpen: true,
    rechargeOpen: true,
    withdrawOpen: true,
    autoApproveRecharge: false,
    autoApproveWithdraw: false,
    announcement: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('admin_settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('确定恢复默认设置？')) {
      setSettings({
        siteName: '港股模拟交易平台',
        serviceTime: '09:00-22:00',
        minRecharge: 100,
        minWithdraw: 100,
        maxWithdraw: 50000,
        withdrawFee: 2,
        marketOpen: true,
        registerOpen: true,
        rechargeOpen: true,
        withdrawOpen: true,
        autoApproveRecharge: false,
        autoApproveWithdraw: false,
        announcement: '',
      })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">系统设置</h1>
        {saved && <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded-full">已保存</span>}
      </div>

      <div className="pt-14 p-4 max-w-7xl mx-auto space-y-4 pb-20">
        {/* Basic Settings */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-4">基本设置</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">平台名称</label>
              <input type="text" value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">客服服务时间</label>
              <input type="text" value={settings.serviceTime}
                onChange={e => setSettings({ ...settings, serviceTime: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">平台公告</label>
              <textarea value={settings.announcement}
                onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                placeholder="输入公告内容，前台将显示"
                rows={3}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-4">资金设置</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">最小充值 (¥)</label>
                <input type="number" value={settings.minRecharge}
                  onChange={e => setSettings({ ...settings, minRecharge: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">最小提现 (¥)</label>
                <input type="number" value={settings.minWithdraw}
                  onChange={e => setSettings({ ...settings, minWithdraw: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">最大提现 (¥)</label>
                <input type="number" value={settings.maxWithdraw}
                  onChange={e => setSettings({ ...settings, maxWithdraw: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">提现手续费 (%)</label>
                <input type="number" value={settings.withdrawFee}
                  onChange={e => setSettings({ ...settings, withdrawFee: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2.5 bg-muted rounded-lg text-sm outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Switch Settings */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-4">功能开关</h3>
          <div className="space-y-3">
            {[
              { key: 'marketOpen', label: '交易市场', desc: '关闭后用户无法交易' },
              { key: 'registerOpen', label: '用户注册', desc: '关闭后无法新注册' },
              { key: 'rechargeOpen', label: '充值功能', desc: '关闭后无法充值' },
              { key: 'withdrawOpen', label: '提现功能', desc: '关闭后无法提现' },
              { key: 'autoApproveRecharge', label: '自动审核充值', desc: '开启后充值自动通过' },
              { key: 'autoApproveWithdraw', label: '自动审核提现', desc: '开启后提现自动通过' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                  className={`w-12 h-7 rounded-full transition-colors relative ${settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-400'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${settings[item.key as keyof typeof settings] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-red-800">危险操作</h3>
          <button onClick={handleReset}
            className="w-full py-2 border border-red-500 text-red-600 rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4 inline mr-1" /> 恢复默认设置
          </button>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t z-50">
          <button onClick={handleSave}
            className="w-full py-3 bg-[#003366] text-white rounded-xl font-medium flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> 保存设置
          </button>
        </div>
      </div>
    </div>
  )
}
