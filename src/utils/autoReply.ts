// 后台客服关键词自动回复配置

export interface AutoReplyRule {
  keywords: string[]
  reply: string
}

export const defaultAutoReplies: AutoReplyRule[] = [
  {
    keywords: ['你好', '您好', '在吗', '有人吗', 'hi', 'hello'],
    reply: '您好！欢迎来到香港交易所客服中心，请问有什么可以帮您？我可以协助您处理充值、提现、交易、实名认证等相关问题。',
  },
  {
    keywords: ['充值', '入金', '怎么充值'],
    reply: '充值流程：\n1. 进入【个人中心-充值】\n2. 选择充值金额和支付方式（银行卡/USDT/支付宝/微信）\n3. 选择转账银行卡（已绑定或其他银行）\n4. 确认后系统将自动为您匹配财务账号\n\n充值服务时间：09:00-22:00\n一般1-2个工作日到账',
  },
  {
    keywords: ['提现', '出金', '怎么提现'],
    reply: '提现流程：\n1. 确保已绑定银行卡\n2. 进入【个人中心-提现】\n3. 选择提现银行卡，输入金额\n4. 提交申请等待审核\n\n提现服务时间：09:00-22:00\n到账时间：1-3个工作日\n手续费：限时免费',
  },
  {
    keywords: ['实名认证', '实名', '认证'],
    reply: '实名认证三步走：\n1. 进入【个人中心-实名认证】\n2. 填写真实姓名和身份证号\n3. 上传身份证正反面照片\n\n审核时间：1-2个工作日\n认证后可进行充值和提现操作',
  },
  {
    keywords: ['密码', '忘记密码', '修改密码'],
    reply: '如需修改密码，请进入【个人中心-账户管理-修改密码】，输入旧密码和新密码即可完成修改。\n\n如忘记密码，请联系人工客服协助重置。',
  },
  {
    keywords: ['银行卡', '绑卡', '绑定银行卡'],
    reply: '绑卡流程：\n1. 进入【个人中心-银行卡绑定】\n2. 选择开户行（中/工/建/农/招等）\n3. 输入银行卡号\n4. 提交审核\n\n支持多家银行，审核通过后即可用于提现',
  },
  {
    keywords: ['交易时间', '开盘', '收盘'],
    reply: '港股交易时间：\n- 开市前时段：09:00-09:30\n- 持续交易：09:30-12:00，13:00-16:00\n- 收市竞价：16:00-16:10\n\n注：周末及香港公众假期休市',
  },
  {
    keywords: ['手续费', '费用', '佣金'],
    reply: '费用说明：\n- 交易手续费：成交金额的0.1%\n- 充值手续费：免费\n- 提现手续费：限时免费\n- 账户管理费：免费\n- 行情数据费：免费',
  },
  {
    keywords: ['定时平仓', '自动平仓', '平仓'],
    reply: '定时平仓规则：\n- 5分钟：预期盈亏 ±3%\n- 10分钟：预期盈亏 ±6%\n- 30分钟：预期盈亏 ±18%\n- 60分钟：预期盈亏 ±36%\n\n买入时可在确认页面选择定时平仓选项',
  },
  {
    keywords: ['客服', '人工', '找客服'],
    reply: '如需人工客服协助，请直接描述您遇到的问题，我们的客服专员会尽快为您解答。\n\n客服在线时间：09:00-22:00',
  },
]

// 检查消息是否匹配关键词，返回回复内容或null
export function checkAutoReply(message: string): string | null {
  const lowerMsg = message.toLowerCase().trim()
  for (const rule of defaultAutoReplies) {
    for (const keyword of rule.keywords) {
      if (lowerMsg.includes(keyword.toLowerCase())) {
        return rule.reply
      }
    }
  }
  return null
}

// 获取/保存自定义自动回复（localStorage）
export function getAutoReplies(): AutoReplyRule[] {
  try {
    const saved = localStorage.getItem('admin_auto_replies')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return defaultAutoReplies
}

export function saveAutoReplies(rules: AutoReplyRule[]) {
  localStorage.setItem('admin_auto_replies', JSON.stringify(rules))
}
