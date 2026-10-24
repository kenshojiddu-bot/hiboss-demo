const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`
/** Portrait crop centred on the face, for people shown in fixed-ratio frames. */
const face = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=600&h=720&q=70`

export type Gate = '公开' | '需认证' | '需付费' | '邀请制'

export const dailyItems = [
  { id: 'd1', tags: ['印尼', '认证与准入'], title: '印尼 BPOM 宣布 2027 年起化妆品清真认证全面强制执行', judgment: '你的美妆线需在 14 个月内完成清真认证，越早排期越便宜。', time: '07:42', source: '印尼食品药品监督局官网', what: 'BPOM 于昨日发布第 12 号条例，所有进口化妆品须于 2027 年 1 月前取得 BPJPH 清真证书。', mean: '你目前主攻印尼，且画像中提到关注清真认证；当前认证排队周期约 4–6 个月。', action: '本月内联系认证服务商做预审，同时梳理原料清单与供应商证明。' },
  { id: 'd2', tags: ['中东', '市场机会'], title: '沙特 2026 Q3 跨境电商进口额同比增长 41%', judgment: '家居品类增速第一，适合作为中东试水的切入品类。', time: '07:30', source: '沙特统计总局', what: '沙特统计总局披露第三季度跨境电商进口额 58 亿美元，家居、个护分列前二。', mean: '你的家居子品牌尚未进入中东，竞争密度仍低于东南亚。', action: '下周参加「中东选品闭门会」，先拿到渠道名录。' },
  { id: 'd3', tags: ['东南亚', '资金与收款'], title: '越南央行下调跨境支付手续费上限至 0.8%', judgment: '收款成本可降约三成，值得重新比价服务商。', time: '06:58', source: '越南国家银行', what: '新规自 12 月 1 日生效，适用于所有持牌支付机构。', mean: '按你的月流水估算，每月可节省约 1.2 万元。', action: '对比 3 家收款服务商新费率，月底前切换。' },
  { id: 'd4', tags: ['欧洲', '政策合规'], title: '欧盟 GPSR 新规实施满一年，抽检不合格率 17%', judgment: '电子类目最容易踩坑，上架前务必补齐欧代信息。', time: '昨天', source: '欧盟委员会', what: '欧盟发布首年执法报告，平台下架商品超 12 万件。', mean: '你的蓝牙配件在欧洲站销售，需核对标签与欧代信息。', action: '用平台合规服务商做一次免费体检。' },
  { id: 'd5', tags: ['印尼', '渠道与买家'], title: 'TikTok Shop 印尼站开放家居类目新商家入驻绿色通道', judgment: '名额有限，符合你的品类，建议本周提交。', time: '昨天', source: 'TikTok Shop 官方公告', what: '绿色通道审核时间缩短至 3 个工作日，首月免佣。', mean: '你已有印尼本地仓，满足入驻条件。', action: '准备品牌授权书与本地仓证明，本周提交。' },
  { id: 'd6', tags: ['北美', '供应链与物流'], title: '美西港口拥堵指数回落至 2023 年以来最低', judgment: '旺季前补货窗口打开，海运价格有望继续走低。', time: '昨天', source: '洛杉矶港务局', what: '平均等待泊位时间降至 0.6 天。', mean: '你的北美备货计划可提前两周执行。', action: '联系货代锁定 12 月舱位。' },
]

export const events = [
  { id: 'e1', title: '2026 中东选品与渠道闭门会', date: '11月12日 周四 14:00', city: '深圳', place: '南山区 前海国际会议中心 3F', form: '线下', gate: '需认证' as Gate, host: '海老板 HIBOSS', guide: '深圳市商务局', joined: 86, cap: 120, price: 0, cover: img('1582192730841-2a682d7375f9') },
  { id: 'e2', title: '印尼清真认证实操工作坊', date: '11月15日 周日 10:00', city: '线上', place: '腾讯会议（报名后发送链接）', form: '线上', gate: '公开' as Gate, host: '印尼中华总商会', guide: '中国贸促会', joined: 312, cap: 500, price: 0, cover: img('1540575467063-178a50c2df87') },
  { id: 'e3', title: '2026 迪拜国际消费电子展 · 中国企业团', date: '11月24日–27日', city: '迪拜', place: '迪拜世贸中心', form: '展会', gate: '需付费' as Gate, host: '海老板 HIBOSS', guide: '中国机电商会', joined: 48, cap: 60, price: 2980, cover: img('1587825140708-dfaf72ae4b04') },
  { id: 'e4', title: '出海董事长私董会 · 东南亚建厂', date: '12月3日 周四 18:30', city: '上海', place: '静安区 某私享会所', form: '线下', gate: '邀请制' as Gate, host: '海老板 C 类会员中心', guide: '—', joined: 20, cap: 20, price: 0, cover: img('1531058020387-3be344556be6') },
  { id: 'e5', title: '越南工业园考察团（胡志明 · 平阳）', date: '12月8日–12日', city: '胡志明', place: '平阳省 VSIP 工业园', form: '考察', gate: '需认证' as Gate, host: '海老板 HIBOSS', guide: '越南投资促进中心', joined: 15, cap: 30, price: 0, cover: img('1594122230689-45899d9e6f69') },
  { id: 'e6', title: '2026 欧洲合规峰会回顾', date: '10月20日', city: '杭州', place: '杭州国际博览中心', form: '线下', gate: '公开' as Gate, host: '跨境合规联盟', guide: '浙江省商务厅', joined: 400, cap: 400, price: 0, ended: true, cover: img('1435686858161-59da32dfd4b4') },
]

