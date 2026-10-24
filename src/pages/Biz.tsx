import { useEffect, useRef, useState } from 'react'
import { ArrowUpDown, CalendarPlus, Check, CircleAlert, Clock, Eye, EyeOff, Flag, Handshake, Heart, Image as ImageIcon, Link2, Loader2, Lock, MapPin, MessageCircle, MoreHorizontal, Pencil, Phone, Plus, RefreshCw, RotateCcw, Search, SearchX, Send, Share2, ShieldCheck, Sparkles, TrendingUp, Undo2, X } from 'lucide-react'
import { Aurora, Avatar, BottomBar, Btn, Card, CertBadge, Confirm, Empty, MatchBadge, NavBar, Portal, Segmented, Sheet, Tag, useStore } from '../ui'
import { intents, markets, type Post, type PostStatus } from '../data'
import { MeetingSheet, MeetingsPanel } from './Meetings'

const live = (p: Post) => (p.status ?? '已发布') === '已发布'

const SideRow = ({ kind, label, text }: { kind: 'offer' | 'need'; label: string; text: string }) => (
  <div className={`flex gap-2.5 rounded-2xl px-3 py-2.5 ${kind === 'offer' ? 'bg-success-soft/70' : 'bg-brand-soft/80'}`}>
    <span className={`mt-px h-5 shrink-0 rounded-md px-1.5 text-[11px] font-semibold leading-5 text-white ${kind === 'offer' ? 'bg-success' : 'bg-brand'}`}>{kind === 'offer' ? '能做' : '需要'}</span>
    <div className="min-w-0">
      <p className="line-clamp-2 text-[13px] leading-[19px] text-ink/90">{text}</p>
      <p className={`mt-1 truncate text-[11px] font-medium ${kind === 'offer' ? 'text-success' : 'text-brand'}`}>{label}</p>
    </div>
  </div>
)

/** Marketplace card: who, where, both sides of the post, budget, traction and AI match. */
export function PostCard({ p }: { p: Post }) {
  const { push } = useStore()
  return (
    <Card onClick={() => push({ name: 'bizDetail', params: p.id })} className="!p-3.5">
      <div className="flex items-center gap-2.5">
        <Avatar text={p.anonymous ? '匿' : p.logo} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5"><span className="truncate text-[15px] font-semibold">{p.anonymous ? '匿名企业' : p.company}</span>{p.cert ? <CertBadge /> : <CertBadge state="未认证" />}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-subtle">
            <span className="flex items-center gap-1 font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />对接中</span>
            <span>·</span><MapPin size={11} />{p.region.join(' · ')}<span>·</span>{p.time}
            {p.scope === '仅认证企业' && <><span>·</span><Lock size={11} />仅认证</>}
          </div>
        </div>
        {!p.mine && <MatchBadge value={p.match} />}
      </div>
      <div className="mt-3 space-y-2">
        {p.offer && <SideRow kind="offer" label={p.offer.types.join(' · ')} text={p.offer.text} />}
        {p.need && <SideRow kind="need" label={p.need.type} text={p.need.text} />}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-subtle">
        {p.need ? <>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-ink">{p.need.budget}</span>
          <span className="flex items-center gap-0.5"><Clock size={11} />{p.need.deadline}</span>
        </> : p.offer?.highlights[0] && <span className="rounded-full bg-chip px-2 py-0.5 text-muted">{p.offer.highlights[0]}</span>}
        <span className="ml-auto flex items-center gap-2.5">
          <span className="flex items-center gap-0.5"><Eye size={12} />{p.views}</span>
          <span className="flex items-center gap-0.5"><Handshake size={12} />{p.intents} 意向</span>
        </span>
      </div>
    </Card>
  )
}

type Seg = 'plaza' | 'mine' | 'meet'

