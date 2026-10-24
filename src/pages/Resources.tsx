import { useRef, useState, type ReactNode } from 'react'
import { Star, MapPin, SlidersHorizontal, ShieldCheck, Heart, Lock, FileText, Award, Briefcase, Quote, Flag, Bot, UserRound, type LucideIcon } from 'lucide-react'
import { Aurora, Avatar, BottomBar, Btn, Card, CertBadge, Empty, LeadSheet, NavBar, Segmented, Sheet, Switch, Tag, useStore } from '../ui'
import { aiAgents, humanAgents, providerCats, providerServices, providers } from '../data'
import { AiAgentList, HumanAgentList } from './Agents'
import Moments from './Moments'

type Area = 'agent' | 'lib' | 'moments'
type Seg = 'ai' | 'human' | 'lib' | 'moments'
const SEGS: Seg[] = ['ai', 'human', 'lib', 'moments']
/** Route param → segment. '专家' and '服务商' are params from before the split into 出海 Agent and 出海资源库. */
const toSeg = (v?: string): Seg => (SEGS.includes(v as Seg) ? (v as Seg) : v === '专家' ? 'human' : v === '服务商' ? 'lib' : 'ai')
const areaOf = (s: Seg): Area => (s === 'ai' || s === 'human' ? 'agent' : s)
const INTRO: Record<Area, string> = {
  agent: '按国别 × 行业训练的 AI Agent 随时答疑；要跑现场、谈渠道，交给常驻当地的真人 Agent。',
  lib: '经平台人工核验的海外专业服务商：法务、财税、认证、物流、收款，按需对接。',
  moments: '同行、AI Agent 与真人 Agent 在一线看到的变化，比新闻早一步。',
}
const KINDS: ['ai' | 'human', LucideIcon, string, string][] = [['ai', Bot, 'AI Agent', `${aiAgents.length} 个国别 × 行业`], ['human', UserRound, '真人 Agent', `${humanAgents.length} 位常驻当地`]]