export const agenda = [
  ['14:00', '开场：中东消费市场 2027 展望', '王立 · 海老板研究院'],
  ['14:30', '沙特电商渠道实战拆解', 'Ahmed K. · Noon 招商'],
  ['15:20', '清关、VAT 与本地化合规', '李静 · 德恒律所'],
  ['16:00', '圆桌：家居品类如何打开中东', '三位出海企业主'],
  ['16:50', '一对一渠道对接', '20 家本地买家'],
  ['17:30', '自由交流 & 茶歇', '—'],
]

/** 出海资源库: vetted overseas professional service providers. */
export const providerCats = ['法务合规', '财税', '认证准入', '物流仓储', '收款与金融', '社媒与内容', '咨询顾问', 'AI 工具']
export const providers = [
  { id: 'p1', name: '德衡跨境律所', cat: '法务合规', pitch: '专注东南亚公司设立与合规 12 年', area: '东南亚 · 中东', price: '¥8,000 起', rating: 4.9, cert: true, years: 12, cases: 860, logo: '德' },
  { id: 'p2', name: '清源认证服务', cat: '认证准入', pitch: '清真 / BPOM / SNI 一站式认证', area: '印尼 · 马来西亚', price: '¥12,000 起', rating: 4.8, cert: true, years: 8, cases: 420, logo: '清' },
  { id: 'p3', name: '万链财税', cat: '财税', pitch: '欧洲 VAT 与美国销售税申报', area: '欧洲 · 北美', price: '¥1,200/月 起', rating: 4.7, cert: true, years: 6, cases: 2100, logo: '万' },
  { id: 'p4', name: '远航供应链', cat: '物流仓储', pitch: '中东海外仓 + 尾程配送', area: '沙特 · 阿联酋', price: '面议', rating: 4.6, cert: false, years: 5, cases: 300, logo: '远' },
  { id: 'p5', name: '汇通全球收款', cat: '收款与金融', pitch: '覆盖 40 国本地收款账户', area: '全球', price: '费率 0.6% 起', rating: 4.8, cert: true, years: 7, cases: 5600, logo: '汇' },
  { id: 'p6', name: '浪潮内容工作室', cat: '社媒与内容', pitch: 'TikTok 印尼本地达人矩阵', area: '印尼 · 泰国', price: '¥20,000/月 起', rating: 4.5, cert: true, years: 3, cases: 150, logo: '浪' },
  { id: 'p7', name: '思远出海咨询', cat: '咨询顾问', pitch: '印尼设厂选址、政府关系与本地团队搭建', area: '印尼 · 东南亚', price: '¥30,000 起', rating: 4.9, cert: true, years: 9, cases: 210, logo: '思' },
  { id: 'p8', name: '海老板研究院', cat: '咨询顾问', pitch: '国别 × 行业进入策略与竞品研究', area: '全球', price: '¥5,000/份 起', rating: 4.7, cert: true, years: 4, cases: 680, logo: '海' },
]
/** Typical service menu per provider category, shown on the provider detail page. */
export const providerServices: Record<string, [string, string][]> = {
  法务合规: [['公司注册与年审', '¥8,000–15,000'], ['合同与合规审阅', '¥3,000 / 份'], ['常年法律顾问', '面议']],
  认证准入: [['清真认证全流程', '¥12,000 起'], ['BPOM / SNI 注册', '¥8,000 / 品'], ['认证预审', '免费']],
  财税: [['VAT 注册与申报', '¥1,200 / 月'], ['美国销售税申报', '¥800 / 州 / 月'], ['跨境税务筹划', '面议']],
  物流仓储: [['海外仓一件代发', '¥6 / 单 起'], ['头程海运拼柜', '按方计价'], ['尾程配送', '面议']],
  收款与金融: [['本地收款账户', '免开户费'], ['跨境结汇', '0.6% 起'], ['供应链融资', '面议']],
  社媒与内容: [['达人矩阵带货', '¥20,000 / 月 起'], ['短视频代运营', '¥15,000 / 月'], ['直播代播', '按场计价']],
  咨询顾问: [['进入策略诊断', '¥30,000 起'], ['设厂选址陪跑', '¥80,000 起'], ['国别行业报告', '¥5,000 / 份']],
}

