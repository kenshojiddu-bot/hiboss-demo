import { useCallback, useRef, useState } from 'react'
import { Newspaper, CalendarDays, Handshake, LayoutGrid, UserRound, Bell } from 'lucide-react'
import { Aurora, Btn, Ctx, Orb, PageCtx, ToastView, useStore, type CertState, type Profile, type Route, type Tone } from './ui'
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

/** Surface behind the navigation bar for non-tab routes. */
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

/** A page in the back stack. Its key identifies it for as long as it stays in the stack, even when its params change. */
type Entry = Route & { key: number }
type Motion = 'push' | 'back' | 'fade'
const MOTION: Record<Motion, string> = { push: 'animate-[slidein_.28s_ease-out]', back: 'animate-[slideback_.24s_ease-out]', fade: 'animate-[fadein_.2s_ease-out]' }
let seq = 0
const entry = (r: Route): Entry => ({ ...norm(r), key: ++seq })
const PROFILE_STORAGE_KEY = 'hiboss.demo.profile'
const EMPTY_PROFILE: Profile = { name: '', title: '', city: '深圳', company: '', countries: [], topics: [], stage: '' }
const loadProfile = (): Profile | null => {
  try {
    const value = localStorage.getItem(PROFILE_STORAGE_KEY)
    return value ? { ...EMPTY_PROFILE, ...JSON.parse(value) } : null
  } catch {
    return null
  }
}

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
  const [stack, setStack] = useState<Entry[]>(() => [entry({ name: loadProfile() ? 'home' : 'onboard' })])
  const [motion, setMotion] = useState<Motion>('fade')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [cert, setCert] = useState<CertState>('未认证')
  const [guest, setGuest] = useState(false)
  const [registered, setRegistered] = useState<string[]>([])
  const [favs, setFavs] = useState<string[]>([])
  const [leads, setLeads] = useState<{ name: string; note: string; time: string }[]>([])
  const [feedback, setFb] = useState<Record<string, 'up' | 'down' | 'hide'>>({})
  const [profile, setProfile] = useState<Profile>(() => loadProfile() ?? EMPTY_PROFILE)
  const [posts, setPosts] = useState<Post[]>([...myPostSeeds, ...seedPosts])
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings)
  const [moments, setMoments] = useState<Moment[]>(momentSeeds)
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
  const tone: Tone = TONE[cur.name] ?? 'canvas'
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
    profile, setProfile: (p: Profile) => {
      setProfile(p)
      try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p)) } catch { /* Storage may be unavailable in private browsing. */ }
    },
    posts, addPost, updatePost,
    meetings,
    addMeeting: (m: Meeting) => setMeetings((ms) => [m, ...ms]),
    updateMeeting: (id: string, patch: Partial<Meeting>) => setMeetings((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    moments, setMoments,
  }

  return (
    <Ctx.Provider value={store}>
      <div data-theme="ocean" className="relative h-dvh overflow-hidden bg-canvas text-ink">
        <div className="relative h-full w-full overflow-hidden bg-canvas">

          {isTab && (
            <div className={`absolute inset-x-0 top-0 z-30 h-16 transition-colors duration-200 ${scrolled ? 'border-b border-line/60 bg-canvas/85 backdrop-blur-xl' : ''}`}>
              <div className="mx-auto flex h-16 max-w-[1040px] items-center gap-2.5 px-4 pr-28">
                {cur.name === 'home' && !guest ? (
                  <>
                    <Orb size={32} />
                    <div className="min-w-0 leading-tight"><div className="text-[11px] text-muted">你的出海分身 · 在线</div><div className="truncate text-[15px] font-semibold">{greet}，{profile.name}</div></div>
                  </>
                ) : <span className="text-[20px] font-bold tracking-tight">{TAB_TITLE[cur.name] ?? '日报'}</span>}
              </div>
              {!guest && cur.name !== 'me' && (
                  <button onClick={() => push({ name: 'messages' })} aria-label="消息" className="top-action absolute top-4 grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70 backdrop-blur">
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
                  className={`no-scrollbar absolute inset-x-0 bottom-0 top-0 overflow-x-hidden ${chat ? 'overflow-hidden' : 'overflow-y-auto'} ${on ? '' : 'pointer-events-none invisible'}`}
                >
                  <div className={`mx-auto min-h-full max-w-[1040px] ${on ? MOTION[motion] : ''} ${root ? 'pb-[112px]' : ''}`} style={chat ? { height: '100%' } : undefined}>{render(r)}</div>
                </div>
              </PageCtx.Provider>
            )
          })}

          {isTab && (
            <nav className="bottom-safe absolute left-1/2 z-30 grid h-[62px] w-[calc(100%-24px)] max-w-[480px] -translate-x-1/2 grid-cols-5 rounded-[26px] border border-white/80 bg-white/90 px-1 shadow-[0_14px_36px_-14px_rgba(11,19,36,0.4)] backdrop-blur-xl">
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
          <ToastView msg={toastMsg} />
        </div>
      </div>
    </Ctx.Provider>
  )
}
