import { useCallback, useRef, useState } from 'react'
import { Newspaper, CalendarDays, Handshake, LayoutGrid, UserRound, Bell, Signal, Wifi, BatteryFull } from 'lucide-react'
import { Aurora, Btn, Capsule, Ctx, Orb, PageCtx, ToastView, toneBg, useStore, type CertState, type Profile, type Route, type Tone } from './ui'
import { meetings as seedMeetings, momentSeeds, myPostSeeds, seedPosts, type Meeting, type Moment, type Post } from './data'
import Onboard, { Login, Portrait } from './pages/Onboarding'
import Home, { DailyDetail, Sources } from './pages/Home'
import Events, { EventDetail, TicketPage } from './pages/Events'
import Resources, { ProviderDetail } from './pages/Resources'
import AgentChat, { HumanAgentDetail } from './pages/Agents'
import Biz, { BizDetail } from './pages/Biz'
import Publish, { Published } from './pages/Publish'
import Me, { Cert, Doc, Feedback, Messages, MyList, MyPortrait } from './pages/Me'

const TABS = [
  ['home', '日报', Newspaper],
  ['events', '活动', CalendarDays],
  ['biz', '商机', Handshake],
  ['resources', '资源', LayoutGrid],
  ['me', '我的', UserRound],
] as const
const tabNames: string[] = TABS.map((t) => t[0])
const TAB_TITLE: Record<string, string> = { events: '活动', biz: '商机', resources: '资源', me: '我的' }

const THEMES = [
  ['ocean', '海蓝极光', '#2e5bff', '#14b8d4'],
  ['gold', '墨金商务', '#a8772a', '#d9b25f'],
  ['teal', '青碧清新', '#0e9f8e', '#4fcf9f'],
] as const

const INDEX: [string, [string, Route][]][] = [
  ['建档', [['启动与登录', { name: 'login' }], ['建档三步', { name: 'onboard' }], ['画像生成', { name: 'portrait' }]]],
  ['日报', [['今日日报', { name: 'home' }], ['日报详情', { name: 'daily', params: 'd1' }], ['信息源管理', { name: 'sources' }]]],
  ['活动', [['活动列表', { name: 'events' }], ['活动详情', { name: 'event', params: 'e1' }], ['我的票券', { name: 'ticket', params: 'e2' }]]],
  ['商机', [['商机广场', { name: 'biz' }], ['发布供需', { name: 'publish' }], ['发布结果', { name: 'published', params: 'my1' }], ['商机详情', { name: 'bizDetail', params: 'b1' }], ['我的发布', { name: 'biz', params: 'mine' }], ['会议日程', { name: 'biz', params: 'meet' }]]],
  ['资源', [['出海 Agent', { name: 'resources', params: 'ai' }], ['Agent 对话', { name: 'agent' }], ['真人 Agent', { name: 'resources', params: 'human' }], ['真人 Agent 详情', { name: 'human', params: 'h1' }], ['出海资源库', { name: 'resources', params: 'lib' }], ['服务商详情', { name: 'provider', params: 'p1' }], ['出海朋友圈', { name: 'resources', params: 'moments' }]]],
  ['我的', [['我的', { name: 'me' }], ['我的画像', { name: 'myPortrait' }], ['企业认证', { name: 'cert' }], ['消息通知', { name: 'messages' }]]],
]