export const agentCountries = ['印尼', '越南', '泰国', '沙特', '阿联酋', '墨西哥', '德国']
export const agentIndustries = ['家居', '美妆个护', '消费电子', '食品饮料', '机械设备', '新能源']

/** An AI agent trained on one country × industry: its sources, its rules, and the questions people actually ask. */
export type AiAgent = {
  id: string
  country: string
  /** Country code printed on the agent mark. */
  code: string
  region: string
  industry: string
  intro: string
  /** The three topics every answer is organised around (cited as ①②③). */
  focus: [string, string, string]
  tip: string
  refs: [string, string, string]
  feeds: number
  asked: number
  updated: string
  hot: string[]
  /** Hand-offs when the user wants a vendor, or a person on the ground. */
  provider: string
  human?: string
}
export const aiAgents: AiAgent[] = [
  {
    id: 'a1', country: '印尼', code: 'ID', region: '东南亚', industry: '家居', intro: '盯 SNI 强检、清真认证和 TikTok Shop 家居类目规则',
    focus: ['SNI 强检', '清真认证', 'TikTok Shop 入驻'], tip: '其中 SNI 强检是家具上架的前置条件，送检排队约 6–8 周，建议本月就安排。',
    refs: ['印尼工业部 SNI 强制认证目录', '印尼 BPJPH 第 12 号条例', 'TikTok Shop 印尼家居类目规则'],
    feeds: 126, asked: 3280, updated: '8 分钟前', hot: ['印尼家具一定要做 SNI 认证吗？', 'TikTok Shop 印尼家居类目佣金多少？', '雅加达本地仓每平米月租多少？'], provider: 'p2', human: 'h1',
  },
  {
    id: 'a2', country: '印尼', code: 'ID', region: '东南亚', industry: '美妆个护', intro: 'BPOM 注册、2027 清真强制认证与达人带货合规',
    focus: ['清真认证', 'BPOM 注册', '本地进口商资质'], tip: '清真认证是 2027 年强制项，排队周期 4–6 个月，建议本月启动。',
    refs: ['印尼 BPJPH 第 12 号条例', 'BPOM 进口化妆品注册指南', '印尼贸易部进口商名录'],
    feeds: 98, asked: 5120, updated: '15 分钟前', hot: ['进口化妆品 BPOM 注册要多久？', '2027 清真强制认证覆盖哪些品类？', '印尼达人带货要签什么合同？'], provider: 'p2', human: 'h5',
  },
  {
    id: 'a3', country: '沙特', code: 'SA', region: '中东', industry: '家居', intro: 'SASO / SABER 认证、Noon 与本地卖场渠道、VAT 申报',
    focus: ['SABER 认证', 'Noon 入驻', 'VAT 申报'], tip: '沙特家居进口增速第一，但 SABER 证书按批次签发，备货前两周就要申请。',
    refs: ['沙特标准局 SASO 技术法规', 'Noon 卖家中心家居类目指南', '沙特税务总局 ZATCA VAT 手册'],
    feeds: 84, asked: 1960, updated: '32 分钟前', hot: ['家具进沙特要做哪些认证？', 'Noon 和亚马逊沙特站怎么选？', '沙特 VAT 多久申报一次？'], provider: 'p4', human: 'h2',
  },
  {
    id: 'a4', country: '阿联酋', code: 'AE', region: '中东', industry: '消费电子', intro: 'ECAS 认证、迪拜自贸区设立与中东分销网络',
    focus: ['ECAS 认证', '自贸区公司', '分销网络'], tip: '在杰贝阿里等自贸区设公司可 100% 外资控股，适合做中东分拨中心。',
    refs: ['阿联酋工业与先进技术部 ECAS 指南', '杰贝阿里自贸区设立流程', '迪拜海关转口贸易规定'],
    feeds: 72, asked: 1420, updated: '1 小时前', hot: ['蓝牙耳机进阿联酋要做 ECAS 吗？', '迪拜自贸区注册公司多少钱？', '怎么找中东电子产品分销商？'], provider: 'p1', human: 'h4',
  },
  {
    id: 'a5', country: '越南', code: 'VN', region: '东南亚', industry: '机械设备', intro: '工业园选址、投资审批、原产地规则与用工政策',
    focus: ['工业园选址', '投资审批', '原产地规则'], tip: '北部园区离供应链近，南部用工更稳定，选址前建议实地看 2–3 个园区。',
    refs: ['越南计划投资部 FDI 审批指引', 'VSIP 工业园招商手册', '越南工贸部原产地规则'],
    feeds: 91, asked: 2210, updated: '20 分钟前', hot: ['越南设厂审批要多久？', '北越和南越工业园怎么选？', '越南工人月薪大概多少？'], provider: 'p7', human: 'h3',
  },
  {
    id: 'a6', country: '泰国', code: 'TH', region: '东南亚', industry: '食品饮料', intro: 'Thai FDA 注册、泰文标签与便利店渠道准入',
    focus: ['Thai FDA 注册', '泰文标签', '便利店渠道'], tip: '泰国 FDA 要求本地进口商作为申请主体，先锁定进口商再注册会快很多。',
    refs: ['泰国 FDA 进口食品注册指南', '泰国食品标签法规', 'CP ALL 供应商准入说明'],
    feeds: 64, asked: 980, updated: '2 小时前', hot: ['零食进泰国要做 FDA 注册吗？', '泰文标签有哪些必填项？', '怎么进 7-Eleven 渠道？'], provider: 'p2',
  },
  {
    id: 'a7', country: '墨西哥', code: 'MX', region: '拉美', industry: '新能源', intro: 'NOM 认证、IMMEX 保税制度与 USMCA 原产地规则',
    focus: ['NOM 认证', 'IMMEX 保税', 'USMCA 原产地'], tip: '在墨西哥组装并满足 USMCA 原产地规则，可零关税进入美国市场。',
    refs: ['墨西哥经济部 NOM 标准目录', 'IMMEX 计划申请指南', 'USMCA 原产地规则文本'],
    feeds: 58, asked: 760, updated: '3 小时前', hot: ['储能产品进墨西哥要做 NOM 吗？', 'IMMEX 保税怎么申请？', '墨西哥组装能零关税进美国吗？'], provider: 'p3',
  },
  {
    id: 'a8', country: '德国', code: 'DE', region: '欧洲', industry: '消费电子', intro: 'CE / GPSR 合规、WEEE 注册与亚马逊欧洲站',
    focus: ['GPSR 合规', 'WEEE 注册', '欧代信息'], tip: 'GPSR 实施首年抽检不合格率 17%，电子类目上架前务必补齐欧代信息。',
    refs: ['欧盟 GPSR 法规 (EU) 2023/988', '德国 EAR 基金会 WEEE 注册指南', '欧盟委员会 GPSR 执法报告'],
    feeds: 110, asked: 2640, updated: '40 分钟前', hot: ['GPSR 对蓝牙配件有什么要求？', 'WEEE 注册要多久？', '欧代怎么找？'], provider: 'p3',
  },
]

