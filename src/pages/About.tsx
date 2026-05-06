import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Award, Users, Globe, Phone, Mail, Clock } from 'lucide-react'

export default function About() {
  const navigate = useNavigate()
  const features = [
    { icon: Globe, title: '实时行情', desc: '覆盖港股、沪深、美股全球主要市场' },
    { icon: Shield, title: '模拟交易', desc: '零风险练手，提升投资技能' },
    { icon: Award, title: '智能工具', desc: '条件单、定时平仓等辅助工具' },
    { icon: Users, title: '投资学堂', desc: '从入门到精通的投资教育' },
  ]

  return (
    <div className="pb-16 md:pb-4 max-w-7xl mx-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#003366] text-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">关于我们</h1>
      </div>

      <div className="pt-14 px-4 py-4 space-y-6">
        <div className="text-center py-6">
          <img src="/logo_new.png" alt="" className="w-20 h-20 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">香港交易所</h1>
          <p className="text-muted-foreground mt-2">HKEX Trading Center</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">关于平台</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            香港交易所是领先的港股行情与模拟交易平台，致力于为全球投资者提供专业、及时、全面的港股市场数据与交易服务。
            平台覆盖恒生指数成分股、新股IPO、窝轮牛熊证等全品类港股产品，同时提供沪深港通、美股等跨市场数据。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            我们的使命是让每一位投资者都能轻松掌握港股市场脉搏，通过智能工具和投资者学堂，帮助用户提升投资决策能力。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.title} className="bg-card border rounded-xl p-4 text-center">
              <f.icon className="w-8 h-8 text-[#003366] mx-auto" />
              <h3 className="font-semibold mt-2 text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">联系我们</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#003366]" />
              <span>客服热线: 400-888-8888</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#003366]" />
              <span>客服邮箱: service@hkex.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#003366]" />
              <span>服务时间: 周一至周五 09:00-22:00</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground">客服微信</p>
            <p className="text-sm font-medium mt-1">HKEX888</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">风险提示</h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
            投资有风险，入市需谨慎。本网站提供的所有行情数据仅供参考，不构成任何投资建议。
            过往业绩不代表未来表现，投资者应根据自身情况做出独立判断。
          </p>
        </div>
      </div>
    </div>
  )
}