export default function Biz({ initial }: { initial?: string }) {
  const { posts, meetings, setParams } = useStore()
  const [seg, setSeg] = useState<Seg>(initial === 'mine' || initial === 'meet' ? initial : 'plaza')
  const mine = posts.filter((p) => p.mine).length
  const invites = meetings.filter((m) => m.status === '待确认' && m.by === 'them').length
  return (
    <div className="relative">
      <Aurora className="h-[300px]" />
      <div className="relative px-4 pt-[96px]">
        <Segmented
          items={[
            { key: 'plaza', label: '广场' },
            { key: 'mine', label: <>我的发布 <span className="font-display text-[12px] opacity-50">{mine}</span></> },
            { key: 'meet', label: <span className="relative">会议{invites > 0 && <span className="absolute -right-2.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />}</span> },
          ]}
          value={seg}
          onChange={(s) => { setSeg(s); setParams(s) }}
        />
      </div>
      {seg === 'plaza' ? <Plaza /> : seg === 'mine' ? <MyPosts /> : <MeetingsPanel />}
    </div>
  )
}

const TYPES = ['全部', '有需求', '有能力'] as const

function Plaza() {
  const { posts, push, profile } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState<(typeof TYPES)[number]>('全部')
  const [region, setRegion] = useState('全部')
  const [sort, setSort] = useState<'匹配度' | '最新'>('匹配度')
  // Other companies' approved posts only; the posts array is already newest-first.
  const pool = posts.filter((p) => !p.mine && live(p))
  const kw = q.trim().toLowerCase()
  const list = pool.filter((p) =>
    (type === '全部' || (type === '有需求' ? !!p.need : !!p.offer)) &&
    (region === '全部' || p.region.includes(region)) &&
    (!kw || [p.company, p.offer?.text, p.need?.text, p.need?.type, ...(p.offer?.types ?? []), ...p.region].some((s) => s?.toLowerCase().includes(kw))))
  const shown = sort === '匹配度' ? [...list].sort((a, b) => b.match - a.match) : list
  const strong = pool.filter((p) => p.match >= 80).length
  const filtered = !!kw || type !== '全部' || region !== '全部'

  return (
    <div className="pb-14">
      <div className="relative mt-3 px-4">
        <label className="flex h-11 items-center gap-2 rounded-full border border-white bg-white/80 px-4 shadow-card backdrop-blur">
          <Search size={17} className="shrink-0 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜公司、品类、地区，如「收纳」「沙特」" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-subtle" />
          {q && <button onClick={() => setQ('')} aria-label="清除搜索" className="grid h-6 w-6 place-items-center rounded-full bg-chip text-muted"><X size={13} /></button>}
        </label>
      </div>

      <div className="sticky top-[88px] z-20 mt-2 space-y-2 bg-canvas/85 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4">
          <div className="flex rounded-full bg-ink/[0.06] p-0.5">
            {TYPES.map((t) => <button key={t} onClick={() => setType(t)} className={`h-8 rounded-full px-3.5 text-[13px] transition ${type === t ? 'bg-white font-semibold shadow-[0_2px_8px_-3px_rgba(11,19,36,0.25)]' : 'text-muted'}`}>{t}</button>)}
          </div>
          <button onClick={() => setSort(sort === '匹配度' ? '最新' : '匹配度')} className="ml-auto flex h-8 items-center gap-1 rounded-full border border-line bg-white px-3 text-[13px]"><ArrowUpDown size={13} />{sort}</button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">{['全部', ...markets].map((r) => <Tag key={r} active={region === r} onClick={() => setRegion(r)}>{r === '全部' ? '全部地区' : r}</Tag>)}</div>
      </div>

      <div className="px-4 pt-1">
        {sort === '匹配度' && !filtered && (
          <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-ai/15 bg-linear-to-r from-ai-soft to-white px-3.5 py-3">
            <Sparkles size={16} className="shrink-0 text-ai" />
            <p className="text-[13px] leading-[18px] text-ai-ink">分身按你的画像（{profile.countries.join('、')} · 家居）排序，<b className="font-display">{strong}</b> 条高度匹配</p>
          </div>
        )}
        {!shown.length ? (
          <>
            <Card><Empty icon={<SearchX size={26} />} text="没有符合条件的商机" action="发布我的需求，让对方来找我" onAction={() => push({ name: 'publish', params: { focus: 'need' } })} /></Card>
            <button onClick={() => { setQ(''); setType('全部'); setRegion('全部') }} className="mt-3 w-full text-center text-[13px] font-medium text-brand">清除全部筛选</button>
          </>
        ) : <div className="space-y-3">{shown.map((p) => <PostCard key={p.id} p={p} />)}</div>}
      </div>

      <Portal>
        <button onClick={() => push({ name: 'publish' })} className="pointer-events-auto absolute bottom-[100px] right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-ink pl-4 pr-5 text-[15px] font-semibold text-white shadow-[0_16px_32px_-12px_rgba(11,19,36,0.6)] transition active:scale-95"><Plus size={18} />发布供需</button>
      </Portal>
    </div>
  )
}

export const postStatusCls: Record<PostStatus, string> = { 审核中: 'bg-accent-soft text-accent-ink', 已发布: 'bg-success-soft text-success', 已下架: 'bg-chip text-muted', 已过期: 'bg-danger-soft text-danger' }
const REFRESH_LIMIT = 3
/** Demo daily refresh counter; module-level so it survives tab switches within the session. */
const refreshUsed: Record<string, number> = {}

export function ShareSheet({ open, onClose, post }: { open: boolean; onClose: () => void; post?: Post | null }) {
  const { toast } = useStore()
  // Keep showing the last post while the sheet animates closed.
  const last = useRef(post)
  if (post) last.current = post
  const p = last.current
  return (
    <Sheet open={open} onClose={onClose} title="分享这条供需">
      {p && (
        <div className="relative overflow-hidden rounded-[22px] bg-linear-to-br from-brand to-brand-2 p-4 text-white">
          <div aria-hidden className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <p className="relative font-display text-[11px] font-semibold tracking-[0.14em] opacity-80">HIBOSS 海老板 · 商机</p>
          <p className="relative mt-2 line-clamp-3 text-[15px] font-semibold leading-[22px]">{p.need?.text ?? p.offer?.text}</p>
          <p className="relative mt-3 text-[11px] opacity-80">{p.anonymous ? '匿名企业' : p.company} · {p.region.join(' · ')}</p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {([[MessageCircle, '微信好友', '已打开微信分享'], [ImageIcon, '生成海报', '海报已保存到相册'], [Link2, '复制链接', '链接已复制']] as const).map(([I, t, msg]) => (
          <button key={t} onClick={() => { onClose(); toast(msg) }} className="flex flex-col items-center gap-2 rounded-2xl bg-chip py-4 text-[12px] transition active:scale-95"><I size={22} />{t}</button>
        ))}
      </div>
    </Sheet>
  )
}

function MyPosts() {
  const { posts, push, updatePost, addPost, toast } = useStore()
  const mine = posts.filter((p) => p.mine)
  const [f, setF] = useState<'全部' | PostStatus>('全部')
  const [down, setDown] = useState<Post | null>(null)
  const [share, setShare] = useState<Post | null>(null)
  const list = mine.filter((p) => f === '全部' || p.status === f)
  const resubmit = (p: Post) => { addPost({ ...p, status: '审核中', time: '刚刚' }); toast('已重新提交审核，通过后自动上架') }
  const refresh = (p: Post) => {
    const used = refreshUsed[p.id] ?? 0
    if (used >= REFRESH_LIMIT) return toast('今天 3 次刷新已用完，明天再来')
    refreshUsed[p.id] = used + 1
    const rank = Math.max(1, (p.rank ?? 20) - 2 - Math.floor(Math.random() * 4))
    updatePost(p.id, { rank, time: '刚刚' })
    toast(`已刷新，同类排名升至第 ${rank} 名 · 今日还剩 ${REFRESH_LIMIT - used - 1} 次`)
  }
  const act = 'flex h-11 flex-1 items-center justify-center gap-1 text-[13px] font-medium transition active:bg-chip'

  return (
    <div>
      <div className="relative mx-4 mt-4 overflow-hidden rounded-[22px] bg-ink p-4 text-white">
        <div aria-hidden className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-linear-to-br from-brand to-brand-2 opacity-40 blur-2xl" />
        <div className="relative grid grid-cols-3 divide-x divide-white/10 text-center">
          {([[mine.filter(live).length, '展示中'], [mine.reduce((s, p) => s + p.views, 0), '总浏览'], [mine.reduce((s, p) => s + p.intents, 0), '收到意向']] as const).map(([n, l]) => (
            <div key={l}><div className="font-display text-[24px] font-bold leading-8">{n}</div><div className="text-[11px] text-white/55">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="sticky top-[88px] z-20 mt-2 bg-canvas/85 py-2.5 backdrop-blur-xl">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {(['全部', '审核中', '已发布', '已下架', '已过期'] as const).map((s) => {
            const n = s === '全部' ? mine.length : mine.filter((p) => p.status === s).length
            return <Tag key={s} active={f === s} onClick={() => setF(s)}>{s}<span className="ml-1 font-display opacity-60">{n}</span></Tag>
          })}
        </div>
      </div>

      <div className="space-y-3 px-4 pt-1">
        {!list.length ? (
          <Card><Empty icon={<Handshake size={26} />} text={f === '全部' ? '还没有发布过供需，说说你能做什么、需要什么' : `没有「${f}」的发布`} action="发布供需" onAction={() => push({ name: 'publish' })} /></Card>
        ) : list.map((p) => {
          const st = p.status ?? '已发布'
          const left = REFRESH_LIMIT - (refreshUsed[p.id] ?? 0)
          return (
            <Card key={p.id} className="!p-0 overflow-hidden">
              <div onClick={() => push({ name: 'bizDetail', params: p.id })} className="cursor-pointer p-3.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium ${postStatusCls[st]}`}>{st === '审核中' && <Loader2 size={12} className="animate-spin" />}{st}</span>
                  <span className="truncate text-[12px] text-subtle">{p.time} · 有效期 {p.expire ?? '30 天'}</span>
                  {st === '已发布' && p.rank && <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-brand"><TrendingUp size={12} />同类第 {p.rank} 名</span>}
                </div>
                <div className="mt-3 space-y-2">
                  {p.offer && <SideRow kind="offer" label={p.offer.types.join(' · ')} text={p.offer.text} />}
                  {p.need && <SideRow kind="need" label={`${p.need.type} · ${p.need.budget}`} text={p.need.text} />}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[12px] text-muted">
                  <span className="flex items-center gap-1"><Eye size={13} />{p.views} 浏览</span>
                  <span className="flex items-center gap-1"><Handshake size={13} />{p.intents} 意向</span>
                  {p.anonymous && <span className="flex items-center gap-1"><EyeOff size={13} />匿名</span>}
                  {p.scope === '仅认证企业' && <span className="flex items-center gap-1"><Lock size={13} />仅认证可见</span>}
                </div>
                {st === '已发布' && p.intents > 0 && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-chip px-3 py-2 text-[12px]">
                    <Avatar text={intents[0].logo} size={20} />
                    <span className="min-w-0 flex-1 truncate"><b className="font-semibold">{intents[0].company}</b>：{intents[0].msg}</span>
                    <span className="shrink-0 text-subtle">{intents[0].time}</span>
                  </div>
                )}
                {st === '审核中' && <p className="mt-2.5 rounded-xl bg-accent-soft px-3 py-2 text-[12px] leading-[18px] text-accent-ink">平台审核中，通常 5 秒内完成（演示），通过后自动在广场展示</p>}
                {st === '已过期' && <p className="mt-2.5 rounded-xl bg-danger-soft px-3 py-2 text-[12px] leading-[18px] text-danger">已过期停止展示，重新发布可继续获得曝光，原有数据会保留</p>}
              </div>
              <div className="flex divide-x divide-line/70 border-t border-line/70">
                <button onClick={() => push({ name: 'publish', params: { edit: p.id } })} className={act}><Pencil size={14} />编辑</button>
                {st === '审核中' && <button onClick={() => { updatePost(p.id, { status: '已下架' }); toast('已撤回，可修改后重新提交') }} className={act}><Undo2 size={14} />撤回</button>}
                {st === '已发布' && <>
                  <button onClick={() => refresh(p)} className={`${act} ${left ? 'text-brand' : 'text-subtle'}`}><RefreshCw size={14} />刷新 {left}/{REFRESH_LIMIT}</button>
                  <button onClick={() => setShare(p)} className={act}><Share2 size={14} />分享</button>
                  <button onClick={() => setDown(p)} className={`${act} text-muted`}>下架</button>
                </>}
                {(st === '已下架' || st === '已过期') && <button onClick={() => resubmit(p)} className={`${act} text-brand`}><RotateCcw size={14} />{st === '已过期' ? '重新发布' : '重新上架'}</button>}
              </div>
            </Card>
          )
        })}
        <button onClick={() => push({ name: 'publish' })} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand/40 bg-white/60 text-[14px] font-medium text-brand"><Plus size={16} />再发一条</button>
      </div>

      <Confirm open={!!down} text="下架后其他企业将看不到这条供需，已收到的意向会保留。确定下架吗？" okText="下架" onCancel={() => setDown(null)} onOk={() => { if (down) updatePost(down.id, { status: '已下架' }); setDown(null); toast('已下架，可随时重新上架') }} />
      <ShareSheet open={!!share} onClose={() => setShare(null)} post={share} />
    </div>
  )
}

function RespondSheet({ open, onClose, post }: { open: boolean; onClose: () => void; post: Post }) {
  const { cert, push, addLead, profile, toast } = useStore()
  const [msg, setMsg] = useState('')
  const [writing, setWriting] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => { if (open) setMsg('') }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])
  const draft = `你好，我是${profile.company}的${profile.name}。${post.need ? `我们可以承接你「${post.need.type}」的需求：年产 60 万件收纳家居，支持 OEM/ODM 与小单试产，雅加达有本地仓。` : `我们对你提供的「${post.offer?.types.join('、')}」很感兴趣，正在拓展${profile.countries.join('、')}市场。`}方便的话约个时间视频聊聊？`
  const write = () => { setWriting(true); timer.current = setTimeout(() => { setMsg(draft); setWriting(false) }, 700) }
  return (
    <Sheet open={open} onClose={onClose} title="表达合作意向">
      {cert !== '已认证' && (
        <div className="mb-3 flex gap-2 rounded-2xl bg-accent-soft p-3 text-[12px] leading-[18px] text-accent-ink">
          <CircleAlert size={15} className="mt-px shrink-0" />
          <p>你还未完成企业认证，意向会标注「未认证」，对方回复率可能较低。<button onClick={() => { onClose(); push({ name: 'cert' }) }} className="font-semibold underline underline-offset-2">去认证</button></p>
        </div>
      )}
      <div className="rounded-2xl bg-chip px-4 py-3 text-[13px] text-muted">发给 · <b className="text-ink">{post.anonymous ? '匿名企业' : post.company}</b></div>
      <div className="relative mt-3 rounded-2xl border border-line transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
        <textarea value={msg} onChange={(e) => setMsg(e.target.value.slice(0, 300))} placeholder="说说你能提供什么、想怎么合作" className="block h-36 w-full resize-none rounded-2xl bg-transparent p-4 pb-11 text-[15px] leading-[22px] outline-none placeholder:text-subtle" />
        <div className="absolute inset-x-3 bottom-3 flex items-center">
          <button onClick={write} disabled={writing} className="flex h-7 items-center gap-1 rounded-full bg-linear-to-r from-ai to-brand px-3 text-[12px] font-medium text-white disabled:opacity-70">{writing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}{writing ? '分身撰写中…' : 'AI 按画像帮我写'}</button>
          <span className="ml-auto font-display text-[11px] text-subtle">{msg.length}/300</span>
        </div>
      </div>
      <Btn disabled={msg.trim().length < 5} onClick={() => { addLead(post.company, msg.trim()); onClose(); toast('意向已发送，对方回复后会通知你') }} className="mt-4 w-full"><Send size={16} />发送意向</Btn>
    </Sheet>
  )
}

export function BizDetail({ id }: { id: string }) {
  const { posts, push, reset, back, cert, favs, toggleFav, leads, updatePost, addPost, toast } = useStore()
  const p = posts.find((x) => x.id === id)
  const [respond, setRespond] = useState(false)
  const [meet, setMeet] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const [report, setReport] = useState(false)
  const [reported, setReported] = useState(false)
  const [share, setShare] = useState(false)
  const [down, setDown] = useState(false)

  if (!p) {
    return (
      <div className="min-h-full">
        <NavBar title="商机详情" />
        <Empty icon={<SearchX size={26} />} text="这条商机已下架或不存在" action="去商机广场看看" onAction={() => reset([{ name: 'biz' }])} />
      </div>
    )
  }

  const owner = !!p.mine
  const st = p.status ?? '已发布'
  const certified = cert === '已认证'
  const locked = !owner && p.scope === '仅认证企业' && !certified
  const canContact = owner || certified
  const responded = leads.some((l) => l.name === p.company)
  const fav = favs.includes(p.id)
  const name = p.anonymous && !owner ? '匿名企业' : p.company
  const rows = owner ? intents.slice(0, Math.min(p.intents, intents.length)) : []
  const iconBtn = 'grid h-8 w-8 place-items-center rounded-full border border-line bg-white'

  return (
    <div className="min-h-full pb-36">
      <NavBar title={owner ? '我的发布' : '商机详情'} right={<div className="flex gap-1.5"><button onClick={() => setShare(true)} aria-label="分享" className={iconBtn}><Share2 size={15} /></button>{!owner && <button onClick={() => setMenu(true)} aria-label="更多" className={iconBtn}><MoreHorizontal size={16} /></button>}</div>} />
      <div className="px-4 pt-2">
        {reported && <div className="mb-3 flex items-center gap-2 rounded-2xl bg-accent-soft px-3.5 py-2.5 text-[13px] text-accent-ink"><Flag size={14} />你已举报这条内容，平台会在 24 小时内核实</div>}
        {owner && st !== '已发布' && (
          <div className={`mb-3 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[13px] ${postStatusCls[st]}`}>
            {st === '审核中' ? <Loader2 size={15} className="shrink-0 animate-spin" /> : <CircleAlert size={15} className="shrink-0" />}
            {{ 审核中: '审核中 · 通常 5 秒内完成（演示），通过后自动展示', 已下架: '已下架 · 其他企业暂时看不到这条供需', 已过期: '已过期 · 重新发布后可继续获得曝光' }[st]}
          </div>
        )}

        <div className="rounded-[24px] border border-line/70 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Avatar text={p.anonymous && !owner ? '匿' : p.logo} size={48} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[17px] font-bold">{name}</div>
              <div className="mt-1 flex items-center gap-1.5">{p.cert ? <CertBadge /> : <CertBadge state="未认证" />}<span className="truncate text-[12px] text-subtle">{p.region.join(' · ')} · {p.time}</span></div>
            </div>
            {!owner && <MatchBadge value={p.match} />}
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-line/70 rounded-2xl bg-chip py-2.5 text-center">
            {([[p.views, '浏览'], [p.intents, '意向'], owner ? [st === '已发布' && p.rank ? `#${p.rank}` : '—', '同类排名'] : [p.need?.deadline ?? '长期', '期限']] as const).map(([n, l]) => (
              <div key={l}><div className="font-display text-[17px] font-bold leading-6">{n}</div><div className="text-[11px] text-muted">{l}</div></div>
            ))}
          </div>
        </div>

        {!owner && p.reasons && (
          <div className="mt-3 rounded-[24px] border border-ai/15 bg-linear-to-br from-ai-soft via-white to-white p-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-ai-ink"><Sparkles size={16} className="text-ai" />为什么推荐给你</div>
            <ul className="mt-2.5 space-y-2">{p.reasons.map((r) => <li key={r} className="flex gap-2 text-[13px] leading-[19px]"><Check size={15} className="mt-0.5 shrink-0 text-ai" />{r}</li>)}</ul>
          </div>
        )}

        <div className="relative mt-3">
          <div className={`space-y-3 ${locked ? 'pointer-events-none select-none blur-[6px]' : ''}`} aria-hidden={locked}>
            {p.offer && (
              <section className="rounded-[24px] border border-line/70 bg-white p-4 shadow-card">
                <div className="flex items-center gap-2"><span className="h-6 rounded-lg bg-success px-2 text-[12px] font-semibold leading-6 text-white">{owner ? '我能做' : 'TA 能做'}</span><span className="truncate text-[13px] font-medium text-success">{p.offer.types.join(' · ')}</span></div>
                <p className="mt-3 text-[15px] leading-[24px]">{p.offer.text}</p>
                {!!p.offer.highlights.length && <div className="mt-3 flex flex-wrap gap-1.5">{p.offer.highlights.map((h) => <span key={h} className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[12px] text-success"><Check size={12} />{h}</span>)}</div>}
              </section>
            )}
            {p.need && (
              <section className="rounded-[24px] border border-line/70 bg-white p-4 shadow-card">
                <div className="flex items-center gap-2"><span className="h-6 rounded-lg bg-brand px-2 text-[12px] font-semibold leading-6 text-white">{owner ? '我需要' : 'TA 需要'}</span><span className="truncate text-[13px] font-medium text-brand">{p.need.type}</span></div>
                <p className="mt-3 text-[15px] leading-[24px]">{p.need.text}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-accent-soft px-3 py-2.5"><div className="text-[11px] text-accent-ink/70">预算</div><div className="font-display text-[16px] font-bold text-accent-ink">{p.need.budget}</div></div>
                  <div className="rounded-2xl bg-chip px-3 py-2.5"><div className="text-[11px] text-muted">期望时间</div><div className="text-[15px] font-semibold">{p.need.deadline}</div></div>
                </div>
                {!!p.need.prefer.length && <div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="text-[12px] text-muted">偏好</span>{p.need.prefer.map((x) => <span key={x} className="rounded-full border border-line px-2.5 py-1 text-[12px]">{x}</span>)}</div>}
              </section>
            )}
          </div>
          {locked && (
            <div className="absolute inset-0 grid place-items-center px-6">
              <div className="w-full rounded-[22px] border border-line/70 bg-white/95 p-5 text-center shadow-card">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-ink text-white"><Lock size={18} /></div>
                <p className="mt-3 text-[15px] font-bold">发布方设置为仅认证企业可见</p>
                <p className="mt-1 text-[12px] leading-[18px] text-muted">完成企业认证后，可查看完整内容与联系方式</p>
                <Btn onClick={() => push({ name: 'cert' })} className="mt-4 w-full">去认证</Btn>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[20px] border border-line/70 bg-white p-4 shadow-card">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Phone size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-muted">联系方式</div>
            <div className="truncate font-display text-[15px] font-semibold">{canContact ? p.contact ?? '对接后可见' : (p.contact ?? '').replace(/\d/g, '•')}</div>
          </div>
          {!canContact && <button onClick={() => push({ name: 'cert' })} className="h-8 shrink-0 rounded-full bg-ink px-3 text-[12px] font-medium text-white">认证后可见</button>}
        </div>

        {owner && (
          <section className="mt-6">
            <h3 className="mb-2.5 flex items-center justify-between px-1 text-[16px] font-bold">收到的意向<span className="font-display text-[13px] font-medium text-subtle">{p.intents}</span></h3>
            {st === '审核中' || !rows.length ? (
              <Card><p className="py-4 text-center text-[13px] text-muted">{st === '审核中' ? '审核通过后，感兴趣的企业会出现在这里' : '还没有企业表达意向，分享出去试试'}</p></Card>
            ) : (
              <div className="space-y-2.5">
                {rows.map((i) => (
                  <Card key={i.id} className="!p-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar text={i.logo} size={36} />
                      <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-[14px] font-semibold">{i.company}</span>{i.cert ? <CertBadge /> : <CertBadge state="未认证" />}</div><div className="text-[11px] text-subtle">{i.time}</div></div>
                      <MatchBadge value={i.match} />
                    </div>
                    <p className="mt-2.5 rounded-xl bg-chip px-3 py-2 text-[13px] leading-[19px]">{i.msg}</p>
                    <div className="mt-2.5 flex gap-2">
                      <Btn kind="secondary" onClick={() => toast(`已打开与 ${i.company} 的会话`)} className="!h-9 flex-1 !text-[13px]"><MessageCircle size={14} />回复</Btn>
                      <Btn onClick={() => setMeet(i.company)} className="!h-9 flex-1 !text-[13px]"><CalendarPlus size={14} />约会议</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <p className="mt-5 flex items-start gap-1.5 px-1 text-[11px] leading-4 text-subtle"><ShieldCheck size={13} className="mt-px shrink-0" />平台已核验发布方身份。对接中请勿提前支付任何费用，如遇可疑情况请举报。</p>
      </div>

      {owner ? (
        <BottomBar>
          <Btn kind="secondary" onClick={() => push({ name: 'publish', params: { edit: p.id } })} className="!h-12 flex-1"><Pencil size={16} />编辑</Btn>
          {st === '已发布' && <Btn kind="secondary" onClick={() => setDown(true)} className="!h-12 flex-1">下架</Btn>}
          {st === '审核中' && <Btn kind="secondary" onClick={() => { updatePost(p.id, { status: '已下架' }); toast('已撤回，可修改后重新提交') }} className="!h-12 flex-1"><Undo2 size={16} />撤回</Btn>}
          {st === '已下架' || st === '已过期'
            ? <Btn onClick={() => { addPost({ ...p, status: '审核中', time: '刚刚' }); toast('已重新提交审核，通过后自动上架') }} className="flex-[1.4]"><RotateCcw size={16} />{st === '已过期' ? '重新发布' : '重新上架'}</Btn>
            : <Btn onClick={() => setShare(true)} className="flex-[1.4]"><Share2 size={16} />分享</Btn>}
        </BottomBar>
      ) : (
        <BottomBar>
          <button onClick={() => { toggleFav(p.id); toast(fav ? '已取消收藏' : '已收藏，可在「我的 · 收藏」查看') }} className={`flex w-11 shrink-0 flex-col items-center gap-0.5 text-[11px] ${fav ? 'text-danger' : 'text-muted'}`}><Heart size={21} className={fav ? 'fill-danger' : ''} />{fav ? '已收藏' : '收藏'}</button>
          <Btn kind="secondary" onClick={() => setMeet(name)} className="!h-12 flex-1"><CalendarPlus size={16} />约会议</Btn>
          <Btn disabled={responded} onClick={() => setRespond(true)} className="flex-[1.4]">{responded ? <><Check size={16} />已表达意向</> : <><Handshake size={17} />我有意向</>}</Btn>
        </BottomBar>
      )}

      {!owner && <RespondSheet open={respond} onClose={() => setRespond(false)} post={p} />}
      <MeetingSheet open={!!meet} onClose={() => setMeet(null)} withWho={meet ?? ''} postId={p.id} />
      <ShareSheet open={share} onClose={() => setShare(false)} post={p} />
      <Sheet open={menu} onClose={() => setMenu(false)} title="更多">
        {([[EyeOff, '不感兴趣，少推此类', () => { toast('已减少此类推荐'); back() }], [Link2, '复制链接', () => toast('链接已复制')], [Flag, '举报', () => setReport(true)]] as const).map(([I, t, fn]) => (
          <button key={t} onClick={() => { setMenu(false); fn() }} className={`flex w-full items-center gap-3 border-b border-line py-4 text-[15px] last:border-0 ${t === '举报' ? 'text-danger' : ''}`}><I size={18} />{t}</button>
        ))}
      </Sheet>
      <Confirm open={report} text="确定举报这条商机吗？平台将在 24 小时内核实处理。" okText="举报" onCancel={() => setReport(false)} onOk={() => { setReport(false); setReported(true); toast('已提交举报，感谢你维护社区') }} />
      <Confirm open={down} text="下架后其他企业将看不到这条供需，已收到的意向会保留。确定下架吗？" okText="下架" onCancel={() => setDown(false)} onOk={() => { updatePost(p.id, { status: '已下架' }); setDown(false); toast('已下架，可随时重新上架') }} />
    </div>
  )
}