/** 真人 Agent: people based in the target market who act for the user on site — channel intros, visits, paperwork. */
export type HumanAgent = {
  id: string
  name: string
  avatar: string
  city: string
  country: string
  industries: string[]
  title: string
  langs: string[]
  years: number
  served: number
  rating: number
  reply: string
  status: '可约' | '本周满' | '暂不可约'
  intro: string
  skills: string[]
  /** [service, unit, price] */
  services: [string, string, string][]
  cases: [string, string][]
}
export const humanAgents: HumanAgent[] = [
  {
    id: 'h1', name: 'Rizky Pratama', avatar: face('1763627556302-2b35f22c7a6c'), city: '雅加达', country: '印尼', industries: ['家居', '快消'],
    title: '家居渠道代理 · 前 Informa 采购经理', langs: ['印尼语', '中文', '英语'], years: 9, served: 120, rating: 4.9, reply: '2 小时', status: '可约',
    intro: '在印尼家居零售做了 9 年采购，熟悉 Informa、ACE 和 Shopee Mall 的供应商准入，能带你直接见到采购负责人。',
    skills: ['卖场渠道', '样品寄送', '本地仓选址'],
    services: [['线上咨询', '60 分钟', '¥800'], ['卖场渠道对接', '按次', '¥6,000 起'], ['落地陪同考察', '1 天', '¥3,000']],
    cases: [['家居 · 雅加达', '3 周进入 Informa 32 家门店'], ['收纳 · 泗水', '谈下 ACE 年度供货协议']],
  },
  {
    id: 'h2', name: 'Ahmed Al-Harbi', avatar: face('1624411024074-18a756682b50'), city: '利雅得', country: '沙特', industries: ['家居', '建材'],
    title: '本地商务代表 · 沙特商会会员', langs: ['阿拉伯语', '英语'], years: 12, served: 85, rating: 4.8, reply: '4 小时', status: '暂不可约',
    intro: '帮中国品牌对接沙特本地卖场与政府项目，可代为出席商务会议和招标说明会，也能代办 SABER 认证。',
    skills: ['卖场与招标', '政府关系', 'SABER 代办'],
    services: [['线上咨询', '60 分钟', '¥1,000'], ['商务会议代表', '半天', '¥4,500'], ['SABER 认证代办', '按批次', '¥5,000 起']],
    cases: [['家具 · 利雅得', '进入 SACO 家居卖场'], ['建材 · 吉达', '中标政府安居项目']],
  },
  {
    id: 'h3', name: '阮氏秋', avatar: face('1581065178047-8ee15951ede6'), city: '胡志明', country: '越南', industries: ['机械设备', '消费电子'],
    title: '工厂与园区顾问 · 前 VSIP 招商经理', langs: ['越南语', '中文', '英语'], years: 8, served: 64, rating: 4.9, reply: '1 小时', status: '可约',
    intro: '前 VSIP 工业园招商经理，陪 60 多家中国工厂走完选址、投资审批到招工，周末也能陪你看园区。',
    skills: ['园区选址', '投资审批', '招工'],
    services: [['线上咨询', '60 分钟', '¥800'], ['园区实地陪看', '1 天', '¥2,500'], ['投资审批代办', '按项目', '¥20,000 起']],
    cases: [['电子 · 平阳', '45 天拿到投资许可证'], ['机械 · 北宁', '3 个月招满 200 人']],
  },
  {
    id: 'h4', name: 'Layla 王', avatar: face('1494790108377-be9c29b29330'), city: '迪拜', country: '阿联酋', industries: ['家居', '消费电子'],
    title: '中东电商渠道顾问 · 前 Noon 招商总监', langs: ['中文', '英语', '阿拉伯语'], years: 10, served: 300, rating: 4.9, reply: '3 小时', status: '本周满',
    intro: '主导过 300 多个中国品牌入驻中东平台，熟悉 Noon、Amazon.ae 与本地分销商的谈判节奏。',
    skills: ['平台入驻', '分销商对接', '大促运营'],
    services: [['线上咨询', '60 分钟', '¥1,200'], ['平台入驻陪跑', '1 个月', '¥15,000'], ['分销商引荐', '按次', '¥8,000 起']],
    cases: [['家居 · 迪拜', '白色星期五单店 GMV 破百万'], ['3C · 利雅得', '签下 2 家区域分销商']],
  },
  {
    id: 'h5', name: '陈思远', avatar: face('1507003211169-0a1dd7228f2d'), city: '雅加达', country: '印尼', industries: ['美妆个护', '家居'],
    title: '印尼落地顾问 · 前印尼中资企业协会秘书长', langs: ['中文', '印尼语', '英语'], years: 15, served: 200, rating: 5.0, reply: '6 小时', status: '可约',
    intro: '在雅加达工作 15 年，协助 200 多家中企落地，擅长设厂、政府关系与清真认证排期。',
    skills: ['设厂落地', '政府关系', '清真认证'],
    services: [['线上咨询', '60 分钟', '¥1,500'], ['设厂落地陪跑', '3 个月', '¥60,000 起'], ['政府部门拜访', '半天', '¥5,000']],
    cases: [['美妆 · 雅加达', '清真认证排期缩短 2 个月'], ['家居 · 万隆', '45 天完成 PT PMA 设立']],
  },
]

