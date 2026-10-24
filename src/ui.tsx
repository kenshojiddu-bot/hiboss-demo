import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ShieldCheck, Clock, X, ChevronLeft, ChevronRight, MoreHorizontal, CircleDashed, Sparkles, CheckCircle2 } from 'lucide-react'
import type { Gate, Meeting, Moment, Post } from './data'

export type Route = { name: string; params?: any }
export type CertState = '未认证' | '审核中' | '已认证' | '未通过'
export type Profile = { name: string; title: string; city: string; company: string; countries: string[]; topics: string[]; stage: string }
/** Page surface behind the status bar and nav bar: white reading pages, canvas lists, or the dark ticket. */
export type Tone = 'light' | 'canvas' | 'dark'

type Store = {
  push: (r: Route) => void
  replace: (r: Route) => void
  reset: (r: Route[]) => void
  back: () => void
  tab: (name: string) => void
  /** Updates the current page's params in place (no remount), e.g. to mirror a segment switch into the route. */
  setParams: (params: any) => void
  toast: (msg: string) => void
  overlay: HTMLElement | null
  scrolled: boolean
  tone: Tone
  cert: CertState
  setCert: (c: CertState) => void
  guest: boolean
  setGuest: (b: boolean) => void
  registered: string[]
  register: (id: string) => void
  favs: string[]
  toggleFav: (id: string) => void
  leads: { name: string; note: string; time: string }[]
  addLead: (name: string, note: string) => void
  feedback: Record<string, 'up' | 'down' | 'hide'>
  setFeedback: (id: string, v: 'up' | 'down' | 'hide') => void
  profile: Profile
  setProfile: (p: Profile) => void
  posts: Post[]
  addPost: (p: Post) => void
  updatePost: (id: string, patch: Partial<Post>) => void
  meetings: Meeting[]
  addMeeting: (m: Meeting) => void
  updateMeeting: (id: string, patch: Partial<Meeting>) => void
  moments: Moment[]
  setMoments: (update: (m: Moment[]) => Moment[]) => void
}
export const Ctx = createContext<Store>(null as any)
export const useStore = () => useContext(Ctx)

/** False while a page is kept alive underneath another one in the navigation stack. */
export const PageCtx = createContext(true)

/** Renders into the viewport overlay layer so sheets and bars stay pinned regardless of page scroll. Covered pages render nothing there. */
export const Portal = ({ children }: { children: ReactNode }) => {
  const { overlay } = useStore()
  const active = useContext(PageCtx)
  return overlay && active ? createPortal(children, overlay) : null
}

const gateCls: Record<Gate, string> = {
  公开: 'bg-white/90 text-muted',
  需认证: 'bg-brand-soft text-brand',
  需付费: 'bg-accent-soft text-accent-ink',
  邀请制: 'bg-ink text-white',
}
export const GateTag = ({ gate, dim }: { gate: Gate; dim?: boolean }) => (
  <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium backdrop-blur ${gateCls[gate]} ${dim ? 'opacity-60' : ''}`}>{gate}</span>
)

export const CertBadge = ({ state = '已认证' as CertState }) => {
  const base = 'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full pl-1.5 pr-2 text-[11px] font-medium'
  if (state === '已认证') return <span className={`${base} bg-linear-to-r from-brand to-brand-2 text-white`}><ShieldCheck size={12} strokeWidth={2.4} />已认证</span>
  if (state === '审核中') return <span className={`${base} bg-accent-soft text-accent-ink`}><Clock size={12} />审核中</span>
  return <span className={`${base} bg-chip text-subtle`}><CircleDashed size={12} />未认证</span>
}

export const Tag = ({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] transition active:scale-95 ${active ? 'bg-ink font-medium text-white' : 'border border-line bg-white text-ink'}`}>{children}</button>
)

type BtnKind = 'primary' | 'brand' | 'navy' | 'secondary' | 'ghost' | 'danger'
export const Btn = ({ children, kind = 'primary', disabled, onClick, className = '' }: { children: ReactNode; kind?: BtnKind; disabled?: boolean; onClick?: () => void; className?: string }) => {
  const brand = 'bg-linear-to-r from-brand to-brand-2 text-white shadow-[0_10px_24px_-12px_var(--color-brand)]'
  const k = disabled ? 'bg-chip text-subtle' : {
    primary: 'bg-ink text-white shadow-[0_10px_24px_-12px_rgba(11,19,36,0.7)]',
    brand,
    navy: brand,
    secondary: 'border border-line bg-white text-ink',
    ghost: 'text-brand',
    danger: 'bg-danger text-white',
  }[kind]
  const h = kind === 'secondary' || kind === 'ghost' ? 'h-11 text-[15px] font-medium' : 'h-12 text-[16px] font-semibold'
  return (
    <button disabled={disabled} onClick={onClick} className={`${h} ${k} inline-flex items-center justify-center gap-1.5 rounded-full px-5 transition active:scale-[0.98] ${className}`}>{children}</button>
  )
}

