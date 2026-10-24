import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Building2, CalendarDays, CalendarPlus, Check, ChevronDown, CreditCard, Loader2, Lock, MapPin, Share2, Sparkles, Ticket, Users } from 'lucide-react'
import { Aurora, BottomBar, Btn, Empty, GateTag, NavBar, Segmented, Sheet, Skeleton, useStore } from '../ui'
import { agenda, events } from '../data'

function Drop({ label, value, opts, onPick }: { label: string; value: string; opts: string[]; onPick: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  const on = value !== '全部'
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`flex h-8 items-center gap-0.5 rounded-full border pl-3 pr-2 text-[13px] transition ${on ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-white'}`}>
        {on ? value : label}<ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-30 w-32 animate-[toastin_.15s_ease-out] rounded-2xl border border-line bg-white p-1 shadow-[0_16px_40px_-12px_rgba(11,19,36,0.3)]">
          {['全部', ...opts].map((x) => (
            <button key={x} onClick={() => { onPick(x); setOpen(false) }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] ${x === value ? 'bg-chip font-medium' : ''}`}>{x}{x === value && <Check size={14} />}</button>
          ))}
        </div>
      )}
    </div>
  )
}

const md = (date: string) => { const m = date.match(/(\d+)月(\d+)日/); return m ? [m[1], m[2]] : ['', ''] }

export default function Events() {
  const { push, cert, registered } = useStore()
  const [city, setCity] = useState('全部')
  const [form, setForm] = useState('全部')
  const [gate, setGate] = useState('全部')
  const [sort, setSort] = useState<'最近' | '推荐'>('最近')
  const [mine, setMine] = useState(false)
  const [loading, setLoading] = useState(false)
  const reload = (fn: () => void) => { fn(); setLoading(true); setTimeout(() => setLoading(false), 500) }
  const list = useMemo(() => {
    let l = events.filter((e) => (city === '全部' || e.city === city) && (form === '全部' || e.form === form) && (gate === '全部' || e.gate === gate))
    if (mine) l = l.filter((e) => registered.includes(e.id))
    return sort === '推荐' ? [...l].sort((a, b) => b.joined / b.cap - a.joined / a.cap) : l
  }, [city, form, gate, sort, mine, registered])

  return (
    <div className="relative">
      <Aurora className="h-[280px]" />
      <div className="relative px-4 pt-[96px]">
        <Segmented
          items={[{ key: 'all', label: '全部活动' }, { key: 'mine', label: <>我的报名{registered.length > 0 && <span className="ml-1 font-display text-brand">{registered.length}</span>}</> }]}
          value={mine ? 'mine' : 'all'}
          onChange={(v) => setMine(v === 'mine')}
        />
      </div>

      <div className="sticky top-[88px] z-20 mt-2 flex items-center gap-2 bg-canvas/85 px-4 py-2.5 backdrop-blur-xl">
        <Drop label="城市" value={city} onPick={(v) => reload(() => setCity(v))} opts={['深圳', '上海', '杭州', '线上', '迪拜', '胡志明']} />
        <Drop label="形式" value={form} onPick={(v) => reload(() => setForm(v))} opts={['线上', '线下', '展会', '考察']} />
        <Drop label="门槛" value={gate} onPick={(v) => reload(() => setGate(v))} opts={['公开', '需认证', '需付费', '邀请制']} />
        <div className="ml-auto flex rounded-full bg-ink/[0.06] p-0.5 text-[12px]">
          {(['最近', '推荐'] as const).map((s) => <button key={s} onClick={() => reload(() => setSort(s))} className={`h-7 rounded-full px-2.5 ${sort === s ? 'bg-white font-semibold shadow-sm' : 'text-muted'}`}>{s}</button>)}
        </div>
      </div>

      <div className="pt-2">
        {loading ? <Skeleton /> : !list.length ? (
          <Empty icon={<CalendarDays />} text={mine ? '你还没有报名任何活动' : '这个条件下暂时没有活动'} action="看全部" onAction={() => { setCity('全部'); setForm('全部'); setGate('全部'); setMine(false) }} />
        ) : (
          <div className="space-y-4 px-4">
            {list.map((e) => {
              const locked = (e.gate === '需认证' && cert !== '已认证') || e.gate === '邀请制'
              const [m, d] = md(e.date)
              const pct = Math.round((e.joined / e.cap) * 100)
              return (
                <div key={e.id} onClick={() => push({ name: 'event', params: e.id })} className={`cursor-pointer overflow-hidden rounded-[24px] border border-line/70 bg-white shadow-card transition active:scale-[0.99] ${e.ended ? 'opacity-75 grayscale' : ''}`}>
                  <div className="relative aspect-[16/8.5] overflow-hidden">
                    <img src={e.cover} alt={e.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/0 to-ink/0" />
                    <div className="absolute left-3 top-3 min-w-[46px] rounded-2xl bg-white/90 px-2 py-1.5 text-center backdrop-blur">
                      <div className="text-[10px] font-medium leading-3 text-muted">{m}月</div>
                      <div className="font-display text-[22px] font-bold leading-6">{d}</div>
                    </div>
                    <div className="absolute right-3 top-3 flex gap-1"><GateTag gate={e.gate} dim={locked} />{registered.includes(e.id) && <span className="inline-flex h-5 items-center rounded-full bg-success px-2 text-[11px] font-medium text-white">已报名</span>}</div>
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-white">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] backdrop-blur">{e.form}</span>
                      <span className="flex items-center gap-1 text-[11px]"><Users size={12} /><span className="font-display">{e.joined}</span> 人已报名</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-[17px] font-bold leading-6">{e.title}</h3>
                    <div className="mt-2 flex items-center gap-1 text-[12px] text-muted"><CalendarDays size={13} />{e.date}</div>
                    <div className="mt-1 flex items-center gap-1 text-[12px] text-muted"><MapPin size={13} />{e.city} · {e.host}</div>
                    <div className="mt-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-chip"><div className="h-full rounded-full bg-linear-to-r from-brand to-brand-2" style={{ width: `${pct}%` }} /></div>
                        <span className="font-display text-[11px] text-subtle">{pct}%</span>
                      </div>
                      {e.ended ? <span className="flex items-center gap-0.5 text-[13px] font-medium text-brand">看回顾<ArrowRight size={14} /></span>
                        : locked ? <span className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-[12px] text-muted"><Lock size={12} />{e.gate}</span>
                          : e.price ? <span className="font-display text-[17px] font-bold text-accent-ink">¥{e.price.toLocaleString()}</span>
                            : <span className="rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-white">免费报名</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

type Action = { label: string; fn: () => void; kind?: 'primary' | 'brand' | 'secondary'; disabled?: boolean }

export function EventDetail({ id }: { id: string }) {
  const { push, cert, registered, register, toast, profile } = useStore()
  const e = events.find((x) => x.id === id) ?? events[0]
  const [more, setMore] = useState(false)
  const [pay, setPay] = useState(false)
  const [paying, setPaying] = useState(false)
  const [wait, setWait] = useState(false)
  const full = e.joined >= e.cap
  const done = registered.includes(e.id)
  const pct = Math.min(100, Math.round((e.joined / e.cap) * 100))
  const price = `¥${e.price.toLocaleString()}`

  let act: Action
  if (e.ended) act = { label: '看活动回顾', kind: 'secondary', fn: () => toast('回顾视频整理中') }
  else if (done) act = { label: '查看我的票券', kind: 'brand', fn: () => push({ name: 'ticket', params: e.id }) }
  else if (full) act = wait ? { label: '已候补登记', disabled: true, fn: () => {} } : { label: '名额已满 · 候补登记', kind: 'secondary', fn: () => { setWait(true); toast('已加入候补，有名额会第一时间通知你') } }
  else if (e.gate === '需认证' && cert !== '已认证') {
    act = cert === '审核中'
      ? wait ? { label: '已候补 · 认证通过后自动报名', disabled: true, fn: () => {} } : { label: '认证审核中 · 先候补', kind: 'brand', fn: () => { setWait(true); toast('已候补，认证通过后自动报名') } }
      : { label: '去认证后报名', kind: 'brand', fn: () => push({ name: 'cert' }) }
  } else if (e.gate === '需付费') act = { label: `${price} 立即报名`, fn: () => setPay(true) }
  else act = { label: '免费报名', fn: () => { register(e.id); push({ name: 'ticket', params: e.id }) } }

  const confirmPay = () => {
    setPaying(true)
    setTimeout(() => { setPaying(false); setPay(false); register(e.id); push({ name: 'ticket', params: e.id }) }, 1200)
  }
  const info: [typeof CalendarDays, string, string][] = [
    [CalendarDays, e.date, '开始前 1 天提醒你'],
    [MapPin, e.city, e.place],
    [Building2, e.host, `指导单位 · ${e.guide}`],
  ]

  return (
    <div className="min-h-full pb-36">
      <NavBar title="活动详情" right={<button onClick={() => toast('已生成分享卡片')} aria-label="分享" className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white"><Share2 size={15} /></button>} />
      <div className="px-4 pt-2">
        <div className="relative overflow-hidden rounded-[24px] shadow-card">
          <img src={e.cover} alt={e.title} className="aspect-video w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-1.5"><GateTag gate={e.gate} /><span className="inline-flex h-5 items-center rounded-full bg-white/20 px-2 text-[11px] text-white backdrop-blur">{e.form}</span></div>
          <div className="absolute inset-x-4 bottom-4 text-white">
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1"><Users size={13} /><b className="font-display">{e.joined}</b> / {e.cap} 已报名</span>
              {full ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold">名额已满</span> : <span className="font-display">{pct}%</span>}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-linear-to-r from-brand-2 to-white" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <h1 className="mt-5 text-[22px] font-bold leading-[30px] tracking-tight">{e.title}</h1>
        <div className="mt-4 space-y-3 rounded-[20px] border border-line/70 bg-white p-4 shadow-card">
          {info.map(([I, t, s]) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><I size={17} /></span>
              <div className="min-w-0"><div className="truncate text-[14px] font-semibold">{t}</div><div className="truncate text-[12px] text-muted">{s}</div></div>
            </div>
          ))}
        </div>

        {!e.ended && (
          <div className="mt-3 flex gap-2.5 rounded-[20px] border border-ai/15 bg-linear-to-br from-ai-soft to-white p-4">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-ai" />
            <p className="text-[13px] leading-[19px] text-ai-ink"><b className="font-semibold">分身推荐理由：</b>你关注「{profile.countries.join('、')}」和「渠道与买家」，这场活动有本地买家现场一对一对接。</p>
          </div>
        )}

        <section className="mt-6">
          <h2 className="text-[18px] font-bold tracking-tight">议程</h2>
          <div className="mt-3 rounded-[20px] border border-line/70 bg-white p-4 shadow-card">
            {(more ? agenda : agenda.slice(0, 4)).map(([t, s, w], i, arr) => (
              <div key={t} className="relative flex gap-3 pb-4 pl-5">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand bg-white" />
                {i < arr.length - 1 && <span className="absolute left-[4px] top-4 h-full w-px bg-line" />}
                <span className="w-11 shrink-0 font-display text-[13px] font-semibold text-brand">{t}</span>
                <div className="min-w-0"><div className="text-[14px] font-medium">{s}</div><div className="text-[12px] text-muted">{w}</div></div>
              </div>
            ))}
            <button onClick={() => setMore(!more)} className="w-full text-center text-[13px] font-medium text-brand">{more ? '收起' : `展开全部 ${agenda.length} 项`}</button>
          </div>
        </section>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {([['适合谁', ['年出口 500 万美元以上制造企业', '计划 1 年内进入中东', '有品牌或自主产品']], ['你将获得', ['中东 200 家买家名录', '现场一对一渠道对接', '免费出海诊断一次']]] as const).map(([t, l]) => (
            <div key={t} className="rounded-[20px] border border-line/70 bg-white p-3.5 shadow-card">
              <h3 className="text-[15px] font-bold">{t}</h3>
              <ul className="mt-2 space-y-1.5">{l.map((x) => <li key={x} className="flex gap-1 text-[12px] leading-[18px] text-muted"><Check size={14} className="mt-0.5 shrink-0 text-success" />{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>

      <BottomBar>
        <div className="shrink-0 text-[11px] leading-4 text-muted"><b className="block font-display text-[18px] leading-6 text-ink">{e.joined}</b>人已报名</div>
        <Btn kind={act.kind} disabled={act.disabled} onClick={act.fn} className={`flex-1 ${act.kind === 'secondary' ? '!h-12' : ''}`}>{act.label}</Btn>
      </BottomBar>

      <Sheet open={pay} onClose={() => setPay(false)} title="确认支付">
        <div className="rounded-2xl bg-chip p-4"><div className="text-[13px] text-muted">{e.title}</div><div className="mt-2 font-display text-[30px] font-bold text-accent-ink">{price}.00</div></div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-[15px]"><CreditCard size={18} className="text-success" />微信支付<Check size={16} className="ml-auto text-brand" /></div>
        <p className="mt-2 text-[11px] text-subtle">活动开始 48 小时前可申请全额退款</p>
        <Btn disabled={paying} onClick={confirmPay} className="mt-4 w-full">{paying ? <Loader2 size={20} className="animate-spin" /> : `确认支付 ${price}`}</Btn>
      </Sheet>
    </div>
  )
}

export function TicketPage({ id }: { id: string }) {
  const { push, toast } = useStore()
  const e = events.find((x) => x.id === id) ?? events[0]
  const [open, setOpen] = useState<number | null>(0)
  // Deterministic QR-like pattern: three finder squares plus pseudo-random modules.
  const cells = useMemo(() => Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21)
    if ((x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)) {
      const lx = x > 13 ? x - 14 : x, ly = y > 13 ? y - 14 : y
      return lx === 0 || ly === 0 || lx === 6 || ly === 6 || (lx > 1 && lx < 5 && ly > 1 && ly < 5)
    }
    return (x * 31 + y * 17 + x * y) % 7 < 3
  }), [])
  const actions: [typeof CalendarPlus, string, () => void][] = [
    [CalendarPlus, '添加到日历', () => toast('已添加到日历')],
    [Share2, '分享给同事', () => toast('已生成分享卡片')],
    [Ticket, '查看活动', () => push({ name: 'event', params: e.id })],
  ]

  return (
    <div className="relative min-h-full overflow-hidden bg-ink pb-12 text-white">
      <NavBar title="我的票券" />
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-10 h-64 w-64 rounded-full bg-brand opacity-30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-4 h-56 w-56 rounded-full bg-ai opacity-25 blur-3xl" />
      <div className="relative flex flex-col items-center pt-5 text-center">
        <div className="grid h-14 w-14 animate-[pop_.5s_ease-out] place-items-center rounded-full bg-linear-to-br from-success to-[#5fe0b7] shadow-[0_12px_30px_-10px_rgba(18,183,106,0.8)]"><Check size={30} strokeWidth={3} /></div>
        <h1 className="mt-3 text-[22px] font-bold">报名成功</h1>
        <p className="mt-0.5 text-[13px] text-white/60">活动前 1 天会提醒你，凭二维码入场</p>
      </div>

      <div className="relative mx-4 mt-6 overflow-hidden rounded-[28px] bg-white text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="relative h-24 overflow-hidden">
          <img src={e.cover} alt={e.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/70 to-transparent" />
          <div className="absolute bottom-3 left-4"><GateTag gate={e.gate} /></div>
        </div>
        <div className="p-5 pb-4">
          <h2 className="text-[17px] font-bold leading-6">{e.title}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><CalendarDays size={14} className="shrink-0" />{e.date}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted"><MapPin size={14} className="shrink-0" /><span className="truncate">{e.place}</span></p>
        </div>
        <div className="relative border-t-2 border-dashed border-line"><span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-ink" /><span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-ink" /></div>
        <div className="flex flex-col items-center p-6">
          <div className="rounded-2xl border border-line p-3"><div className="grid h-40 w-40 grid-cols-[repeat(21,1fr)]">{cells.map((c, i) => <span key={i} className={c ? 'bg-ink' : ''} />)}</div></div>
          <p className="mt-3 font-display text-[13px] tracking-wider text-muted">HB-2611-{e.id.toUpperCase()}-0086</p>
        </div>
      </div>

      <div className="relative mx-4 mt-4 grid grid-cols-3 gap-2">
        {actions.map(([I, t, fn]) => <button key={t} onClick={fn} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.07] py-3.5 text-[12px] transition active:scale-95"><I size={20} />{t}</button>)}
      </div>
      <div className="relative mx-4 mt-4 divide-y divide-white/10 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06]">
        {[['入场须知', '请提前 15 分钟到场，凭二维码与本人名片入场；现场提供茶歇。'], ['取消规则', '活动开始 48 小时前可免费取消，付费活动全额退款。'], ['联系人', '小海 · 138 0000 6688（工作日 9:00–18:00）']].map(([t, c], i) => (
          <div key={t}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-[15px] font-semibold">{t}<ChevronDown size={16} className={`text-white/60 transition ${open === i ? 'rotate-180' : ''}`} /></button>
            {open === i && <p className="px-4 pb-4 text-[13px] leading-[19px] text-white/65">{c}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
