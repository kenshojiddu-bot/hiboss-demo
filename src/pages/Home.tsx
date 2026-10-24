import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MoreHorizontal, Radar as RadarIcon, CalendarDays, Handshake, Briefcase, Bell, Send, WifiOff, ExternalLink, Flag, EyeOff, Info, Plus, Sparkles, MessageCircleQuestion } from 'lucide-react'
import { Aurora, Avatar, BottomBar, Btn, Card, Confirm, Empty, GateTag, MatchBadge, NavBar, Section, Sheet, Skeleton, Switch, useStore } from '../ui'
import { dailyItems, events, providers, recSources, sources as initSources } from '../data'
import { agentFor } from './Agents'

type HomeState = '有内容' | '无新内容' | '首次进入' | '加载中' | '网络失败'

export default function Home() {
  const { push, tab, feedback, setFeedback, toast, posts } = useStore()
  const [state, setState] = useState<HomeState>('有内容')
  const [menu, setMenu] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [remind, setRemind] = useState(false)
  const visible = dailyItems.filter((d) => feedback[d.id] !== 'hide')
  const fb = (id: string, v: 'up' | 'down') => { setFeedback(id, v); toast('已记录，明天会更准') }
  const matched = posts.filter((p) => !p.mine && (p.status ?? '已发布') === '已发布').sort((a, b) => b.match - a.match).slice(0, 2)

  const quick = [
    [RadarIcon, '我的画像', 'from-brand to-brand-2', () => push({ name: 'myPortrait' })],
    [CalendarDays, '本周活动', 'from-ai to-[#c084fc]', () => tab('events')],
    [Handshake, '发布需求', 'from-accent to-[#fdb022]', () => push({ name: 'publish', params: { focus: 'need' } })],
    [Briefcase, '找服务商', 'from-[#0e9384] to-[#5fe0b7]', () => push({ name: 'resources', params: 'lib' })],
  ] as const

  return (
    <div className="relative">
      <Aurora />
      <div className="relative px-4 pt-[72px]">
        <div className="font-display text-[12px] font-semibold tracking-[0.14em] text-muted">{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}</div>
        <h1 className="mt-1.5 text-[30px] font-bold leading-[38px] tracking-tight">
          {state === '首次进入' ? <>明早 8:00<br />送达第一份日报</> : <>今天有 <span className="text-gradient font-display">{visible.length}</span> 条<br />跟你有关</>}
        </h1>
        <button onClick={() => push({ name: 'agent' })} className="mt-5 flex h-[52px] w-full items-center gap-2.5 rounded-2xl border border-white bg-white/75 pl-4 pr-2 text-left text-[15px] text-subtle shadow-card backdrop-blur-xl">
          <MessageCircleQuestion size={19} className="shrink-0 text-ai" /><span className="truncate">问认证、渠道、设厂…</span>
          <span className="ml-auto shrink-0 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-white">出海 Agent</span>
        </button>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {quick.map(([I, t, g, fn]) => (
            <button key={t} onClick={fn} className="relative flex flex-col items-center gap-2 rounded-2xl border border-white bg-white/60 py-3 backdrop-blur transition active:scale-95">
              <span className={`grid h-10 w-10 place-items-center rounded-[14px] bg-linear-to-br text-white shadow-[0_8px_16px_-8px_rgba(11,19,36,0.4)] ${g}`}><I size={20} /></span>
              <span className="text-[12px] font-medium">{t}</span>
              {t === '发布需求' && <span className="absolute right-1.5 top-1.5 rounded-full bg-accent px-1.5 text-[9px] font-semibold leading-4 text-white">新</span>}
            </button>
          ))}
        </div>
      </div>

      {state === '网络失败' && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
          <WifiOff size={16} />网络不稳定，以下为离线缓存
          <button onClick={() => { setState('加载中'); setTimeout(() => setState('有内容'), 1200) }} className="ml-auto font-semibold">重试</button>
        </div>
      )}

      <Section title={state === '首次进入' ? '今日快讯' : '今日日报'} more={state === '有内容' ? '信息源' : undefined} onMore={() => push({ name: 'sources' })}>
        {state === '加载中' ? <Skeleton /> : state === '无新内容' ? (
          <div className="px-4"><Card><Empty icon={<Sparkles size={24} />} text="今天就是这些，没有新的了" action="看昨日未读 3 条" onAction={() => setState('有内容')} /></Card></div>
        ) : (
          <div className="space-y-3 px-4">
            {(state === '首次进入' ? dailyItems.slice(0, 3) : visible).map((d, i) => {
              const f = feedback[d.id]
              return (
                <Card key={d.id} onClick={() => push({ name: 'daily', params: d.id })} className={f ? 'opacity-60' : ''}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-[12px] font-semibold text-subtle">{String(i + 1).padStart(2, '0')}</span>
                    {d.tags.map((t, j) => <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${j ? 'bg-chip text-muted' : 'bg-brand-soft text-brand'}`}>{t}</span>)}
                    <span className="ml-auto font-display text-[11px] text-subtle">{d.time}</span>
                    <button onClick={(e) => { e.stopPropagation(); setMenu(d.id) }} aria-label="更多" className="-mr-1.5 grid h-7 w-7 place-items-center rounded-full text-subtle hover:bg-chip"><MoreHorizontal size={16} /></button>
                  </div>
                  <p className="mt-3 text-[17px] font-bold leading-6">{d.judgment}</p>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-[19px] text-muted">{d.title}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-1">
                    <span className="truncate text-[11px] text-subtle">来源 · {d.source}</span>
                    {f ? <span className="my-2.5 rounded-full bg-success-soft px-2 py-1 text-[11px] font-medium text-success">已反馈 · {f === 'up' ? '有用' : '没用'}</span> : (
                      <div className="-mr-2 flex">
                        <button onClick={(e) => { e.stopPropagation(); fb(d.id, 'up') }} className="flex h-11 items-center gap-1 rounded-full px-2.5 text-[13px] text-muted active:text-brand"><ThumbsUp size={15} />有用</button>
                        <button onClick={(e) => { e.stopPropagation(); fb(d.id, 'down') }} className="flex h-11 items-center gap-1 rounded-full px-2.5 text-[13px] text-muted"><ThumbsDown size={15} />没用</button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="分身帮你配的商机" more="商机广场" onMore={() => tab('biz')}>
        <div className="space-y-2.5 px-4">
          {matched.map((p) => (
            <Card key={p.id} onClick={() => push({ name: 'bizDetail', params: p.id })} className="!p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar text={p.logo} size={34} />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{p.company}</span>
                <MatchBadge value={p.match} />
              </div>
              {p.need && <p className="mt-2.5 line-clamp-1 text-[13px]"><span className="mr-1.5 rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand">需要</span>{p.need.text}</p>}
              {p.offer && <p className="mt-1.5 line-clamp-1 text-[13px]"><span className="mr-1.5 rounded-full bg-success-soft px-1.5 py-0.5 text-[11px] font-medium text-success">能做</span>{p.offer.text}</p>}
            </Card>
          ))}
          <button onClick={() => push({ name: 'publish' })} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand/40 bg-white/60 text-[14px] font-medium text-brand">
            <Plus size={16} />发布我的「能做什么 / 需要什么」
          </button>
        </div>
      </Section>

      <Section title="本周值得去" more="全部活动" onMore={() => tab('events')}>
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {events.slice(0, 3).map((e) => (
            <div key={e.id} onClick={() => push({ name: 'event', params: e.id })} className="w-[248px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[20px] border border-line/70 bg-white shadow-card">
              <div className="relative aspect-[16/9]"><img src={e.cover} alt={e.title} className="h-full w-full object-cover" /><div className="absolute left-2.5 top-2.5"><GateTag gate={e.gate} /></div></div>
              <div className="p-3.5"><div className="truncate text-[15px] font-semibold">{e.title}</div><div className="mt-1 flex items-center gap-1 text-[12px] text-muted"><CalendarDays size={12} />{e.date} · {e.city}</div></div>
            </div>
          ))}
        </div>
      </Section>

      <div className="relative mx-4 mt-7 overflow-hidden rounded-[22px] bg-ink p-5 text-white">
        <div aria-hidden className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-ai to-brand opacity-40 blur-2xl" />
        <p className="relative text-[12px] text-white/50">今天就是这些</p>
        <p className="relative mt-1 text-[17px] font-semibold">明早 8:00，分身再给你挑一份</p>
        <button onClick={() => { setRemind(true); toast('授权成功，明早 8:00 推给你，只推一条') }} className={`relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium ${remind ? 'bg-success text-white' : 'bg-white text-ink'}`}><Bell size={14} />{remind ? '已开启，明早继续提醒' : '明早继续提醒我'}</button>
        <div className="relative mt-4 flex gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="有话对分身说，比如「少推欧洲」" className="h-11 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-[13px] text-white outline-none placeholder:text-white/40" />
          <button onClick={() => { if (!note) return; setNote(''); toast('分身记住了，会用来校准画像') }} aria-label="发送" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand to-brand-2"><Send size={16} /></button>
        </div>
      </div>

      <Sheet open={!!menu} onClose={() => setMenu(null)} title="调整推荐">
        {[[EyeOff, '不感兴趣', () => { setFeedback(menu!, 'hide'); toast('已隐藏这条') }], [ThumbsDown, '少推此类', () => toast('将减少此类推荐')], [Flag, '举报', () => setReport(menu)]].map(([I, t, fn]: any) => (
          <button key={t} onClick={() => { fn(); setMenu(null) }} className={`flex w-full items-center gap-3 border-b border-line py-4 text-[15px] last:border-0 ${t === '举报' ? 'text-danger' : ''}`}><I size={18} />{t}</button>
        ))}
      </Sheet>
      <Confirm open={!!report} text="确定举报这条内容吗？我们会在 24 小时内处理。" onCancel={() => setReport(null)} onOk={() => { setReport(null); toast('已提交举报，处理中') }} />
    </div>
  )
}

export function DailyDetail({ id }: { id: string }) {
  const { push, feedback, setFeedback, toast, profile } = useStore()
  const d = dailyItems.find((x) => x.id === id) ?? dailyItems[0]
  const agent = agentFor(d.tags, d.title + d.what, profile)
  const [offline, setOffline] = useState(false)
  const [reported, setReported] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const f = feedback[d.id]
  const actions: [typeof ThumbsUp, string, () => void, boolean][] = [
    [ThumbsUp, '有用', () => { setFeedback(d.id, 'up'); toast('已记录，明天会更准') }, f === 'up'],
    [ThumbsDown, '没用', () => { setFeedback(d.id, 'down'); toast('已记录，明天会更准') }, f === 'down'],
    [EyeOff, '不感兴趣', () => { setFeedback(d.id, 'hide'); toast('已隐藏') }, f === 'hide'],
    [Flag, '举报', () => setConfirm(true), reported],
  ]
  return (
    <div className="min-h-full bg-white pb-32">
      <NavBar title="日报详情" />
      <article className="px-5 pt-3">
        <div className="flex flex-wrap gap-1.5">{d.tags.map((t, i) => <span key={t} className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${i ? 'bg-chip text-muted' : 'bg-brand-soft text-brand'}`}>{t}</span>)}</div>
        <h1 className="mt-3 text-[22px] font-bold leading-[30px] tracking-tight">{d.title}</h1>
        <div className={`mt-3 flex items-center gap-2 rounded-2xl bg-chip px-3.5 py-2.5 text-[12px] ${offline ? 'text-subtle line-through' : 'text-muted'}`}>
          <ExternalLink size={14} className="shrink-0" /><span className="truncate">来源：{d.source} · 今天 {d.time}</span>
          <button onClick={() => setOffline(!offline)} className="ml-auto shrink-0 text-[11px] text-subtle">{offline ? '原文已下线' : '模拟失效'}</button>
        </div>
        {reported && <div className="mt-2 rounded-2xl bg-accent-soft px-3.5 py-2.5 text-[13px] text-accent-ink">该内容已被举报，平台处理中</div>}
        <div className="relative mt-5 overflow-hidden rounded-[24px] bg-ink p-5 text-white">
          <div aria-hidden className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-ai to-brand opacity-50 blur-2xl" />
          <div className="relative flex items-center gap-1.5 text-[12px] text-white/60"><Sparkles size={13} />分身的判断</div>
          <p className="relative mt-2 text-[20px] font-bold leading-[28px]">{d.judgment}</p>
        </div>
        {[['发生了什么', d.what], ['对我们意味着什么', d.mean], ['建议动作', d.action]].map(([t, c], i) => (
          <section key={t} className="mt-6">
            <h3 className="flex items-center gap-2 text-[15px] font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft font-display text-[12px] text-brand">{i + 1}</span>{t}</h3>
            <p className="mt-2 text-[15px] leading-[24px] text-ink/85">{c}</p>
          </section>
        ))}
        <div className="mt-7 grid grid-cols-3 gap-2">
          {[[MessageCircleQuestion, '问 Agent', () => push({ name: 'agent', params: { id: agent.id, q: d.title } })], [CalendarDays, '相关活动', () => push({ name: 'event', params: 'e2' })], [Briefcase, '相关服务商', () => push({ name: 'provider', params: relatedProvider(d.tags) })]].map(([I, t, fn]: any) => (
            <button key={t} onClick={fn} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white py-3.5 text-[13px] font-medium transition active:scale-95"><I size={18} className="text-brand" />{t}</button>
          ))}
        </div>
      </article>
      <BottomBar className="!gap-0 !px-2 !pt-2">
        {actions.map(([I, t, fn, on]) => (
          <button key={t} onClick={fn} className={`flex h-12 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition ${on ? 'font-medium text-brand' : 'text-muted'}`}><I size={20} className={on && t !== '举报' ? 'fill-brand/15' : ''} />{t}</button>
        ))}
      </BottomBar>
      <Confirm open={confirm} text="确定举报这条内容吗？我们会在 24 小时内处理。" onCancel={() => setConfirm(false)} onOk={() => { setConfirm(false); setReported(true); toast('已提交举报') }} />
    </div>
  )
}

/** Daily-report topic → 出海资源库 category, for the "related provider" shortcut. */
const TOPIC_CAT: Record<string, string> = { 认证与准入: '认证准入', 政策合规: '法务合规', 资金与收款: '收款与金融', 供应链与物流: '物流仓储', 渠道与买家: '社媒与内容', 市场机会: '咨询顾问' }
/** A provider in the item's category, preferring one that covers the item's market. */
const relatedProvider = (tags: string[]) => {
  const cat = tags.map((t) => TOPIC_CAT[t]).find(Boolean)
  const pool = providers.filter((p) => p.cat === cat)
  return (pool.find((p) => tags.some((t) => p.area.includes(t))) ?? pool.find((p) => p.area.includes('全球')) ?? pool[0] ?? providers[0]).id
}

export function Sources() {
  const { toast } = useStore()
  const [list, setList] = useState(initSources)
  const [rec, setRec] = useState(recSources)
  const [apply, setApply] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', why: '' })
  return (
    <div className="min-h-full pb-10">
      <NavBar title="信息源管理" />
      <div className="mx-4 mt-3 flex gap-2 rounded-2xl bg-brand-soft p-3.5 text-[13px] leading-5 text-brand"><Info size={16} className="mt-0.5 shrink-0" />你的分身会从这些源里筛信息，来源都在平台上可查</div>
      <Section title={<>已选信息源 <span className="font-display text-subtle">{list.filter((s) => s.on).length}</span></>}>
        <div className="mx-4 overflow-hidden rounded-[20px] border border-line/70 bg-white shadow-card">
          {list.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5 last:border-0">
              <div className="min-w-0 flex-1"><div className="text-[15px] font-medium">{s.name}</div><div className="text-[11px] text-subtle">{s.type} · {s.freq}更新</div></div>
              <Switch on={s.on} onChange={() => setList(list.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x)))} />
            </div>
          ))}
        </div>
      </Section>
      <Section title={<span className="flex items-center gap-1.5"><Sparkles size={16} className="text-ai" />按你的画像推荐</span>}>
        <div className="mx-4 overflow-hidden rounded-[20px] border border-line/70 bg-white shadow-card">
          {rec.length ? rec.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5 last:border-0">
              <div className="min-w-0 flex-1"><div className="text-[15px] font-medium">{s.name}</div><div className="text-[11px] text-subtle">{s.type} · {s.freq}更新</div></div>
              <button onClick={() => { setList([...list, { ...s, on: true }]); setRec(rec.filter((x) => x.id !== s.id)); toast('已添加') }} className="flex h-8 items-center gap-1 rounded-full bg-ink px-3 text-[13px] font-medium text-white"><Plus size={14} />添加</button>
            </div>
          )) : <p className="p-5 text-center text-[13px] text-subtle">推荐源都已添加</p>}
        </div>
      </Section>
      <div className="px-4 pt-6"><Btn kind="secondary" onClick={() => setApply(true)} className="w-full">申请新增信息源</Btn></div>
      <Sheet open={apply} onClose={() => setApply(false)} title="申请新增信息源">
        <div className="space-y-3">
          {(['name', 'url', 'why'] as const).map((k) => <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={{ name: '信息源名称', url: '链接', why: '推荐理由' }[k]} className="h-12 w-full rounded-2xl border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />)}
          <Btn disabled={!form.name || !form.url} onClick={() => { setApply(false); setForm({ name: '', url: '', why: '' }); toast('已提交，审核通过后会通知你') }} className="w-full">提交申请</Btn>
        </div>
      </Sheet>
    </div>
  )
}
