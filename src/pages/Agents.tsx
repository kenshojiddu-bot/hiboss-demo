import { useEffect, useRef, useState } from 'react'
import { BatteryCharging, Bot, ChevronDown, ChevronLeft, ChevronRight, Coffee, Cog, Flower2, History, House, Info, Lock, MapPin, MessageCircle, Mic, Send, ShieldCheck, Smartphone, Sofa, Square, Star, UserRound, Wand2, type LucideIcon } from 'lucide-react'
import { BottomBar, Btn, Card, CertBadge, Empty, LeadSheet, NavBar, Sheet, Tag, useStore, type Profile } from '../ui'
import { agentCountries, agentIndustries, aiAgents, humanAgents, providers, type AiAgent, type HumanAgent } from '../data'

const INDUSTRY_ICON: Record<string, LucideIcon> = { 家居: Sofa, 美妆个护: Flower2, 消费电子: Smartphone, 食品饮料: Coffee, 机械设备: Cog, 新能源: BatteryCharging }
const REGION_GRAD: Record<string, string> = { 东南亚: 'from-brand to-brand-2', 中东: 'from-accent-ink to-accent', 拉美: 'from-success to-brand-2', 欧洲: 'from-ai-ink to-ai' }

/** An AI agent's avatar: its country code on a region-coloured tile, with the industry as a badge. */
export function AgentMark({ a, size = 44, badge = true, className = '' }: { a: AiAgent; size?: number; badge?: boolean; className?: string }) {
  const I = INDUSTRY_ICON[a.industry] ?? Bot
  const b = Math.round(size * 0.46)
  return (
    <span className={`relative inline-block shrink-0 rounded-[32%] ${className}`} style={{ width: size, height: size }}>
      <span className={`grid h-full w-full place-items-center rounded-[32%] bg-linear-to-br font-display font-bold tracking-wide text-white ${REGION_GRAD[a.region] ?? 'from-brand to-brand-2'}`} style={{ fontSize: Math.round(size * 0.32) }}>{a.code}</span>
      {badge && <span className="absolute -bottom-1 -right-1 grid place-items-center rounded-full border-2 border-white bg-white text-ink shadow-sm" style={{ width: b, height: b }}><I size={Math.round(size * 0.26)} /></span>}
    </span>
  )
}

const INDUSTRY_HINTS: [string, string][] = [['家居', '家居'], ['家具', '家居'], ['收纳', '家居'], ['美妆', '美妆个护'], ['化妆', '美妆个护'], ['电子', '消费电子'], ['蓝牙', '消费电子'], ['食品', '食品饮料'], ['零食', '食品饮料'], ['机械', '机械设备'], ['储能', '新能源'], ['光伏', '新能源']]
/** Industry is inferred from free text (company name, headline) until the profile stores it explicitly. */
const industryIn = (text: string) => INDUSTRY_HINTS.find(([k]) => text.includes(k))?.[1]

/** One agent per target market in the profile, in the user's own industry where one exists. */
export function myAgents(p: Profile): AiAgent[] {
  const ind = industryIn(p.company) ?? '家居'
  const team = p.countries
    .map((c) => { const pool = aiAgents.filter((a) => a.region === c || a.country === c); return pool.find((a) => a.industry === ind) ?? pool[0] })
    .filter((a): a is AiAgent => !!a)
  return team.length ? [...new Set(team)] : [aiAgents[0]]
}

/** The agent best placed to answer about a piece of content: a country named in the text first, then its region tags. */
export function agentFor(tags: string[], text: string, p: Profile): AiAgent {
  const ind = industryIn(text) ?? industryIn(p.company) ?? '家居'
  const named = aiAgents.filter((a) => text.includes(a.country))
  const pool = named.length ? named : aiAgents.filter((a) => tags.some((t) => t === a.country || t === a.region))
  return pool.find((a) => a.industry === ind) ?? pool[0] ?? myAgents(p)[0]
}