/** A post in 出海朋友圈: written by a peer business owner, an AI agent (policy flashes) or a human agent on the ground. */
export type Moment = {
  id: string
  kind: 'peer' | 'ai' | 'human'
  who: string
  /** AI or human agent behind the post. */
  ref?: string
  logo?: string
  role: string
  cert?: boolean
  text: string
  image?: string
  alt?: string
  source?: string
  tags: string[]
  time: string
  likes: number
  liked?: boolean
  comments: { who: string; text: string }[]
  mine?: boolean
  pending?: boolean
  hidden?: boolean
}
export const momentSeeds: Moment[] = [
  {
    id: 'mo1', kind: 'peer', who: '周敏', logo: '周', role: '宁波收纳家居 · 出海第 3 年', cert: true, time: '12 分钟前', tags: ['印尼', '拼柜拼仓'], likes: 36,
    text: '刚从雅加达回来，Informa 和 Shopee Mall 的采购都在找 30 美元以下的收纳件。我们在 Cikarang 的仓空着一半，想找同行拼仓，价格好商量。',
    image: img('1644079446600-219068676743'), alt: '堆满货架的仓库内部',
    comments: [{ who: '王总 · 义乌日用', text: '拼仓 +1，我们 12 月有两个柜要进' }, { who: 'Rizky Pratama', text: 'Cikarang 最近有 SNI 抽检，入仓前记得把证书备好' }],
  },
  {
    id: 'mo2', kind: 'ai', who: '沙特 · 家居 Agent', ref: 'a3', role: 'AI Agent · 政策速递', time: '1 小时前', tags: ['沙特', '家居'], likes: 128, source: '沙特标准局 SASO 公告',
    text: 'SASO 发布家具类技术法规修订稿：明年 3 月起，软体家具需增加阻燃测试报告。已在沙特销售的 SKU 有 6 个月过渡期，建议本季度内补测。',
    comments: [{ who: '刘总 · 佛山软体', text: '阻燃测试国内哪几家实验室被认可？' }],
  },
  {
    id: 'mo3', kind: 'human', who: 'Layla 王', ref: 'h4', role: '真人 Agent · 常驻迪拜', time: '3 小时前', tags: ['阿联酋', '消费电子'], likes: 214,
    text: '这周在迪拜的电子展连逛三天，中东分销商最在意三件事：保修本地化、阿语包装、30 天账期。准备来中东的老板可以提前把这三点准备好。',
    image: img('1761195689615-9469b65dac01'), alt: '展会现场人们在展台前交流',
    comments: [{ who: '赵磊', text: '30 天账期一般怎么做风控？' }, { who: 'Layla 王', text: '首单建议走信用证，第二单再谈账期' }, { who: '周敏', text: '阿语包装这点太真实了' }],
  },
  {
    id: 'mo4', kind: 'peer', who: '赵磊', logo: '赵', role: '深圳蓝牙配件 · 欧洲站', cert: false, time: '5 小时前', tags: ['德国', '求助'], likes: 18,
    text: '求助：GPSR 欧代信息被平台判定不全，下架了 40 多个链接，有遇到过的同行吗？怎么申诉最快？',
    comments: [{ who: '德国 · 消费电子 Agent', text: '先在商品页补齐欧代名称、地址和联系方式，再走卖家后台的合规申诉入口，通常 3–5 个工作日恢复。' }],
  },
  {
    id: 'mo5', kind: 'human', who: 'Rizky Pratama', ref: 'h1', role: '真人 Agent · 常驻雅加达', time: '昨天', tags: ['印尼', '家居'], likes: 96,
    text: 'Informa 下季度新增 2 个家居供应商名额，偏好北欧风、可拆装、单价 50 美元以内。有合适产品的老板可以找我，帮你约采购面谈。',
    image: img('1760611656148-063d3b9a8dbc'), alt: '家具卖场里陈列的椅子',
    comments: [],
  },
  {
    id: 'mo6', kind: 'ai', who: '印尼 · 美妆个护 Agent', ref: 'a2', role: 'AI Agent · 政策速递', time: '昨天', tags: ['印尼', '美妆个护'], likes: 302, source: '印尼 BPJPH 官网',
    text: 'BPJPH 公布清真认证排队数据：美妆类平均 4.6 个月。2027 年强制执行前，预计排队会拉长到 8 个月以上。',
    comments: [{ who: '陈思远', text: '已经在帮两家客户提前排期，越早越好' }],
  },
]