/** Routes whose content runs under the status bar (they handle their own top spacing). */
const FULL_BLEED = ['login', 'onboard', 'portrait', 'published']
/** Surface behind the status strip and nav bar for non-tab routes; everything else sits on the canvas. */
const TONE: Record<string, Tone> = { ticket: 'dark', daily: 'light', doc: 'light', agent: 'light' }
/** Old expert profiles: two became 真人 Agent, the other two now sit under the firms they work for. */
const EXPERT: Record<string, Route> = { x1: { name: 'human', params: 'h5' }, x2: { name: 'human', params: 'h4' }, x3: { name: 'provider', params: 'p1' }, x4: { name: 'provider', params: 'p8' } }
/** Route names from earlier prototype versions, kept so stale links still land somewhere sensible. */
const LEGACY: Record<string, (params: any) => Route> = {
  experts: () => ({ name: 'resources', params: 'human' }),
  expert: (id) => EXPERT[id] ?? { name: 'resources', params: 'human' },
  opps: () => ({ name: 'biz' }),
  meetings: () => ({ name: 'biz', params: 'meet' }),
}
const norm = (r: Route): Route => LEGACY[r.name]?.(r.params) ?? r
/** Segment a tab opens on without params, so `{ name: 'biz' }` and `{ name: 'biz', params: 'plaza' }` are the same page. */
const DEFAULT_PARAMS: Record<string, string> = { biz: 'plaza', resources: 'ai' }
const same = (a: Route, b: Route) => a.name === b.name && JSON.stringify(a.params ?? DEFAULT_PARAMS[a.name] ?? null) === JSON.stringify(b.params ?? DEFAULT_PARAMS[b.name] ?? null)
/** Logical parent of each page, used to rebuild a believable back stack when a page is opened cold (prototype index, stale links). */
const PARENT: Record<string, (params: any) => Route> = {
  onboard: () => ({ name: 'login' }),
  portrait: () => ({ name: 'onboard' }),
  daily: () => ({ name: 'home' }),
  sources: () => ({ name: 'home' }),
  agent: () => ({ name: 'resources', params: 'ai' }),
  event: () => ({ name: 'events' }),
  ticket: (id) => ({ name: 'event', params: id }),
  publish: () => ({ name: 'biz' }),
  published: () => ({ name: 'biz' }),
  bizDetail: () => ({ name: 'biz' }),
  provider: () => ({ name: 'resources', params: 'lib' }),
  human: () => ({ name: 'resources', params: 'human' }),
  myPortrait: () => ({ name: 'me' }),
  cert: () => ({ name: 'me' }),
  messages: () => ({ name: 'me' }),
  myEvents: () => ({ name: 'me' }),
  myFavs: () => ({ name: 'me' }),
  myLeads: () => ({ name: 'me' }),
  feedback: () => ({ name: 'me' }),
}
/** The route preceded by its ancestors, root first. */
const trail = (r: Route): Route[] => { const up = PARENT[r.name]; return up ? [...trail(up(r.params)), r] : [r] }
/** Tabs that need a signed-in user; activities and resources can be browsed as a guest. */
const GUARDED = ['home', 'biz', 'me']

/** A page in the back stack. Its key identifies it for as long as it stays in the stack, even when its params change. */
type Entry = Route & { key: number }
type Motion = 'push' | 'back' | 'fade'
const MOTION: Record<Motion, string> = { push: 'animate-[slidein_.28s_ease-out]', back: 'animate-[slideback_.24s_ease-out]', fade: 'animate-[fadein_.2s_ease-out]' }
let seq = 0
const entry = (r: Route): Entry => ({ ...norm(r), key: ++seq })

function GuestBlock() {
  const { setGuest, reset } = useStore()
  return (
    <div className="relative flex min-h-[700px] flex-col items-center justify-center px-10 text-center">
      <Aurora className="h-[460px]" />
      <div className="relative grid h-16 w-16 place-items-center rounded-[22px] bg-ink text-white shadow-[0_18px_40px_-14px_rgba(11,19,36,0.7)]"><UserRound size={28} /></div>
      <p className="relative mt-5 text-[20px] font-bold tracking-tight">登录后，分身才知道你是谁</p>
      <p className="relative mt-1.5 text-[13px] leading-5 text-muted">游客可以先浏览活动和资源<br />日报、商机与画像需要登录</p>
      <Btn onClick={() => { setGuest(false); reset([{ name: 'login' }]) }} className="relative mt-7 w-full">手机号快速登录</Btn>
    </div>
  )
}