const humanOf = (a: AiAgent) => humanAgents.find((h) => h.id === a.human)
const statusCls: Record<HumanAgent['status'], string> = { 可约: 'bg-success text-white', 本周满: 'bg-accent text-white', 暂不可约: 'bg-ink/60 text-white' }
const chip = 'rounded-full bg-chip px-2 py-0.5 text-[11px] text-muted'

/** 出海 Agent → AI Agent: every country × industry agent, the user's own team first. */
export function AiAgentList() {
  const { profile, toast } = useStore()
  const [country, setCountry] = useState('全部')
  const [industry, setIndustry] = useState('全部')
  const [req, setReq] = useState(false)
  const [want, setWant] = useState({ c: '', i: '' })
  const mine = myAgents(profile).map((a) => a.id)
  const list = aiAgents
    .filter((a) => (country === '全部' || a.country === country) && (industry === '全部' || a.industry === industry))
    .sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)))
  const openReq = () => { setWant({ c: country === '全部' ? '' : country, i: industry === '全部' ? '' : industry }); setReq(true) }
  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {['全部', ...agentCountries].map((c) => <Tag key={c} active={country === c} onClick={() => setCountry(c)}>{c === '全部' ? '全部国家' : c}</Tag>)}
      </div>
      <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto px-4">
        {['全部', ...agentIndustries].map((i) => (
          <button key={i} onClick={() => setIndustry(i)} className={`h-7 shrink-0 rounded-full px-3 text-[12px] transition ${industry === i ? 'bg-ai-soft font-semibold text-ai-ink' : 'text-muted'}`}>{i === '全部' ? '全部行业' : i}</button>
        ))}
      </div>
      <div className="mt-3 space-y-3 px-4">
        {list.map((a) => <AgentCard key={a.id} a={a} mine={mine.includes(a.id)} />)}
        {!list.length && <Card><Empty icon={<Bot size={26} />} text={`${[country, industry].filter((x) => x !== '全部').join(' × ')} 的 Agent 还在训练中`} action="提交需求，优先上线" onAction={openReq} /></Card>}
        <button onClick={openReq} className="flex w-full items-center gap-3 rounded-[20px] border border-dashed border-ai/30 bg-white/60 p-3.5 text-left transition active:scale-[0.99]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ai-soft text-ai"><Wand2 size={19} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">没有你要的「国别 × 行业」？</span><span className="block text-[12px] text-muted">提交需求，平台按需训练新的 Agent</span></span>
          <ChevronRight size={16} className="shrink-0 text-subtle" />
        </button>
      </div>
      <Sheet open={req} onClose={() => setReq(false)} title="定制出海 Agent">
        <p className="text-[13px] font-medium text-muted">国家</p>
        <div className="mt-2 flex flex-wrap gap-2">{[...agentCountries, '马来西亚', '菲律宾', '巴西', '日本'].map((c) => <Tag key={c} active={want.c === c} onClick={() => setWant({ ...want, c })}>{c}</Tag>)}</div>
        <p className="mt-5 text-[13px] font-medium text-muted">行业</p>
        <div className="mt-2 flex flex-wrap gap-2">{[...agentIndustries, '汽车配件', '服装鞋包'].map((i) => <Tag key={i} active={want.i === i} onClick={() => setWant({ ...want, i })}>{i}</Tag>)}</div>
        <Btn disabled={!want.c || !want.i} onClick={() => { setReq(false); toast(`已提交「${want.c} · ${want.i}」，上线后第一时间通知你`) }} className="mt-6 w-full">提交需求</Btn>
      </Sheet>
    </div>
  )
}