export const Card = ({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`rounded-[20px] border border-line/70 bg-white p-4 shadow-card ${onClick ? 'cursor-pointer transition active:scale-[0.99]' : ''} ${className}`}>{children}</div>
)

export const toneBg: Record<Tone, string> = { light: 'bg-white', canvas: 'bg-canvas', dark: 'bg-ink' }
const toneGlass: Record<Tone, string> = { light: 'bg-white/80', canvas: 'bg-canvas/80', dark: 'bg-ink/80' }

/** Page title row; turns translucent with a divider once the page scrolls. */
export const NavBar = ({ title, right, tone }: { title: string; right?: ReactNode; tone?: Tone }) => {
  const { back, scrolled, tone: routeTone } = useStore()
  const t = tone ?? routeTone
  const dark = t === 'dark'
  return (
    <div className={`sticky top-0 z-20 flex h-11 items-center justify-center border-b transition-colors duration-200 ${scrolled ? `${toneGlass[t]} backdrop-blur-xl ${dark ? 'border-white/10' : 'border-line/70'}` : `${toneBg[t]} border-transparent`} ${dark ? 'text-white' : 'text-ink'}`}>
      <button onClick={back} aria-label="返回" className={`absolute left-3 grid h-8 w-8 place-items-center rounded-full border ${dark ? 'border-white/15 bg-white/10' : 'border-line bg-white'}`}><ChevronLeft size={18} /></button>
      <span className="text-[16px] font-semibold">{title}</span>
      {right && <div className="absolute right-4 flex items-center">{right}</div>}
    </div>
  )
}

export const Capsule = ({ dark }: { dark?: boolean }) => (
  <div className={`pointer-events-none absolute right-[7px] top-[50px] z-[75] flex h-8 w-[87px] items-center justify-around rounded-full border backdrop-blur ${dark ? 'border-white/20 bg-white/10 text-white' : 'border-black/10 bg-white/70 text-ink'}`}>
    <MoreHorizontal size={16} /><span className={`h-4 w-px ${dark ? 'bg-white/30' : 'bg-black/15'}`} /><span className={`h-3.5 w-3.5 rounded-full border-2 ${dark ? 'border-white/80' : 'border-black/70'}`} />
  </div>
)

export const Section = ({ title, more, onMore, children }: { title: ReactNode; more?: string; onMore?: () => void; children: ReactNode }) => (
  <section className="mt-7">
    <div className="mb-3 flex items-end justify-between px-4">
      <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
      {more && <button onClick={onMore} className="flex items-center text-[13px] text-muted">{more}<ChevronRight size={14} /></button>}
    </div>
    {children}
  </section>
)

export const Empty = ({ icon, text, action, onAction }: { icon: ReactNode; text: string; action?: string; onAction?: () => void }) => (
  <div className="flex flex-col items-center px-8 py-12 text-center">
    <div className="mb-4 grid h-16 w-16 place-items-center rounded-[22px] border border-line bg-linear-to-br from-brand-soft to-white text-brand">{icon}</div>
    <p className="text-[15px] leading-[22px] text-muted">{text}</p>
    {action && <button onClick={onAction} className="mt-5 h-10 rounded-full bg-ink px-5 text-[13px] font-medium text-white">{action}</button>}
  </div>
)

export const Skeleton = ({ n = 3 }: { n?: number }) => (
  <div className="space-y-3 px-4">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="rounded-[20px] border border-line/70 bg-white p-4">
        <div className="shimmer mb-3 h-3 w-24 rounded-full" /><div className="shimmer mb-2 h-4 w-full rounded-full" /><div className="shimmer h-4 w-2/3 rounded-full" />
      </div>
    ))}
  </div>
)