export default function App() {
  const [stack, setStack] = useState<Entry[]>(() => [entry({ name: 'login' })])
  const [motion, setMotion] = useState<Motion>('fade')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [cert, setCert] = useState<CertState>('未认证')
  const [guest, setGuest] = useState(false)
  const [registered, setRegistered] = useState<string[]>([])
  const [favs, setFavs] = useState<string[]>([])
  const [leads, setLeads] = useState<{ name: string; note: string; time: string }[]>([])
  const [feedback, setFb] = useState<Record<string, 'up' | 'down' | 'hide'>>({})
  const [profile, setProfile] = useState<Profile>({ name: '林海', title: '总经理', city: '深圳', company: '深圳海鲸家居科技有限公司', countries: ['东南亚', '中东'], topics: ['政策合规', '认证与准入', '渠道与买家'], stage: '已出海要增长' })
  const [posts, setPosts] = useState<Post[]>([...myPostSeeds, ...seedPosts])
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings)
  const [moments, setMoments] = useState<Moment[]>(momentSeeds)
  const [theme, setTheme] = useState<string>('ocean')
  const [scrolled, setScrolled] = useState(false)
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
  const t = useRef<ReturnType<typeof setTimeout>>(undefined)
  const reviews = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  /** Mirrors `stack` synchronously, so navigation fired from timers or twice in one handler sees the latest stack. */
  const stackRef = useRef(stack)
  /** Each page's own scroll container, by entry key. */
  const layers = useRef(new Map<number, HTMLDivElement>())

  const toast = useCallback((m: string) => { setToastMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setToastMsg(null), 2000) }, [])
  // Pages below the top stay mounted (see the layers below), so going back reveals them with state and scroll intact.
  const nav = (next: Entry[], m: Motion, scrollTop = 0) => { stackRef.current = next; setStack(next); setMotion(m); setScrolled(scrollTop > 8) }
  const reset = (rs: Route[]) => nav(rs.map(entry), 'fade')
  const back = () => {
    const s = stackRef.current
    if (s.length > 1) return nav(s.slice(0, -1), 'back', layers.current.get(s[s.length - 2].key)?.scrollTop)
    // A page opened on its own still has a logical parent to return to.
    const up = trail(s[0]).slice(0, -1)
    if (up.length) nav(up.map(entry), 'back')
  }
  const push = (r: Route) => {
    const n = norm(r)
    const s = stackRef.current
    // Tab routes are always stack roots, so pushing one behaves like switching tabs.
    if (tabNames.includes(n.name)) return reset([n])
    if (same(s[s.length - 1], n)) return
    // Opening the page right below (ticket → 查看活动) goes back to it rather than stacking a second copy.
    if (s.length > 1 && same(s[s.length - 2], n)) return back()
    nav([...s, entry(n)], 'push')
  }
  const replace = (r: Route) => nav([...stackRef.current.slice(0, -1), entry(r)], 'push')
  const tab = (name: string) => {
    const s = stackRef.current
    // Tapping the open tab again scrolls it to the top instead of reloading it.
    if (s.length === 1 && s[0].name === name) return layers.current.get(s[0].key)?.scrollTo({ top: 0, behavior: 'smooth' })
    reset([{ name }])
  }
  const setParams = (params: any) => {
    const s = stackRef.current
    const next = [...s.slice(0, -1), { ...s[s.length - 1], params }]
    stackRef.current = next
    setStack(next)
  }
  const register = (id: string) => setRegistered((r) => (r.includes(id) ? r : [...r, id]))

  const updatePost = (id: string, patch: Partial<Post>) => {
    // Leaving review (withdrawn, relisted elsewhere) cancels the pending simulated approval.
    if (patch.status && patch.status !== '审核中') clearTimeout(reviews.current[id])
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  /** Adds or re-submits a post (same id replaces the old version and moves it to the top). */
  const addPost = (p: Post) => {
    setPosts((ps) => [p, ...ps.filter((x) => x.id !== p.id)])
    clearTimeout(reviews.current[p.id])
    if (p.status !== '审核中') return
    // Simulated platform review: approve about five seconds after (re)submission unless it left review meanwhile.
    reviews.current[p.id] = setTimeout(() => {
      setPosts((ps) => ps.map((x) => (x.id === p.id && x.status === '审核中' ? { ...x, status: '已发布', time: '刚刚' } : x)))
      toast('你发布的供需已通过审核，正在商机广场展示')
    }, 5000)
  }

  const cur = stack[stack.length - 1]
  const isTab = tabNames.includes(cur.name)
  const fullBleed = isTab || FULL_BLEED.includes(cur.name)
  const tone: Tone = TONE[cur.name] ?? 'canvas'
  const darkTop = !fullBleed && tone === 'dark'
  const h = new Date().getHours()
  const greet = h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好'

  const render = (r: Route) => {
    switch (r.name) {
      case 'login': return <Login />
      case 'onboard': return <Onboard />
      case 'portrait': return <Portrait />
      case 'home': return guest ? <GuestBlock /> : <Home />
      case 'daily': return <DailyDetail id={r.params} />
      case 'sources': return <Sources />
      case 'agent': return <AgentChat params={r.params} />
      case 'events': return <Events />
      case 'event': return <EventDetail id={r.params} />
      case 'ticket': return <TicketPage id={r.params} />
      case 'biz': return guest ? <GuestBlock /> : <Biz initial={r.params} />
      case 'publish': return <Publish focus={r.params?.focus} edit={r.params?.edit} />
      case 'published': return <Published id={r.params} />
      case 'bizDetail': return <BizDetail id={r.params} />
      case 'resources': return <Resources initial={r.params} />
      case 'provider': return <ProviderDetail id={r.params} />
      case 'human': return <HumanAgentDetail id={r.params} />
      case 'me': return guest ? <GuestBlock /> : <Me />
      case 'myPortrait': return <MyPortrait />
      case 'cert': return <Cert />
      case 'messages': return <Messages />
      case 'myEvents': case 'myFavs': case 'myLeads': return <MyList kind={r.name} />
      case 'feedback': return <Feedback />
      default: return <Doc title={r.params ?? '说明'} />
    }
  }

  const store = {
    push, replace, reset, back, tab, setParams, toast, overlay, scrolled, tone, cert, setCert, guest, setGuest, registered, register,
    favs, toggleFav: (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    leads, addLead: (name: string, note: string) => setLeads((l) => [{ name, note, time: '刚刚' }, ...l]),
    feedback, setFeedback: (id: string, v: 'up' | 'down' | 'hide') => setFb((f) => ({ ...f, [id]: v })),
    profile, setProfile,
    posts, addPost, updatePost,
    meetings,
    addMeeting: (m: Meeting) => setMeetings((ms) => [m, ...ms]),
    updateMeeting: (id: string, patch: Partial<Meeting>) => setMeetings((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    moments, setMoments,
  }

  /** Opens a page from the prototype index with the back stack a user would have built getting there. */
  const jump = (r: Route) => {
    const s = trail(norm(r))
    const page = s[s.length - 1]
    if (GUARDED.includes(s[0].name)) setGuest(false)
    // A ticket only exists after registering, so opening one cold registers for that event first.
    if (page.name === 'ticket') register(page.params)
    reset(s)
  }

  return (
    <Ctx.Provider value={store}>
      <div data-theme={theme} className="relative flex min-h-screen items-center justify-center gap-12 overflow-hidden bg-[#e8ecf4] p-6 text-ink">
        <div aria-hidden className="aurora pointer-events-none absolute inset-0 opacity-80" />

        <aside className="relative hidden w-72 shrink-0 lg:block">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink font-display text-[14px] font-bold text-white">HB</div>
            <div className="leading-tight"><div className="text-[14px] font-semibold">HIBOSS 海老板</div><div className="text-[12px] text-muted">V1 小程序 · 交互原型</div></div>
          </div>
          <h1 className="mt-6 text-[28px] font-bold leading-[34px] tracking-tight">每个页面<br />都能点着走</h1>

          <p className="mt-6 text-[12px] font-medium text-muted">界面配色</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEMES.map(([k, name, c1, c2]) => (
              <button key={k} onClick={() => setTheme(k)} className={`flex h-9 items-center gap-2 rounded-full border px-3 text-[12px] transition ${theme === k ? 'border-ink bg-white font-semibold' : 'border-white/0 bg-white/60 text-muted hover:bg-white'}`}>
                <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />{name}
              </button>
            ))}
          </div>

          <nav className="no-scrollbar mt-6 max-h-[46vh] space-y-4 overflow-y-auto pr-2">
            {INDEX.map(([group, items]) => (
              <div key={group}>
                <p className="mb-1 px-3 text-[11px] font-medium tracking-wide text-subtle">{group}</p>
                {items.map(([name, r]) => {
                  const on = same(cur, r)
                  return (
                    <button key={name} onClick={() => jump(r)} className={`flex w-full items-center rounded-xl px-3 py-1.5 text-left text-[13px] transition ${on ? 'bg-white font-semibold shadow-sm' : 'text-ink/80 hover:bg-white/60'}`}>
                      {name}{group === '商机' && name === '发布供需' && <span className="ml-2 rounded-full bg-brand px-1.5 text-[10px] font-medium text-white">新</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className="mt-5 rounded-2xl bg-white/60 p-3 text-[11px] leading-4 text-muted">认证状态：<b className="text-ink">{cert}</b>。在「企业认证」页可切换，会影响活动报名、服务商联系和真人 Agent 预约。</div>
        </aside>

        <div className="relative h-[812px] w-[375px] shrink-0 overflow-hidden rounded-[48px] bg-canvas shadow-[0_40px_100px_-30px_rgba(11,19,36,0.45)] ring-[10px] ring-[#0b0d12]">
          {!fullBleed && <div className={`absolute inset-x-0 top-0 h-11 ${toneBg[tone]}`} />}

          <div className={`pointer-events-none absolute inset-x-0 top-0 z-[75] flex h-11 items-center justify-between px-7 text-[15px] font-semibold ${darkTop ? 'text-white' : 'text-ink'}`}>
            <span className="font-display tabular-nums">9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[26px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1"><Signal size={15} strokeWidth={2.5} /><Wifi size={15} strokeWidth={2.5} /><BatteryFull size={20} strokeWidth={2} /></span>
          </div>
          <Capsule dark={darkTop} />

          {isTab && (
            <div className={`absolute inset-x-0 top-0 z-30 h-[88px] pt-11 transition-colors duration-200 ${scrolled ? 'border-b border-line/60 bg-canvas/80 backdrop-blur-xl' : ''}`}>
              <div className="flex h-11 items-center gap-2.5 pl-4 pr-[148px]">
                {cur.name === 'home' && !guest ? (
                  <>
                    <Orb size={32} />
                    <div className="min-w-0 leading-tight"><div className="text-[11px] text-muted">你的出海分身 · 在线</div><div className="truncate text-[15px] font-semibold">{greet}，{profile.name}</div></div>
                  </>
                ) : <span className="text-[20px] font-bold tracking-tight">{TAB_TITLE[cur.name] ?? '日报'}</span>}
              </div>
              {!guest && cur.name !== 'me' && (
                <button onClick={() => push({ name: 'messages' })} aria-label="消息" className="absolute right-[104px] top-[50px] grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70 backdrop-blur">
                  <Bell size={16} /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />
                </button>
              )}
            </div>
          )}

          {/* One scroll layer per stack entry, newest on top. Covered layers stay mounted but hidden and inert; only the top one shows portals. */}
          {stack.map((r, i) => {
            const on = i === stack.length - 1
            const root = tabNames.includes(r.name)
            const chat = r.name === 'agent'
            return (
              <PageCtx.Provider key={r.key} value={on}>
                <div
                  ref={(el) => { if (el) layers.current.set(r.key, el); else layers.current.delete(r.key) }}
                  onScroll={on ? (e) => setScrolled(e.currentTarget.scrollTop > 8) : undefined}
                  inert={!on}
                  aria-hidden={!on}
                  className={`no-scrollbar absolute inset-x-0 bottom-0 overflow-x-hidden ${root || FULL_BLEED.includes(r.name) ? 'top-0' : 'top-11'} ${chat ? 'overflow-hidden' : 'overflow-y-auto'} ${on ? '' : 'pointer-events-none invisible'}`}
                >
                  <div className={`min-h-full ${on ? MOTION[motion] : ''} ${root ? 'pb-[112px]' : ''}`} style={chat ? { height: '100%' } : undefined}>{render(r)}</div>
                </div>
              </PageCtx.Provider>
            )
          })}

          {isTab && (
            <nav className="absolute inset-x-3 bottom-[22px] z-30 grid h-[62px] grid-cols-5 rounded-[26px] border border-white/80 bg-white/80 px-1 shadow-[0_14px_36px_-14px_rgba(11,19,36,0.4)] backdrop-blur-xl">
              {TABS.map(([k, label, I]) => {
                const on = cur.name === k
                return (
                  <button key={k} onClick={() => tab(k)} className="relative flex flex-col items-center justify-center gap-0.5">
                    <span className={`grid h-8 w-12 place-items-center rounded-full transition-all duration-200 ${on ? 'bg-ink text-white' : 'text-subtle'}`}><I size={19} strokeWidth={on ? 2.3 : 2} /></span>
                    <span className={`text-[10px] ${on ? 'font-semibold text-ink' : 'text-subtle'}`}>{label}</span>
                    {k === 'biz' && !on && <span className="absolute right-[18px] top-[9px] h-2 w-2 rounded-full border-2 border-white bg-accent" />}
                  </button>
                )
              })}
            </nav>
          )}

          <div ref={setOverlay} className="pointer-events-none absolute inset-0 z-50" />
          <span className={`pointer-events-none absolute bottom-2 left-1/2 z-[80] h-[5px] w-[134px] -translate-x-1/2 rounded-full ${darkTop ? 'bg-white' : 'bg-ink'}`} />
          <ToastView msg={toastMsg} />
        </div>
      </div>
    </Ctx.Provider>
  )
}