function AgentCard({ a, mine }: { a: AiAgent; mine: boolean }) {
  const { push } = useStore()
  return (
    <Card onClick={() => push({ name: 'agent', params: { id: a.id } })} className="!p-3.5">
      <div className="flex gap-3">
        <AgentMark a={a} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[16px] font-bold">{a.country} · {a.industry} Agent</span>
            {mine && <span className="ml-auto shrink-0 rounded-full bg-linear-to-r from-ai to-brand px-2 py-0.5 text-[10px] font-semibold text-white">匹配你</span>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[19px] text-muted">{a.intro}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{a.focus.map((f) => <span key={f} className={chip}>{f}</span>)}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
        <span className="truncate text-[11px] text-subtle"><b className="font-display font-semibold text-ink">{a.feeds}</b> 个信源 · <b className="font-display font-semibold text-ink">{a.asked.toLocaleString()}</b> 人问过 · {a.updated}更新</span>
        <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-3 text-[12px] font-medium text-white"><MessageCircle size={13} />提问</span>
      </div>
    </Card>
  )
}

/** 出海 Agent → 真人 Agent: people based in the market, bookable for on-site work. */
export function HumanAgentList() {
  const { push } = useStore()
  const [country, setCountry] = useState('全部')
  const countries = ['全部', ...new Set(humanAgents.map((h) => h.country))]
  const list = humanAgents.filter((h) => country === '全部' || h.country === country)
  return (
    <div>
      <div className="mx-4 flex gap-2 rounded-2xl bg-brand-soft p-3.5 text-[12px] leading-[18px] text-brand"><Info size={15} className="mt-0.5 shrink-0" />真人 Agent 常驻当地，替你跑现场、谈渠道、办手续。身份与履历经平台核验，服务全程留痕。</div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">{countries.map((c) => <Tag key={c} active={country === c} onClick={() => setCountry(c)}>{c === '全部' ? '全部国家' : c}</Tag>)}</div>
      <div className="mt-3 space-y-3 px-4">
        {list.map((h) => (
          <Card key={h.id} onClick={() => push({ name: 'human', params: h.id })} className="!p-3">
            <div className="flex gap-3">
              <div className="relative shrink-0">
                <img src={h.avatar} alt={h.name} className="h-[100px] w-[84px] rounded-2xl object-cover" />
                <span className={`absolute inset-x-1.5 bottom-1.5 rounded-full py-0.5 text-center text-[10px] font-medium ${statusCls[h.status]}`}>{h.status}</span>
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-1"><span className="truncate text-[16px] font-bold">{h.name}</span><ShieldCheck size={14} className="shrink-0 text-brand" /></div>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><MapPin size={12} className="shrink-0" />常驻{h.city} · {h.industries.join(' / ')}</p>
                <p className="mt-1 truncate text-[12px] text-subtle">{h.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">{h.skills.map((s) => <span key={s} className={chip}>{s}</span>)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-2.5 text-[12px]">
              <span className="flex min-w-0 items-center gap-1"><Star size={13} className="shrink-0 fill-accent text-accent" /><b className="font-display">{h.rating.toFixed(1)}</b><span className="truncate text-subtle">· 服务 {h.served} 家 · {h.reply}内回复</span></span>
              <span className="shrink-0 font-display text-[15px] font-bold">{h.services[0][2]}<span className="text-[11px] font-normal text-subtle"> 起</span></span>
            </div>
          </Card>
        ))}
      </div>
      <p className="px-4 pt-4 text-center text-[11px] text-subtle">真人 Agent 的建议仅供参考，不构成法律或投资意见</p>
    </div>
  )
}

/** 真人 Agent detail: who they are on the ground, what they can do, and a certification-gated booking. */
export function HumanAgentDetail({ id }: { id: string }) {
  const { cert, push } = useStore()
  const h = humanAgents.find((x) => x.id === id) ?? humanAgents[0]
  const ai = aiAgents.find((a) => a.human === h.id) ?? aiAgents.find((a) => a.country === h.country)
  const [svc, setSvc] = useState(0)
  const [lead, setLead] = useState(false)
  const ok = cert === '已认证'
  const off = h.status === '暂不可约'
  return (
    <div className="min-h-full pb-32">
      <NavBar title="真人 Agent" />
      <div className="relative mx-4 mt-2 overflow-hidden rounded-[28px]">
        <img src={h.avatar} alt={h.name} className="aspect-[4/3.4] w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusCls[h.status]}`}>{h.status}</span>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="flex items-center gap-2"><h1 className="truncate text-[26px] font-bold tracking-tight">{h.name}</h1><CertBadge /></div>
          <p className="text-[14px] text-white/85">{h.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/60"><MapPin size={12} />常驻{h.city} · {h.langs.join(' / ')}</p>
        </div>
      </div>
      <div className="mx-4 mt-3 grid grid-cols-4 gap-2 text-center">
        {[[`${h.years}年`, '当地经验'], [String(h.served), '服务企业'], [h.rating.toFixed(1), '综合评分'], [h.reply, '平均回复']].map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-line/70 bg-white py-2.5"><div className="font-display text-[16px] font-bold leading-6">{n}</div><div className="text-[11px] text-muted">{l}</div></div>
        ))}
      </div>
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-1.5">{[...h.industries, ...h.skills].map((t) => <span key={t} className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-brand">{t}</span>)}</div>
        <p className="mt-3 text-[15px] leading-[23px]">“{h.intro}”</p>
      </div>
      <Card className="mx-4 mt-4">
        <h2 className="text-[16px] font-bold">能替你做</h2>
        <div className="mt-3 space-y-2">
          {h.services.map(([a, b, c], i) => (
            <button key={a} onClick={() => setSvc(i)} className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition ${svc === i ? 'border-ink bg-ink text-white' : 'border-line'}`}>
              <div><div className="text-[15px] font-semibold">{a}</div><div className={`text-[11px] ${svc === i ? 'text-white/60' : 'text-muted'}`}>{b}</div></div>
              <span className="font-display font-semibold">{c}</span>
            </button>
          ))}
        </div>
      </Card>
      {ai && (
        <Card onClick={() => push({ name: 'agent', params: { id: ai.id } })} className="mx-4 mt-3 flex items-center gap-3 !p-3.5">
          <AgentMark a={ai} size={40} />
          <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold">先问 {ai.country} · {ai.industry} Agent</p><p className="mt-0.5 text-[12px] leading-[17px] text-muted">AI 先帮你把问题理清，再约 {h.name} 更省时</p></div>
          <ChevronRight size={16} className="shrink-0 text-subtle" />
        </Card>
      )}
      <Card className="mx-4 mt-3">
        <h2 className="text-[16px] font-bold">服务案例</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">{h.cases.map(([a, b]) => <div key={a} className="rounded-2xl bg-chip p-3"><span className="text-[11px] text-muted">{a}</span><p className="mt-0.5 text-[14px] font-semibold leading-5">{b}</p></div>)}</div>
      </Card>
      <Card className="mx-4 mt-3">
        <h2 className="text-[16px] font-bold">近期可约</h2>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[12px]">
          {['周二 上午', '周三 下午', '周五 上午', '下周一'].map((d, i) => <div key={d} className={`rounded-xl py-2.5 ${off || (h.status === '本周满' && i < 3) ? 'bg-chip text-subtle line-through' : 'bg-success-soft font-medium text-success'}`}>{d}</div>)}
        </div>
        <p className="mt-2 text-[11px] text-subtle">均为当地时间，提交预约后由 TA 确认</p>
      </Card>
      {!ok && <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-accent-soft px-3.5 py-3 text-[12px] leading-[18px] text-accent-ink"><Lock size={14} className="shrink-0" />可以先浏览，预约真人 Agent 需要先完成企业认证</div>}
      <p className="px-4 pt-4 text-center text-[11px] text-subtle">真人 Agent 的建议仅供参考，不构成法律或投资意见</p>
      <BottomBar>
        {ok ? <Btn disabled={off} onClick={() => setLead(true)} className="flex-1">{off ? '暂不可约' : `预约 · ${h.services[svc][0]}`}</Btn>
          : <Btn kind="brand" onClick={() => push({ name: 'cert' })} className="flex-1"><Lock size={16} />认证后可预约</Btn>}
      </BottomBar>
      <LeadSheet open={lead} onClose={() => setLead(false)} target={`${h.name} · ${h.services[svc][0]}`} title="预约真人 Agent" withTime />
    </div>
  )
}

type Msg = { role: 'user' | 'ai'; text: string; full?: string; sources?: string[]; follow?: string[]; unknown?: boolean; typing?: boolean }
const HISTORY: [string, string, string][] = [['印尼清真认证流程', 'a2', '1 天前'], ['沙特 VAT 申报', 'a3', '2 天前'], ['越南设厂选址', 'a5', '3 天前']]
const ALL_SOURCES = '__all_sources__'

/** Chat with one country × industry agent. Questions it cannot answer go to a human agent instead of being guessed. */
export default function AgentChat({ params }: { params?: { id?: string; q?: string } | string }) {
  const { push, back, tab, toast, profile } = useStore()
  // Older links passed the question itself as the route param.
  const p = typeof params === 'string' ? { id: undefined, q: params } : params ?? {}
  const mine = myAgents(profile).map((a) => a.id)
  const [agent, setAgent] = useState<AiAgent>(() => aiAgents.find((a) => a.id === p.id) ?? aiAgents.find((a) => a.id === mine[0]) ?? aiAgents[0])
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [pick, setPick] = useState(false)
  const [hist, setHist] = useState(false)
  const [openSrc, setOpenSrc] = useState<string | null>(null)
  const [expand, setExpand] = useState<number | null>(null)
  const asked = useRef(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  useEffect(() => {
    // StrictMode replays mount effects; the ref keeps the linked question from being asked twice.
    if (p.q && !asked.current) { asked.current = true; ask(`关于「${p.q}」，对我有什么影响？`) }
  }, [])
  // Streams the pending answer a few characters per tick. Re-arming one timeout per update cleans up with the page and survives StrictMode replays.
  useEffect(() => {
    const last = msgs[msgs.length - 1]
    if (!last?.typing) return
    const id = setTimeout(() => {
      if (last.text.length + 3 >= (last.full ?? '').length) finish(true)
      else setMsgs((m) => { const c = [...m]; const l = c[c.length - 1]; c[c.length - 1] = { ...l, text: (l.full ?? '').slice(0, l.text.length + 3) }; return c })
    }, 40)
    return () => clearTimeout(id)
  }, [msgs])
  const typing = msgs.some((m) => m.typing)
  const human = humanOf(agent)
  const provider = providers.find((x) => x.id === agent.provider)
  const follow = ['要准备哪些材料？', '有推荐的服务商吗？', ...(human ? ['找当地真人 Agent'] : [])]

  function ask(text: string) {
    if (!text.trim() || typing) return
    setInput('')
    const unknown = /股票|彩票|天气/.test(text)
    const full = unknown
      ? `这个问题超出了我的训练范围，不想给你编一个答案。${human ? `可以转给常驻${human.city}的真人 Agent ${human.name} 确认。` : '可以先咨询平台认证的服务商。'}`
      : `按你的画像（${industryIn(profile.company) ?? '家居'} · ${profile.stage}），这个问题在${agent.country}主要取决于三件事：${agent.focus[0]}①、${agent.focus[1]}②，以及${agent.focus[2]}③。${agent.tip}`
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'ai', text: '', full, typing: true, unknown }])
  }
  /** Ends the pending answer: in full when streaming completes, or where it stands when the user taps stop. */
  function finish(complete = false) {
    setMsgs((m) => { const c = [...m]; const last = c[c.length - 1]; c[c.length - 1] = { ...last, text: complete ? last.full ?? last.text : last.text, typing: false, sources: last.unknown ? undefined : agent.refs, follow: last.unknown ? undefined : follow }; return c })
  }
  const switchTo = (a: AiAgent) => {
    setPick(false); setHist(false)
    if (a.id === agent.id) return
    setAgent(a); setMsgs([]); setExpand(null)
  }
  const onFollow = (f: string) => {
    if (f.includes('服务商')) push({ name: 'provider', params: agent.provider })
    else if (f.includes('真人') && human) push({ name: 'human', params: human.id })
    else ask(f)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="relative z-10 flex h-12 shrink-0 items-center gap-2 border-b border-line/70 bg-white px-3 shadow-sm">
        <button onClick={back} aria-label="返回上一页" title="返回上一页" className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full border border-line bg-white pl-1 pr-2 text-[13px] font-medium"><ChevronLeft size={18} />返回</button>
        <button onClick={() => setPick(true)} aria-label="切换 Agent" className="flex min-w-0 items-center gap-1.5">
          <AgentMark a={agent} size={28} badge={false} />
          <span className="truncate text-[15px] font-semibold">{agent.country}·{agent.industry} Agent</span>
          <ChevronDown size={15} className="shrink-0 text-muted" />
        </button>
        <button onClick={() => setHist(true)} aria-label="历史会话" title="历史会话" className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-chip"><History size={18} /></button>
        <button onClick={() => tab('home')} aria-label="回到日报首页" title="回到日报首页" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium"><House size={15} />首页</button>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
        {!msgs.length && (
          <div className="animate-[fadeup_.3s_ease-out] pt-4 text-center">
            <div className="flex justify-center"><AgentMark a={agent} size={60} /></div>
            <p className="mt-4 text-[18px] font-bold">我是{agent.country} · {agent.industry} Agent</p>
            <p className="mx-auto mt-1 max-w-[280px] text-[13px] leading-[19px] text-muted">{agent.intro}</p>
            <p className="mt-2 text-[11px] text-subtle">盯着 {agent.feeds} 个信源 · {agent.updated}更新 · {agent.asked.toLocaleString()} 人问过</p>
            <div className="mt-5 space-y-2 text-left">{agent.hot.map((h) => <button key={h} onClick={() => ask(h)} className="block w-full rounded-2xl border border-line/70 bg-white px-4 py-3 text-left text-[15px] shadow-card transition active:scale-[0.99]">{h}</button>)}</div>
            {human && (
              <button onClick={() => push({ name: 'human', params: human.id })} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand/30 bg-white/70 p-3 text-left transition active:scale-[0.99]">
                <img src={human.avatar} alt={human.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">需要有人跑现场？</span><span className="block truncate text-[12px] text-muted">真人 Agent {human.name} · 常驻{human.city}</span></span>
                <ChevronRight size={16} className="shrink-0 text-subtle" />
              </button>
            )}
          </div>
        )}
        <div className="space-y-4">
          {msgs.map((m, i) => m.role === 'user' ? (
            <div key={i} className="flex justify-end"><div className="max-w-[80%] rounded-[20px] rounded-tr-md bg-ink px-4 py-2.5 text-[15px] text-white">{m.text}</div></div>
          ) : (
            <div key={i} className="flex max-w-[92%] gap-2">
              <AgentMark a={agent} size={28} badge={false} />
              <div className="min-w-0">
                <div className="rounded-[20px] rounded-tl-md border border-line/70 bg-white px-4 py-3 text-[15px] leading-[23px] shadow-card">
                  <p className={expand !== i && m.text.length > 90 && !m.typing ? 'line-clamp-3' : ''}>{m.text.split(/([①②③])/).map((s, j) => /[①②③]/.test(s) ? <button key={j} onClick={() => setOpenSrc(m.sources?.['①②③'.indexOf(s)] ?? null)} className="mx-0.5 font-bold text-ai">{s}</button> : s)}{m.typing && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-ai align-middle" />}</p>
                  {!m.typing && m.text.length > 90 && <button onClick={() => setExpand(expand === i ? null : i)} className="mt-1 text-[13px] font-medium text-brand">{expand === i ? '收起' : '展开全部'}</button>}
                  {m.sources && <button onClick={() => setOpenSrc(ALL_SOURCES)} className="mt-2 inline-flex h-7 items-center gap-1 rounded-full bg-chip px-2.5 text-[11px] text-muted"><span className="text-ai">来源</span><span>{m.sources.length} 条</span><ChevronRight size={12} /></button>}
                  {m.unknown && !m.typing && (human
                    ? <Btn kind="secondary" onClick={() => push({ name: 'human', params: human.id })} className="mt-3 w-full"><UserRound size={16} />转给真人 Agent · {human.name}</Btn>
                    : <Btn kind="secondary" onClick={() => push({ name: 'provider', params: agent.provider })} className="mt-3 w-full">咨询{provider?.name ?? '服务商'}</Btn>)}
                </div>
                {!m.typing && i === 1 && <p className="mt-1 px-1 text-[11px] text-subtle">以上为信息整理，不构成法律或投资建议</p>}
                {m.follow && i === msgs.length - 1 && <div className="mt-2 flex flex-wrap gap-2">{m.follow.map((f) => <button key={f} onClick={() => onFollow(f)} className="h-8 rounded-full border border-ai/20 bg-ai-soft px-3 text-[13px] text-ai-ink">{f}</button>)}</div>}
              </div>
            </div>
          ))}
        </div>
        <div ref={end} className="h-2" />
      </div>
      <div className="relative z-10 shrink-0 border-t border-line/70 bg-white px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <p className="mb-2 flex items-center gap-1 px-1 text-[11px] text-muted"><UserRound size={12} />按你的画像回答 · 答不了会转真人 Agent · 试试问「股票」</p>
        <div className="flex items-center gap-2">
          <button onClick={() => toast('按住说话（演示）')} aria-label="语音" className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-chip"><Mic size={20} /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} placeholder={`问${agent.country} · ${agent.industry}的问题…`} className="h-10 min-w-0 flex-1 rounded-full bg-chip px-4 text-[15px] outline-none focus:ring-4 focus:ring-brand/10" />
          {typing ? <button onClick={() => finish()} aria-label="停止" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white"><Square size={14} fill="white" /></button>
            : <button onClick={() => ask(input)} aria-label="发送" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand to-brand-2 text-white"><Send size={16} /></button>}
        </div>
      </div>
      <Sheet open={pick} onClose={() => setPick(false)} title="切换出海 Agent">
        <div className="space-y-2">
          {[...aiAgents].sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id))).map((a) => {
            const on = a.id === agent.id
            return (
              <button key={a.id} onClick={() => switchTo(a)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${on ? 'border-ink bg-ink text-white' : 'border-line bg-white'}`}>
                <AgentMark a={a} size={36} badge={false} />
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{a.country} · {a.industry}</span><span className={`block truncate text-[12px] ${on ? 'text-white/60' : 'text-muted'}`}>{a.intro}</span></span>
                {mine.includes(a.id) && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${on ? 'bg-white/15 text-white' : 'bg-ai-soft text-ai-ink'}`}>匹配你</span>}
              </button>
            )
          })}
        </div>
      </Sheet>
      <Sheet open={hist} onClose={() => setHist(false)} title="历史会话">
        {HISTORY.map(([t, id, when]) => {
          const a = aiAgents.find((x) => x.id === id) ?? aiAgents[0]
          return (
            <button key={t} onClick={() => switchTo(a)} className="flex w-full items-center gap-3 border-b border-line py-3.5 text-left last:border-0">
              <AgentMark a={a} size={32} badge={false} />
              <span className="min-w-0 flex-1"><span className="block text-[15px]">{t}</span><span className="block text-[11px] text-subtle">{a.country} · {a.industry} Agent</span></span>
              <span className="shrink-0 text-[11px] text-subtle">{when}</span>
            </button>
          )
        })}
      </Sheet>
      <Sheet open={!!openSrc} onClose={() => setOpenSrc(null)} title={openSrc === ALL_SOURCES ? '回答来源' : '来源'}>
        {openSrc === ALL_SOURCES ? (
          <div className="divide-y divide-line/70">
            {[...new Set(msgs.flatMap((m) => m.sources ?? []))].map((source, i) => <button key={source} onClick={() => setOpenSrc(source)} className="flex w-full items-start gap-3 py-3 text-left"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ai-soft text-[12px] font-semibold text-ai-ink">{'①②③'[i] ?? i + 1}</span><span className="text-[14px] font-medium leading-5">{source}</span></button>)}
          </div>
        ) : <>
          <p className="text-[15px] font-bold">{openSrc}</p>
          <p className="mt-2 text-[13px] text-muted">发布于 2026-11-02 · 已由平台核验，可在信息源管理中查看。</p>
          <Btn kind="secondary" onClick={() => toast('即将打开原文')} className="mt-4 w-full">查看原文</Btn>
        </>}
      </Sheet>
    </div>
  )
}