export type PostStatus = '审核中' | '已发布' | '已下架' | '已过期'

/** A supply-demand post: what the publisher can offer, what they need, or both. */
export type Post = {
  id: string
  company: string
  logo: string
  cert: boolean
  region: string[]
  time: string
  offer?: { types: string[]; text: string; highlights: string[] }
  need?: { type: string; text: string; budget: string; deadline: string; prefer: string[] }
  views: number
  intents: number
  match: number
  /** Why the AI twin recommends this post to the current user. */
  reasons?: string[]
  /** Shown to certified viewers only. */
  contact?: string
  mine?: boolean
  status?: PostStatus
  anonymous?: boolean
  scope?: string
  expire?: string
  /** Ranking among posts in the same category, refreshed by the owner. */
  rank?: number
}

export const offerTypes = ['生产制造', '供应链', '渠道资源', '海外仓储', '本地化运营', '品牌营销', '认证资质', '资金', '技术', '人脉资源']
export const offerHighlights = ['支持 OEM/ODM', '可小单试产', '已有海外仓', '已获当地认证', '7 天内交付', '有成功案例', '可提供样品']
export const needTypes = ['找买家/采购', '找分销渠道', '找服务商', '找资金/投资', '找合作伙伴', '找人才', '其他']
export const needPrefer = ['已认证企业', '本地有实体', '同品类经验', '可提供样品', '能开票', '接受分期']
export const budgets = ['面议', '10 万以内', '10–50 万', '50–200 万', '200 万以上']
export const deadlines = ['1 周内', '1 个月内', '3 个月内', '长期有效']
export const markets = ['东南亚', '中东', '欧洲', '北美', '拉美', '非洲', '日韩']

