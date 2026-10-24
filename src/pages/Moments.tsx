import { useState } from 'react'
import { ChevronRight, Clock, EyeOff, Flag, Heart, MessageCircle, MoreHorizontal, PenLine, Send, Share2, Sparkles, Trash2, UserRound } from 'lucide-react'
import { Avatar, Btn, CertBadge, Confirm, Sheet, Tag, useStore } from '../ui'
import { agentCountries, aiAgents, humanAgents, type Moment } from '../data'
import { AgentMark } from './Agents'
import { MeetingSheet } from './Meetings'

type Kind = 'all' | Moment['kind']
const KINDS: [Kind, string][] = [['all', '全部'], ['peer', '同行'], ['ai', 'AI Agent'], ['human', '真人 Agent']]
const TOPICS = ['经验分享', '求助', '找合作', '拼柜拼仓']
/** Pending simulated reviews by moment id. Module-level so they outlive the page; deleting a post cancels its review. */
const reviews = new Map<string, ReturnType<typeof setTimeout>>()

/** 出海朋友圈: what peers, AI agents and human agents on the ground are seeing — a feed, not a directory. */
export default function Moments() {
  const { moments, setMoments, profile, cert, toast } = useStore()
  const [kind, setKind] = useState<Kind>('all')
  const [compose, setCompose] = useState(false)
  const [text, setText] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [places, setPlaces] = useState<string[]>([])
  // Sheet contents are keyed separately from their open flags so they stay filled while sliding closed.
  const [tid, setTid] = useState('')
  const [threadOpen, setThreadOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [menu, setMenu] = useState<Moment | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [report, setReport] = useState(false)
  const [del, setDel] = useState<string | null>(null)
  const [meet, setMeet] = useState('')
  const [meetOpen, setMeetOpen] = useState(false)
  const list = moments.filter((m) => !m.hidden && (kind === 'all' || m.kind === kind))
  const thread = moments.find((m) => m.id === tid)
  const patch = (id: string, fn: (m: Moment) => Moment) => setMoments((ms) => ms.map((m) => (m.id === id ? fn(m) : m)))
  const like = (id: string) => patch(id, (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))
  const openThread = (id: string) => { setTid(id); setReply(''); setThreadOpen(true) }
  const send = () => {
    if (!reply.trim()) return
    patch(tid, (x) => ({ ...x, comments: [...x.comments, { who: profile.name, text: reply.trim() }] }))
    setReply('')
  }
  const togglePlace = (c: string) => setPlaces((p) => (p.includes(c) ? p.filter((x) => x !== c) : p.length < 2 ? [...p, c] : p))
  const publish = () => {
    const id = `mm${Date.now()}`
    const post: Moment = { id, kind: 'peer', who: profile.name, logo: profile.name.slice(0, 1), role: `${profile.company.replace(/有限公司$/, '')} · ${profile.title}`, cert: cert === '已认证', text: text.trim(), tags: [...places, topic], time: '刚刚', likes: 0, comments: [], mine: true, pending: true }
    setMoments((ms) => [post, ...ms])
    setCompose(false); setText(''); setPlaces([]); setTopic(TOPICS[0]); setKind('all')
    toast('已提交，审核通过后同行可见')
    // Simulated moderation, like 商机 posts; it lives in the app store, so leaving the page does not cancel it.
    reviews.set(id, setTimeout(() => {
      reviews.delete(id)
      setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, pending: false } : m)))
      toast('你的朋友圈动态已通过审核')
    }, 4000))
  }
  const remove = (id: string) => {
    clearTimeout(reviews.get(id))
    reviews.delete(id)
    setMoments((ms) => ms.filter((m) => m.id !== id))
  }

  return (
    <div>
      <div className="px-4">
        <button onClick={() => setCompose(true)} className="flex w-full items-center gap-3 rounded-[20px] border border-white bg-white/80 p-3 text-left shadow-card backdrop-blur transition active:scale-[0.99]">
          <Avatar text={profile.name.slice(0, 1)} size={36} />
          <span className="min-w-0 flex-1 truncate text-[14px] text-subtle">分享见闻、向同行求助、找人拼柜…</span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white"><PenLine size={16} /></span>
        </button>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">{KINDS.map(([k, label]) => <Tag key={k} active={kind === k} onClick={() => setKind(k)}>{label}</Tag>)}</div>
      <div className="mt-3 space-y-3 px-4">
        {list.map((m) => <MomentCard key={m.id} m={m} onLike={() => like(m.id)} onThread={() => openThread(m.id)} onMore={() => { setMenu(m); setMenuOpen(true) }} onMeet={() => { setMeet(m.who); setMeetOpen(true) }} />)}
        {!list.length && <p className="py-12 text-center text-[13px] text-subtle">这里还没有动态</p>}
      </div>

      <Sheet open={compose} onClose={() => setCompose(false)} title="发朋友圈">
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="说说你在一线看到的：渠道变化、踩过的坑、想找的合作…" className="h-32 w-full resize-none rounded-2xl border border-line p-4 text-[15px] leading-[22px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
        <p className="mt-4 text-[13px] font-medium text-muted">话题</p>
        <div className="mt-2 flex flex-wrap gap-2">{TOPICS.map((t) => <Tag key={t} active={topic === t} onClick={() => setTopic(t)}>{t}</Tag>)}</div>
        <p className="mt-4 text-[13px] font-medium text-muted">相关国家 <span className="font-normal text-subtle">· 最多 2 个</span></p>
        <div className="mt-2 flex flex-wrap gap-2">{agentCountries.map((c) => <Tag key={c} active={places.includes(c)} onClick={() => togglePlace(c)}>{c}</Tag>)}</div>
        <p className="mt-4 text-[11px] leading-4 text-subtle">发布后经平台审核可见，请勿发布联系方式与广告。{cert === '已认证' ? '' : '完成企业认证后，动态会带「已认证」标识。'}</p>
        <Btn disabled={!text.trim()} onClick={publish} className="mt-4 w-full">发布</Btn>
      </Sheet>

      <Sheet open={threadOpen} onClose={() => setThreadOpen(false)} title={`评论 ${thread?.comments.length ?? 0}`}>
        {thread && (
          <>
            {thread.comments.length ? (
              <div className="space-y-3">
                {thread.comments.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    <Avatar text={c.who.slice(0, 1)} size={30} />
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-chip px-3 py-2"><p className="text-[12px] font-semibold">{c.who}</p><p className="mt-0.5 text-[14px] leading-5">{c.text}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="py-8 text-center text-[13px] text-subtle">还没有评论，来说第一句</p>}
            <div className="sticky bottom-0 -mx-5 mt-4 flex gap-2 border-t border-line/70 bg-white px-5 pt-3">
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={`回复 ${thread.who}…`} className="h-11 min-w-0 flex-1 rounded-full bg-chip px-4 text-[14px] outline-none focus:ring-4 focus:ring-brand/10" />
              <button onClick={send} disabled={!reply.trim()} aria-label="发送" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand to-brand-2 text-white transition disabled:opacity-40"><Send size={16} /></button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="更多">
        {menu?.mine ? (
          <button onClick={() => { setMenuOpen(false); setDel(menu.id) }} className="flex w-full items-center gap-3 py-4 text-[15px] text-danger"><Trash2 size={18} />删除这条动态</button>
        ) : (
          <>
            <button onClick={() => { if (menu) patch(menu.id, (x) => ({ ...x, hidden: true })); setMenuOpen(false); toast('已隐藏，会减少此类内容') }} className="flex w-full items-center gap-3 border-b border-line py-4 text-[15px]"><EyeOff size={18} />不感兴趣</button>
            <button onClick={() => { setMenuOpen(false); setReport(true) }} className="flex w-full items-center gap-3 py-4 text-[15px] text-danger"><Flag size={18} />举报</button>
          </>
        )}
      </Sheet>
      <Confirm open={report} text="确定举报这条动态吗？我们会在 24 小时内处理。" onCancel={() => setReport(false)} onOk={() => { setReport(false); toast('已提交举报，处理中') }} />
      <Confirm open={!!del} text="删除后不可恢复，确定删除这条动态吗？" okText="删除" onCancel={() => setDel(null)} onOk={() => { if (del) remove(del); setDel(null); toast('已删除') }} />
      <MeetingSheet open={meetOpen} onClose={() => setMeetOpen(false)} withWho={meet} />
    </div>
  )
}

function MomentCard({ m, onLike, onThread, onMore, onMeet }: { m: Moment; onLike: () => void; onThread: () => void; onMore: () => void; onMeet: () => void }) {
  const { push, toast } = useStore()
  const agent = m.kind === 'ai' ? aiAgents.find((a) => a.id === m.ref) : undefined
  const human = m.kind === 'human' ? humanAgents.find((h) => h.id === m.ref) : undefined
  const act = 'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] transition active:scale-95'
  return (
    <article className="rounded-[20px] border border-line/70 bg-white p-4 shadow-card">
      <header className="flex items-center gap-2.5">
        {agent ? <AgentMark a={agent} size={40} badge={false} /> : <Avatar src={human?.avatar} text={m.logo ?? m.who.slice(0, 1)} size={40} />}
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">{m.who}</span>
            {m.kind === 'ai' ? <span className="shrink-0 rounded-full bg-ai-soft px-1.5 text-[10px] font-semibold leading-[18px] text-ai-ink">AI Agent</span>
              : m.kind === 'human' ? <span className="shrink-0 rounded-full bg-brand-soft px-1.5 text-[10px] font-semibold leading-[18px] text-brand">真人 Agent</span>
              : m.cert && <CertBadge />}
          </div>
          <p className="mt-1 truncate text-[11px] text-subtle">{m.role} · {m.time}</p>
        </div>
        {m.kind === 'peer' && !m.mine && <button onClick={onMeet} className="h-7 shrink-0 rounded-full border border-line px-2.5 text-[12px] font-medium transition active:scale-95">约聊</button>}
        <button onClick={onMore} aria-label="更多" className="-mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-subtle hover:bg-chip"><MoreHorizontal size={16} /></button>
      </header>
      {m.pending && <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-accent-soft px-3 py-2 text-[12px] text-accent-ink"><Clock size={13} />审核中，通过后同行可见</p>}
      <p className="mt-3 whitespace-pre-line text-[15px] leading-[23px]">{m.text}</p>
      {m.image && <img src={m.image} alt={m.alt ?? ''} className="mt-3 aspect-[16/10] w-full rounded-2xl object-cover" />}
      {m.source && <p className="mt-2.5 flex items-center gap-1 text-[11px] text-ai-ink"><Sparkles size={12} />AI 整理 · 来源：{m.source}</p>}
      <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1">{m.tags.map((t) => <span key={t} className="text-[12px] font-medium text-brand">#{t}</span>)}</div>
      {agent && (
        <button onClick={() => push({ name: 'agent', params: { id: agent.id } })} className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-ai-soft px-3 py-2.5 text-left text-[13px] font-medium text-ai-ink transition active:scale-[0.99]">
          <Sparkles size={15} className="shrink-0" /><span className="min-w-0 flex-1 truncate">追问{agent.country} · {agent.industry} Agent</span><ChevronRight size={15} className="shrink-0 opacity-60" />
        </button>
      )}
      {human && (
        <button onClick={() => push({ name: 'human', params: human.id })} className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-brand-soft px-3 py-2.5 text-left text-[13px] font-medium text-brand transition active:scale-[0.99]">
          <UserRound size={15} className="shrink-0" /><span className="min-w-0 flex-1 truncate">预约 {human.name} 的现场服务</span><ChevronRight size={15} className="shrink-0 opacity-60" />
        </button>
      )}
      {m.comments.length > 0 && (
        <button onClick={onThread} className="mt-3 block w-full space-y-1 rounded-2xl bg-chip px-3 py-2.5 text-left text-[13px] leading-[19px]">
          {m.comments.slice(0, 2).map((c, i) => <p key={i} className="line-clamp-2"><b className="font-semibold">{c.who}</b>：{c.text}</p>)}
          {m.comments.length > 2 && <p className="text-[12px] text-muted">查看全部 {m.comments.length} 条评论</p>}
        </button>
      )}
      <div className="-mx-1 -mb-1.5 mt-3 flex border-t border-line/70 pt-1.5">
        <button onClick={onLike} aria-pressed={!!m.liked} className={`${act} ${m.liked ? 'font-semibold text-danger' : 'text-muted'}`}><Heart size={16} className={m.liked ? 'fill-danger' : ''} />{m.likes || '赞'}</button>
        <button onClick={onThread} className={`${act} text-muted`}><MessageCircle size={16} />{m.comments.length || '评论'}</button>
        <button onClick={() => toast('已生成分享卡片，可转发给微信好友')} className={`${act} text-muted`}><Share2 size={16} />分享</button>
      </div>
    </article>
  )
}