export const Sheet = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) => {
  const active = useContext(PageCtx)
  // Navigating away closes the page's sheets, so they never pop back up when the user returns.
  useEffect(() => { if (!active && open) onClose() }, [active])
  return (
  <Portal>
    <div className={`absolute inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`no-scrollbar absolute inset-x-0 bottom-0 max-h-[84%] overflow-y-auto rounded-t-[28px] bg-white pb-9 transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="sticky top-0 z-10 bg-white px-5 pb-3 pt-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-bold">{title}</span>
            <button onClick={onClose} aria-label="关闭" className="grid h-8 w-8 place-items-center rounded-full bg-chip text-muted"><X size={16} /></button>
          </div>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  </Portal>
  )
}

export const Confirm = ({ open, text, onOk, onCancel, okText = '确定', danger = true }: { open: boolean; text: string; onOk: () => void; onCancel: () => void; okText?: string; danger?: boolean }) => {
  const active = useContext(PageCtx)
  useEffect(() => { if (!active && open) onCancel() }, [active])
  return !open ? null : (
    <Portal>
      <div className="pointer-events-auto absolute inset-0 z-[60] grid place-items-center bg-ink/40 px-10 backdrop-blur-[2px]">
        <div className="w-full animate-[pop_.25s_ease-out] overflow-hidden rounded-[24px] bg-white text-center">
          <p className="px-6 py-7 text-[15px] leading-[22px]">{text}</p>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4 text-[15px]">
            <button onClick={onCancel} className="h-11 rounded-full bg-chip text-muted">取消</button>
            <button onClick={onOk} className={`h-11 rounded-full font-semibold text-white ${danger ? 'bg-danger' : 'bg-ink'}`}>{okText}</button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

/** Bottom action bar pinned to the phone frame; pages add bottom padding so content is not covered. */
export const BottomBar = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <Portal>
    <div className={`bottom-action pointer-events-auto absolute bottom-0 z-30 flex items-center gap-3 border-t border-line/70 bg-white/90 px-4 pb-3 pt-3 backdrop-blur-xl ${className}`}>{children}</div>
  </Portal>
)

export const ToastView = ({ msg }: { msg: string | null }) =>
  msg ? (
    <div className="pointer-events-none absolute inset-x-0 top-[104px] z-[70] flex justify-center px-8">
      <div key={msg} className="animate-[toastin_.25s_ease-out] rounded-full bg-ink/90 px-4 py-2.5 text-center text-[13px] text-white shadow-lg backdrop-blur">{msg}</div>
    </div>
  ) : null

/** Contact / booking form shared by service providers and human agents; every submission lands in 我的留资. */
export function LeadSheet({ open, onClose, target, title = '我想了解', withTime }: { open: boolean; onClose: () => void; target: string; title?: string; withTime?: boolean }) {
  const { addLead, profile } = useStore()
  const [q, setQ] = useState('')
  const [time, setTime] = useState('本周内')
  const [phone, setPhone] = useState('138 0013 8000')
  const [done, setDone] = useState(false)
  const close = () => { onClose(); setTimeout(() => { setDone(false); setQ('') }, 300) }
  return (
    <Sheet open={open} onClose={close} title={done ? '' : title}>
      {done ? (
        <div className="flex flex-col items-center pb-4 text-center">
          <div className="grid h-16 w-16 animate-[pop_.4s_ease-out] place-items-center rounded-full bg-success-soft text-success"><CheckCircle2 size={34} /></div>
          <p className="mt-4 text-[18px] font-bold">提交成功</p>
          <p className="mt-1 text-[13px] text-muted">{withTime ? `${target.split(' · ')[0]} 会在 1 个工作日内与你确认时间` : `${target} 将在 1 个工作日内联系你`}</p>
          <Btn onClick={close} className="mt-6 w-full">好的</Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-chip px-4 py-3 text-[13px] text-muted">对接方 · <b className="text-ink">{target}</b></div>
          <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="一句话说清你的需求，例如：想在印尼做清真认证，约 20 个 SKU" className="h-28 w-full resize-none rounded-2xl border border-line p-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
          {withTime && <div><p className="text-[13px] font-medium text-muted">期望时间</p><div className="mt-2 flex gap-2">{['本周内', '下周', '两周后'].map((t) => <Tag key={t} active={time === t} onClick={() => setTime(t)}>{t}</Tag>)}</div></div>}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 w-full rounded-2xl border border-line px-4 font-display text-[15px] outline-none focus:border-brand" />
          <p className="text-[11px] text-subtle">{profile.name} · {profile.company}（已自动带出）</p>
          <Btn disabled={!q.trim()} onClick={() => { addLead(target, q); setDone(true) }} className="w-full">提交</Btn>
        </div>
      )}
    </Sheet>
  )
}

export const Field = ({ label, value, onChange, placeholder, error, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; required?: boolean }) => (
  <label className="block">
    <span className="text-[13px] font-medium text-muted">{label}{required && <span className="text-danger"> *</span>}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`mt-1.5 h-12 w-full rounded-2xl border bg-white px-4 text-[15px] outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/10 ${error ? 'border-danger' : 'border-line'}`} />
    {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
  </label>
)

export const Switch = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-line'}`}>
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
)

export function Segmented<T extends string>({ items, value, onChange }: { items: { key: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-full bg-ink/[0.06] p-1">
      {items.map((it) => (
        <button key={it.key} onClick={() => onChange(it.key)} className={`h-9 flex-1 rounded-full text-[14px] transition ${value === it.key ? 'bg-white font-semibold text-ink shadow-[0_2px_10px_-3px_rgba(11,19,36,0.2)]' : 'text-muted'}`}>{it.label}</button>
      ))}
    </div>
  )
}

export const Aurora = ({ className = 'h-[380px]' }: { className?: string }) => <div aria-hidden className={`aurora pointer-events-none absolute inset-x-0 top-0 ${className}`} />

/** AI match score; strong matches get the violet-to-brand gradient, weak ones stay quiet. */
export const MatchBadge = ({ value, className = '' }: { value: number; className?: string }) => {
  const tier = value >= 80 ? 'bg-linear-to-r from-ai to-brand text-white' : value >= 60 ? 'bg-ai-soft text-ai-ink' : 'bg-chip text-muted'
  return <span className={`inline-flex h-6 shrink-0 items-center gap-0.5 rounded-full px-2 font-display text-[12px] font-semibold ${tier} ${className}`}><Sparkles size={11} />{value}%</span>
}

/** The AI twin's avatar: a slowly rotating gradient ring around a sparkle. */
export const Orb = ({ size = 34 }: { size?: number }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full" style={{ background: 'conic-gradient(from 0deg, var(--color-brand), var(--color-brand-2), #a78bfa, var(--color-brand))' }} />
    <div className="absolute inset-[3px] grid place-items-center rounded-full bg-white"><Sparkles size={size * 0.44} className="text-brand" /></div>
    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" />
  </div>
)

export const Radar = ({ values, peer, axes, size = 260, animate = true }: { values: number[]; peer: number[]; axes: string[]; size?: number; animate?: boolean }) => {
  const [k, setK] = useState(animate ? 0 : 1)
  useEffect(() => {
    if (!animate) return
    let raf = 0
    const t0 = performance.now()
    const f = (t: number) => { const p = Math.min(1, (t - t0) / 1200); setK(1 - Math.pow(1 - p, 3)); if (p < 1) raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [animate])
  const c = size / 2, r = size / 2 - 44
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / 6 - Math.PI / 2; return [c + Math.cos(a) * r * v / 100, c + Math.sin(a) * r * v / 100] }
  const poly = (vs: number[]) => vs.map((v, i) => pt(i, v).join(',')).join(' ')
  const score = Math.round(values.reduce((a, b) => a + b, 0) / 6)
  const line = { stroke: 'var(--color-line)' }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--color-brand)', stopOpacity: 0.32 }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-brand-2)', stopOpacity: 0.22 }} />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((g) => <polygon key={g} points={poly(Array(6).fill(g))} fill="none" style={line} />)}
      {axes.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={c} y1={c} x2={x} y2={y} style={line} /> })}
      <polygon points={poly(peer)} fill="none" style={{ stroke: 'var(--color-accent)' }} strokeDasharray="4 3" strokeWidth={1.5} />
      <polygon points={poly(values.map((v) => v * k))} fill="url(#radarFill)" style={{ stroke: 'var(--color-brand)' }} strokeWidth={2} strokeLinejoin="round" />
      {values.map((v, i) => { const [x, y] = pt(i, v * k); return <circle key={i} cx={x} cy={y} r={3.5} fill="#fff" style={{ stroke: 'var(--color-brand)' }} strokeWidth={2} /> })}
      {axes.map((a, i) => { const [x, y] = pt(i, 128); return <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={11} style={{ fill: 'var(--color-muted)' }}>{a}<tspan x={x} dy={14} fontWeight={700} style={{ fill: 'var(--color-ink)' }} fontFamily="Outfit, sans-serif">{Math.round(values[i] * k)}</tspan></text> })}
      <text x={c} y={c - 2} textAnchor="middle" fontSize={30} fontWeight={700} fontFamily="Outfit, sans-serif" style={{ fill: 'var(--color-ink)' }}>{Math.round(score * k)}</text>
      <text x={c} y={c + 16} textAnchor="middle" fontSize={10} style={{ fill: 'var(--color-subtle)' }}>综合分</text>
    </svg>
  )
}

const logoGrads = ['from-brand to-brand-2', 'from-[#7a5af8] to-[#c084fc]', 'from-[#0e9384] to-[#5fe0b7]', 'from-[#f79009] to-[#fdb022]', 'from-ink-2 to-[#475467]']
export const Avatar = ({ text, src, size = 40, className = '' }: { text?: string; src?: string; size?: number; className?: string }) =>
  src ? <img src={src} alt={text} style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ${className}`} />
    : <div style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} className={`grid shrink-0 place-items-center rounded-[30%] bg-linear-to-br font-bold text-white ${logoGrads[(text?.charCodeAt(0) ?? 0) % logoGrads.length]} ${className}`}>{text}</div>