export const seedPosts: Post[] = [
  {
    id: 'b1', company: 'Al-Rashid Retail', logo: 'A', cert: true, region: ['中东'], time: '2 小时前', match: 92, views: 236, intents: 18,
    reasons: ['对方在沙特采购收纳家居，正是你的主营品类', '对方有 120 家连锁渠道，补你「中东分销」的空白', '你在画像里写了「明年计划进入沙特」'],
    contact: 'Omar Al-Rashid · +966 55 210 8890',
    offer: { types: ['渠道资源', '本地化运营'], text: '沙特 120 家连锁超市货架资源，可承接清关、阿语包装与本地配送。', highlights: ['有成功案例', '已获当地认证'] },
    need: { type: '找买家/采购', text: '采购 5 万件收纳家居，需阿语包装与 SASO 认证，首批 3 个 40 尺柜。', budget: '50–200 万', deadline: '1 个月内', prefer: ['已认证企业', '可提供样品'] },
  },
  {
    id: 'b2', company: '浪潮内容工作室', logo: '浪', cert: true, region: ['东南亚'], time: '今天', match: 88, views: 412, intents: 26,
    reasons: ['对方的 TikTok 印尼达人矩阵可直接带你的家居新品', '你在印尼已有本地仓，满足对方「可提供样品」的要求'],
    contact: '浪潮商务 · Rina · +62 812 3300 1288',
    offer: { types: ['品牌营销'], text: 'TikTok 印尼 300+ 本地达人矩阵，月均带货 GMV 2000 万，支持直播代播。', highlights: ['有成功案例', '7 天内交付'] },
    need: { type: '找合作伙伴', text: '寻找有爆款潜力的家居、美妆品牌，佣金 15% + 坑位费，可先试播一场。', budget: '10 万以内', deadline: '长期有效', prefer: ['可提供样品'] },
  },
  {
    id: 'b3', company: '良品出海（广州）', logo: '良', cert: true, region: ['东南亚'], time: '昨天', match: 64, views: 158, intents: 9,
    reasons: ['同在印尼找分销，可共享爪哇岛渠道名录', '对方熟悉清真认证流程，可交流经验'],
    contact: '良品出海 · 周经理 · 020 8888 2210',
    offer: { types: ['生产制造', '认证资质'], text: '已获 BPJPH 清真认证的零食产品线 60 个 SKU，支持贴牌与小单。', highlights: ['已获当地认证', '可小单试产'] },
    need: { type: '找分销渠道', text: '寻找覆盖爪哇岛现代渠道（便利店、超市）的分销伙伴，分成合作。', budget: '面议', deadline: '3 个月内', prefer: ['本地有实体'] },
  },
  {
    id: 'b4', company: '北美园区服务中心', logo: '北', cert: true, region: ['拉美'], time: '昨天', match: 58, views: 312, intents: 14,
    reasons: ['如果考虑近岸供应北美，可作为备选产能落点', '对方已具备 IMMEX 保税资质，可降低关税成本'],
    contact: '园区招商 · Carlos 李 · +52 81 2200 7766',
    offer: { types: ['海外仓储', '本地化运营'], text: '墨西哥蒙特雷 1.2 万㎡标准厂房，已具备 IMMEX 资质，可即刻入驻。', highlights: ['已有海外仓'] },
  },
  {
    id: 'b5', company: '某新能源储能企业', logo: '新', cert: false, region: ['中东'], time: '3 天前', match: 47, views: 96, intents: 4, scope: '仅认证企业',
    reasons: ['同样关注沙特市场，可交流本地合资经验', '对方的需求与你的主营品类关联较弱'],
    contact: '投资部 · 王总 · 138 2600 1180',
    need: { type: '找资金/投资', text: '寻找沙特本地资本合资建设储能组装厂，首期投资约 3000 万美元。', budget: '200 万以上', deadline: '3 个月内', prefer: ['本地有实体', '已认证企业'] },
  },
  {
    id: 'b6', company: '平阳精密电子', logo: '平', cert: false, region: ['东南亚'], time: '3 天前', match: 41, views: 91, intents: 3,
    reasons: ['同在东南亚布局制造，可共享用工渠道', '对方的主营品类与你差异较大'],
    contact: '平阳精密 · HR 阮小姐 · +84 274 3800 166',
    offer: { types: ['生产制造'], text: '越南平阳 2 万㎡厂房，SMT 产线有空余产能，可承接代工。', highlights: ['可小单试产'] },
    need: { type: '找人才', text: '招聘 30 名中越双语班组长与 2 名人事专员，包食宿。', budget: '面议', deadline: '1 个月内', prefer: [] },
  },
]

/** The signed-in user's own posts: one live, one expired, so every status in 我的发布 has a seed. */
export const myPostSeeds: Post[] = [
  {
    id: 'my1', company: '深圳海鲸家居科技有限公司', logo: '鲸', cert: false, region: ['中东', '东南亚'], time: '3 天前', match: 0, views: 236, intents: 3,
    mine: true, status: '已发布', expire: '30 天', scope: '所有注册用户', rank: 12, contact: '林海 · 138 0013 8000',
    offer: { types: ['生产制造', '海外仓储'], text: '年产 60 万件收纳家居，支持 OEM/ODM 小单试产，雅加达有 3000㎡ 本地仓。', highlights: ['支持 OEM/ODM', '已有海外仓', '可提供样品'] },
    need: { type: '找分销渠道', text: '寻找沙特、阿联酋的家居分销商或连锁卖场，首单 5–10 万美元。', budget: '50–200 万', deadline: '3 个月内', prefer: ['本地有实体', '同品类经验'] },
  },
  {
    id: 'my2', company: '深圳海鲸家居科技有限公司', logo: '鲸', cert: false, region: ['东南亚'], time: '45 天前', match: 0, views: 418, intents: 7,
    mine: true, status: '已过期', expire: '30 天', scope: '所有注册用户', rank: 40, contact: '林海 · 138 0013 8000',
    need: { type: '找服务商', text: '寻找印尼 TikTok Shop 代运营团队，负责家居类目直播与短视频，月预算 5 万元。', budget: '10–50 万', deadline: '1 个月内', prefer: ['同品类经验', '能开票'] },
  },
]