/** 资源 tab: 出海 Agent (AI + 真人), 出海资源库 (service providers) and 出海朋友圈 (the feed). */
export default function Resources({ initial }: { initial?: string }) {
  const { setParams } = useStore()
  const [seg, setSeg] = useState<Seg>(() => toSeg(initial))
  const [agentSeg, setAgentSeg] = useState<'ai' | 'human'>(() => (toSeg(initial) === 'human' ? 'human' : 'ai'))
  // Segments stay mounted once opened, so filters and drafts survive switching back and forth.
  const [seen, setSeen] = useState<Seg[]>(() => [toSeg(initial)])
  const top = useRef<HTMLDivElement>(null)
  const area = areaOf(seg)
  const go = (s: Seg) => {
    if (s === seg) return
    if (s === 'ai' || s === 'human') setAgentSeg(s)
    setSeg(s); setSeen((x) => (x.includes(s) ? x : [...x, s])); setParams(s)
    const scroller = top.current?.closest<HTMLElement>('.overflow-y-auto')
    if (scroller && scroller.scrollTop > 0) scroller.scrollTo({ top: 0 })
  }
  const pane = (s: Seg, node: ReactNode) => seen.includes(s) && <div className={seg === s ? '' : 'hidden'}>{node}</div>
  return (
    <div ref={top} className="relative">
      <Aurora className="h-[300px]" />
      <div className="relative px-4 pt-[72px]">
        <Segmented
          items={[{ key: 'agent', label: '出海 Agent' }, { key: 'lib', label: '出海资源库' }, { key: 'moments', label: '出海朋友圈' }]}
          value={area}
          onChange={(a) => go(a === 'agent' ? agentSeg : a)}
        />
        <p className="mt-3 px-1 text-[13px] leading-[19px] text-muted">{INTRO[area]}</p>
        {area === 'agent' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {KINDS.map(([k, I, t, d]) => {
              const on = seg === k
              return (
                <button key={k} onClick={() => go(k)} aria-pressed={on} className={`flex items-center gap-2.5 rounded-[18px] border p-3 text-left transition active:scale-[0.98] ${on ? 'border-ink bg-ink text-white shadow-[0_12px_28px_-14px_rgba(11,19,36,0.7)]' : 'border-white bg-white/70 backdrop-blur'}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${on ? 'bg-white/15 text-white' : k === 'ai' ? 'bg-ai-soft text-ai' : 'bg-brand-soft text-brand'}`}><I size={18} /></span>
                  <span className="min-w-0"><span className="block text-[14px] font-semibold">{t}</span><span className={`block truncate text-[11px] ${on ? 'text-white/60' : 'text-muted'}`}>{d}</span></span>
                </button>
              )
            })}
          </div>
        )}
        {area === 'lib' && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[['1,280', '家服务商'], [String(providerCats.length), '大服务类目'], ['100%', '资质人工核验']].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-white bg-white/60 px-3 py-2.5 backdrop-blur">
                <div className="font-display text-[20px] font-bold leading-6">{n}</div>
                <div className="text-[11px] text-muted">{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative mt-4">
        {pane('ai', <AiAgentList />)}
        {pane('human', <HumanAgentList />)}
        {pane('lib', <ProviderList />)}
        {pane('moments', <Moments />)}
      </div>
    </div>
  )
}

function ProviderList() {
  const { push, toast } = useStore()
  const [cat, setCat] = useState('全部')
  const [filter, setFilter] = useState(false)
  const [onlyCert, setOnlyCert] = useState(false)
  const [area, setArea] = useState('全部')
  const list = providers.filter((p) => (cat === '全部' || p.cat === cat) && (!onlyCert || p.cert) && (area === '全部' || p.area.includes(area)))
  return (
    <>
      <div className="sticky top-16 z-20 flex items-center gap-2 bg-canvas/85 py-2.5 pl-4 backdrop-blur-xl">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">{['全部', ...providerCats].map((c) => <Tag key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Tag>)}</div>
        <button onClick={() => setFilter(true)} aria-label="筛选" className={`mr-4 grid h-8 w-8 shrink-0 place-items-center rounded-full border ${onlyCert || area !== '全部' ? 'border-ink bg-ink text-white' : 'border-line bg-white'}`}><SlidersHorizontal size={15} /></button>
      </div>
      {!list.length ? <Empty icon={<Briefcase />} text="这个分类还在补充" action="告诉我们需要什么" onAction={() => toast('已收到，我们会尽快补充')} /> : (
        <div className="space-y-3 px-4 pt-1">
          {list.map((p) => (
            <Card key={p.id} onClick={() => push({ name: 'provider', params: p.id })} className="!p-3.5">
              <div className="flex gap-3">
                <Avatar text={p.logo} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><span className="truncate text-[16px] font-bold">{p.name}</span>{p.cert ? <CertBadge /> : <CertBadge state="未认证" />}</div>
                  <p className="mt-0.5 truncate text-[13px] text-muted">{p.pitch}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] text-muted">{p.cat}</span>
                    <span className="flex items-center gap-0.5 rounded-full bg-chip px-2 py-0.5 text-[11px] text-muted"><MapPin size={11} />{p.area}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5">
                <span className="flex items-center gap-1 text-[12px]"><Star size={13} className="fill-accent text-accent" /><b className="font-display">{p.rating}</b><span className="text-subtle">· {p.cases.toLocaleString()} 个案例</span></span>
                <span className="font-display text-[15px] font-bold">{p.price}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Sheet open={filter} onClose={() => setFilter(false)} title="筛选服务商">
        <p className="text-[13px] font-medium text-muted">服务区域</p>
        <div className="mt-2 flex flex-wrap gap-2">{['全部', '东南亚', '中东', '欧洲', '北美', '印尼', '全球'].map((a) => <Tag key={a} active={area === a} onClick={() => setArea(a)}>{a}</Tag>)}</div>
        <p className="mt-5 text-[13px] font-medium text-muted">价格区间</p>
        <div className="mt-2 flex flex-wrap gap-2">{['不限', '1 万以下', '1–5 万', '5 万以上'].map((a, i) => <Tag key={a} active={!i}>{a}</Tag>)}</div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-chip px-4 py-3 text-[15px]">只看已认证<Switch on={onlyCert} onChange={setOnlyCert} /></div>
        <Btn onClick={() => setFilter(false)} className="mt-5 w-full">查看 {list.length} 家</Btn>
      </Sheet>
    </>
  )
}

export function ProviderDetail({ id }: { id: string }) {
  const { cert, push, favs, toggleFav, toast } = useStore()
  const p = providers.find((x) => x.id === id) ?? providers[0]
  const [lead, setLead] = useState(false)
  const fav = favs.includes(p.id)
  const ok = cert === '已认证'
  return (
    <div className="min-h-full pb-32">
      <NavBar title="服务商详情" />
      <div className="px-4 pt-3">
        <div className="flex items-center gap-3.5">
          <Avatar text={p.logo} size={60} />
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight">{p.name}</h1>
            <div className="mt-1 flex items-center gap-2">{p.cert ? <CertBadge /> : <CertBadge state="未认证" />}<span className="flex items-center gap-0.5 text-[13px]"><Star size={13} className="fill-accent text-accent" /><b className="font-display">{p.rating}</b></span><span className="text-[13px] text-muted">{p.area}</span></div>
          </div>
        </div>
        <p className="mt-3 text-[15px] leading-[22px] text-muted">{p.pitch}</p>
      </div>

      <div className="relative mx-4 mt-4 overflow-hidden rounded-[24px] bg-ink p-5 text-white">
        <div aria-hidden className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-brand to-brand-2 opacity-40 blur-2xl" />
        <div className="relative flex items-center gap-2 text-[17px] font-bold"><ShieldCheck size={20} />资质已核</div>
        <p className="relative mt-1 text-[11px] text-white/60">平台于 2026-09-14 完成人工审核并留痕</p>
        <div className="relative mt-4 grid grid-cols-4 gap-2 text-center">
          {[[FileText, '营业执照'], [Award, '行业资质'], [p.years + '年', '成立年限'], [p.cases.toLocaleString(), '服务案例']].map(([A, b]: any, i) => (
            <div key={b} className="rounded-2xl bg-white/[0.07] py-2.5"><div className="mx-auto grid h-7 place-items-center font-display text-[17px] font-bold">{i < 2 ? <A size={19} /> : A}</div><div className="mt-0.5 text-[11px] text-white/70">{b}</div></div>
          ))}
        </div>
      </div>

      <Card className="mx-4 mt-3">
        <h2 className="text-[16px] font-bold">服务与报价</h2>
        {(providerServices[p.cat] ?? providerServices.法务合规).map(([a, b]) => <div key={a} className="flex justify-between border-b border-line/70 py-3 text-[15px] last:border-0"><span>{a}</span><span className="font-display font-semibold">{b}</span></div>)}
        <p className="mt-1 rounded-xl bg-chip px-3 py-2 text-[12px] text-muted">适合：年营收 2000 万以上、计划设立海外主体的企业</p>
      </Card>
      <Card className="mx-4 mt-3">
        <h2 className="text-[16px] font-bold">案例与评价</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">{[['家居 · 印尼', '45 天完成 PT PMA 设立'], ['美妆 · 马来西亚', '一次通过清真审核']].map(([a, b]) => <div key={a} className="rounded-2xl bg-chip p-3"><span className="text-[11px] text-muted">{a}</span><p className="mt-0.5 text-[14px] font-semibold leading-5">{b}</p></div>)}</div>
        <div className="mt-4 rounded-2xl border border-line/70 p-3">
          <div className="flex items-center gap-2 text-[13px]"><Quote size={14} className="text-brand" /><b>王总</b><CertBadge /><span className="ml-auto text-subtle">10月</span></div>
          <p className="mt-1.5 text-[13px] text-muted">响应快，流程透明，报价和最终一致。</p>
        </div>
        <button onClick={() => toast('已举报，我们会核实')} className="mt-3 flex items-center gap-1 text-[11px] text-subtle"><Flag size={11} />举报该服务商</button>
      </Card>
      <Card className="mx-4 mt-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">联系方式</h2>
        {ok ? <p className="font-display text-[15px]">商务对接 · 139 2288 6600</p> : <p className="flex items-center gap-1 text-[13px] text-subtle"><Lock size={14} />认证后可查看</p>}
      </Card>
      <BottomBar>
        <button onClick={() => { toggleFav(p.id); toast(fav ? '已取消收藏' : '已收藏') }} aria-label="收藏" className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${fav ? 'border-accent/30 bg-accent-soft text-accent' : 'border-line bg-white text-muted'}`}><Heart size={20} className={fav ? 'fill-accent' : ''} /></button>
        {ok ? <Btn onClick={() => setLead(true)} className="flex-1">我想了解</Btn> : <Btn kind="brand" onClick={() => push({ name: 'cert' })} className="flex-1"><Lock size={16} />认证后可联系</Btn>}
      </BottomBar>
      <LeadSheet open={lead} onClose={() => setLead(false)} target={p.name} />
    </div>
  )
}