/** Companies that responded to the user's own posts. */
export const intents = [
  { id: 'i1', company: 'Al-Rashid Retail', logo: 'A', cert: true, match: 92, msg: '我们正在找收纳家居，能否先寄 3 款样品到利雅得？', time: '1 小时前' },
  { id: 'i2', company: '迪拜 HomeBox 采购部', logo: 'H', cert: true, match: 87, msg: '想了解 MOQ、交期和阿语包装能力，方便视频聊聊吗？', time: '昨天' },
  { id: 'i3', company: '利雅得家居电商卖家', logo: '利', cert: false, match: 71, msg: '我们在 Noon 上卖家居，月销 3000 单，想谈代工。', time: '2 天前' },
]

export type Meeting = {
  id: string
  title: string
  time: string
  with: string
  mode: string
  status: '待确认' | '已确认' | '已完成' | '已取消'
  /** Who sent the invitation; decides whether a pending meeting is mine to confirm. */
  by?: 'me' | 'them'
  postId?: string
  minutes?: { summary: string; points: string[]; todos: string[] }
}

export const meetings: Meeting[] = [
  { id: 'm1', title: '与 Al-Rashid 采购总监视频对接', time: '11月10日 周二 16:00', with: 'Omar Al-Rashid', mode: '视频会议', status: '待确认', by: 'them', postId: 'b1' },
  { id: 'm2', title: '陈思远 · 印尼设厂 1v1 咨询', time: '11月13日 周五 10:30', with: '陈思远', mode: '线下', status: '已确认', by: 'me' },
  {
    id: 'm3', title: '清源认证预审沟通', time: '11月6日 周五 15:00', with: '清源认证服务', mode: '电话', status: '已完成', by: 'me',
    minutes: {
      summary: '对方确认 20 个家居 SKU 可走 SNI 快速通道，整体周期约 10 周，报价 ¥36,000。',
      points: ['首批 8 个 SKU 先做型式检验，其余并行准备资料', '需提供工厂 ISO 9001 证书与近 3 个月出货记录', '印尼本地进口商资质可由对方代办，另收 ¥6,000'],
      todos: ['周三前发送 SKU 清单与材质说明', '确认是否代办进口商资质', '安排工厂验厂时间（11 月下旬）'],
    },
  },
]

export const sources = [
  { id: 's1', name: '印尼食品药品监督局', type: '政策', freq: '每日', on: true },
  { id: 's2', name: '商务部对外投资合作司', type: '政策', freq: '每日', on: true },
  { id: 's3', name: 'Tech in Asia', type: '媒体', freq: '实时', on: true },
  { id: 's4', name: '中国贸促会展览部', type: '展会', freq: '每周', on: false },
  { id: 's5', name: '沙特统计总局', type: '机构', freq: '每月', on: true },
]
export const recSources = [
  { id: 'r1', name: '东盟秘书处', type: '机构', freq: '每周' },
  { id: 'r2', name: 'Arab News Business', type: '媒体', freq: '实时' },
  { id: 'r3', name: '越南国家银行', type: '政策', freq: '每日' },
]

export const messages = [
  { id: 'n5', cat: '商机', title: '收到新的合作意向', body: 'Al-Rashid Retail 对你发布的「收纳家居 · 中东分销」感兴趣，匹配度 92%。', time: '09:12', unread: true },
  { id: 'n1', cat: '活动', title: '活动明天开始', body: '「中东选品与渠道闭门会」明天 14:00 开始，记得带上名片。', time: '10:20', unread: true },
  { id: 'n2', cat: '审核', title: '企业认证审核中', body: '预计 1–2 个工作日内完成，结果会第一时间通知你。', time: '昨天', unread: true },
  { id: 'n3', cat: '日报', title: '今天的日报已送达', body: '6 条跟你有关，第一条：印尼清真认证将全面强制。', time: '08:00', unread: false },
  { id: 'n4', cat: '活动', title: '候补成功', body: '你已从候补转为正式报名「越南工业园考察团」。', time: '11月2日', unread: false },
]

export const radar = {
  axes: ['模式清晰度', '区域准备度', '资源储备', '能力短板', '风险认知', '行动紧迫度'],
  values: [78, 64, 52, 45, 70, 86],
  peer: [60, 55, 58, 50, 55, 62],
  notes: ['已明确跨境电商+本地仓模式', '印尼有仓，中东尚空白', '服务商储备偏少', '本地化运营人才不足', '对认证政策敏感度高', '本季度窗口期紧'],
}
