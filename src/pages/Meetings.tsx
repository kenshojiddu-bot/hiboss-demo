import { useEffect, useState } from 'react'
import { CalendarDays, CalendarPlus, Check, CheckCircle2, ChevronRight, Clock, Copy, Loader2, MapPin, Phone, Plus, Sparkles, Video } from 'lucide-react'
import { Btn, Card, Confirm, Empty, Sheet, Tag, useStore } from '../ui'
import type { Meeting } from '../data'

const DAYS = ['11月10日 周二', '11月11日 周三', '11月12日 周四', '11月13日 周五', '11月16日 周一']
const SLOTS = ['10:00', '11:30', '14:00', '16:00', '19:30']
const MODES = [['视频会议', Video], ['电话', Phone], ['线下', MapPin]] as const
const modeIcon: Record<string, typeof Video> = { 视频会议: Video, 电话: Phone, 线下: MapPin }

/** Invite someone to a meeting. Shared by post details, publish results and the meetings panel. */
export function MeetingSheet({ open, onClose, withWho = '', postId, inPanel }: { open: boolean; onClose: () => void; withWho?: string; postId?: string; inPanel?: boolean }) {
  const { addMeeting, reset } = useStore()
  const [who, setWho] = useState(withWho)
  const [topic, setTopic] = useState('')
  const [day, setDay] = useState(DAYS[1])
  const [slot, setSlot] = useState(SLOTS[2])
  const [mode, setMode] = useState('视频会议')
  const [done, setDone] = useState(false)
  // The sheet stays mounted between uses, so start fresh for each new target.
  useEffect(() => { if (open) { setWho(withWho); setTopic(''); setDone(false) } }, [open, withWho])

  const submit = () => {
    const w = who.trim()
    addMeeting({ id: `m${Date.now()}`, title: topic.trim() || `与 ${w} 的合作洽谈`, time: `${day} ${slot}`, with: w, mode, status: '待确认', by: 'me', postId })
    setDone(true)
  }

  return (
    <Sheet open={open} onClose={onClose} title={done ? '' : '约一场会议'}>
      {done ? (
        <div className="flex flex-col items-center pb-2 text-center">
          <div className="grid h-16 w-16 animate-[pop_.4s_ease-out] place-items-center rounded-full bg-success-soft text-success"><CheckCircle2 size={34} /></div>
          <p className="mt-4 text-[18px] font-bold">邀约已发送</p>
          <p className="mt-1 text-[13px] leading-5 text-muted">{day} {slot} · {mode}<br />{who} 确认后会第一时间通知你</p>
          <div className="mt-6 flex w-full gap-2">
            {!inPanel && <Btn kind="secondary" onClick={() => { onClose(); reset([{ name: 'biz', params: 'meet' }]) }} className="!h-12 flex-1">查看会议</Btn>}
            <Btn onClick={onClose} className="flex-1">好的</Btn>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <label className="block">
            <span className="text-[13px] font-medium text-muted">会议对象</span>
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="公司或联系人" className="mt-1.5 h-12 w-full rounded-2xl border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-muted">会议主题<span className="text-subtle">（选填）</span></span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={who ? `与 ${who} 的合作洽谈` : '例如：样品与报价沟通'} className="mt-1.5 h-12 w-full rounded-2xl border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
          </label>
          <div>
            <p className="text-[13px] font-medium text-muted">日期</p>
            <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">{DAYS.map((d) => <Tag key={d} active={day === d} onClick={() => setDay(d)}>{d}</Tag>)}</div>
          </div>
          <div>
            <p className="text-[13px] font-medium text-muted">时间</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">{SLOTS.map((s) => <button key={s} onClick={() => setSlot(s)} className={`h-9 rounded-full font-display text-[13px] transition ${slot === s ? 'bg-ink font-semibold text-white' : 'border border-line bg-white'}`}>{s}</button>)}</div>
          </div>
          <div>
            <p className="text-[13px] font-medium text-muted">方式</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {MODES.map(([m, I]) => (
                <button key={m} onClick={() => setMode(m)} className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[14px] transition ${mode === m ? 'bg-ink font-semibold text-white' : 'border border-line bg-white'}`}><I size={16} />{m}</button>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-1.5 rounded-2xl bg-ai-soft px-3.5 py-2.5 text-[12px] text-ai-ink"><Sparkles size={13} className="shrink-0 text-ai" />会议结束后，分身会自动生成纪要与待办</p>
          <Btn disabled={!who.trim()} onClick={submit} className="w-full">发送邀约</Btn>
        </div>
      )}
    </Sheet>
  )
}

type Filter = '全部' | Meeting['status']
const ORDER: Record<Meeting['status'], number> = { 待确认: 0, 已确认: 1, 已完成: 2, 已取消: 3 }
const statusCls: Record<Meeting['status'], string> = { 待确认: 'bg-accent-soft text-accent-ink', 已确认: 'bg-brand-soft text-brand', 已完成: 'bg-success-soft text-success', 已取消: 'bg-chip text-subtle' }
const pill = 'flex h-9 flex-1 items-center justify-center gap-1 rounded-full text-[13px] font-medium transition active:scale-[0.98]'

/** Upcoming and past meetings with confirm, cancel, calendar and AI-minutes actions. */
export function MeetingsPanel() {
  const { meetings, posts, updateMeeting, push, toast } = useStore()
  const [f, setF] = useState<Filter>('全部')
  const [cancel, setCancel] = useState<Meeting | null>(null)
  const [notes, setNotes] = useState<Meeting | null>(null)
  const [create, setCreate] = useState<{ who?: string; postId?: string } | null>(null)
  const [gen, setGen] = useState<string | null>(null)
  const [done, setDone] = useState<string[]>([])
  const list = meetings.filter((m) => f === '全部' || m.status === f).sort((a, b) => ORDER[a.status] - ORDER[b.status])
  const count = (s: Meeting['status']) => meetings.filter((m) => m.status === s).length
  const next = meetings.find((m) => m.status === '已确认') ?? meetings.find((m) => m.status === '待确认')
  const minutesOf = (id: string) => meetings.find((m) => m.id === id)?.minutes

  const genMinutes = (m: Meeting) => {
    setGen(m.id)
    setTimeout(() => {
      updateMeeting(m.id, { minutes: { summary: `与 ${m.with} 确认了合作方向，双方同意两周内推进样品与报价。`, points: ['确认首批合作品类与规模', '对方重点关注交期与认证资质', '约定下周再做一次细节沟通'], todos: ['3 个工作日内发送报价单', '准备样品与资质文件', '同步内部负责人'] } })
      setGen(null)
      toast('AI 纪要已生成')
    }, 1400)
  }

  return (
    <>
      <div className="sticky top-[88px] z-20 mt-2 flex items-center gap-2 bg-canvas/85 py-2.5 pl-4 backdrop-blur-xl">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {(['全部', '待确认', '已确认', '已完成', '已取消'] as Filter[]).map((s) => <Tag key={s} active={f === s} onClick={() => setF(s)}>{s}{s !== '全部' && count(s) > 0 && <span className="ml-1 font-display opacity-60">{count(s)}</span>}</Tag>)}
        </div>
        <button onClick={() => setCreate({})} className="mr-4 flex h-8 shrink-0 items-center gap-1 rounded-full bg-ink px-3 text-[13px] font-medium text-white"><Plus size={14} />约会议</button>
      </div>

      <div className="space-y-3 px-4 pt-1">
        {next && f === '全部' && (
          <div className="relative overflow-hidden rounded-[22px] bg-ink p-4 text-white">
            <div aria-hidden className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-linear-to-br from-ai to-brand opacity-50 blur-2xl" />
            <p className="relative flex items-center gap-1.5 text-[12px] text-white/60"><Sparkles size={13} />下一场会议</p>
            <p className="relative mt-1.5 text-[16px] font-semibold leading-[22px]">{next.title}</p>
            <p className="relative mt-1 font-display text-[13px] text-white/70">{next.time} · {next.mode}</p>
            <p className="relative mt-3 rounded-xl bg-white/10 px-3 py-2 text-[12px] leading-[18px] text-white/85">分身已整理好 {next.with} 的背景资料和 3 个建议提问，会前 30 分钟推送给你</p>
          </div>
        )}

        {!list.length ? (
          <Card><Empty icon={<CalendarDays size={26} />} text={f === '全部' ? '还没有会议，从感兴趣的商机发起一场吧' : `没有「${f}」的会议`} action="约一场会议" onAction={() => setCreate({})} /></Card>
        ) : list.map((m) => {
          const md = m.time.match(/(\d+)月(\d+)日\s*(周.)?/)
          const hm = m.time.match(/\d{1,2}:\d{2}/)?.[0]
          const I = modeIcon[m.mode] ?? Video
          const post = m.postId ? posts.find((p) => p.id === m.postId) : undefined
          return (
            <Card key={m.id} className={`!p-0 overflow-hidden ${m.status === '已取消' ? 'opacity-70' : ''}`}>
              <div className="flex gap-3 p-4">
                <div className={`flex w-[54px] shrink-0 flex-col items-center justify-center rounded-2xl py-2 ${m.status === '已确认' ? 'bg-linear-to-b from-brand to-brand-2 text-white' : 'bg-chip'}`}>
                  <span className="text-[11px] opacity-70">{md?.[1] ?? '—'}月</span>
                  <span className="font-display text-[22px] font-bold leading-6">{md?.[2] ?? '—'}</span>
                  <span className="text-[10px] opacity-70">{md?.[3] ?? ''}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls[m.status]}`}>{m.status}</span>
                    {m.status === '待确认' && <span className="text-[11px] text-subtle">{m.by === 'them' ? '对方邀请你' : '等待对方确认'}</span>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-[21px]">{m.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                    {hm && <span className="flex items-center gap-1 font-display"><Clock size={12} />{hm}</span>}
                    <span className="flex items-center gap-1"><I size={12} />{m.mode}</span>
                    <span className="truncate">与 {m.with}</span>
                  </div>
                  {post && <button onClick={() => push({ name: 'bizDetail', params: post.id })} className="mt-2 inline-flex max-w-full items-center gap-0.5 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand"><span className="truncate">关联商机 · {post.company}</span><ChevronRight size={11} className="shrink-0" /></button>}
                </div>
              </div>
              <div className="flex gap-2 border-t border-line/70 px-4 py-3">
                {m.status === '待确认' && m.by === 'them' && <>
                  <button onClick={() => { updateMeeting(m.id, { status: '已取消' }); toast('已婉拒，对方会收到通知') }} className={`${pill} border border-line bg-white`}>婉拒</button>
                  <button onClick={() => { updateMeeting(m.id, { status: '已确认' }); toast('已接受，会议已加入日程') }} className={`${pill} bg-ink text-white`}><Check size={14} />接受邀约</button>
                </>}
                {m.status === '待确认' && m.by !== 'them' && <>
                  <button onClick={() => setCancel(m)} className={`${pill} border border-line bg-white text-danger`}>取消邀约</button>
                  <button onClick={() => toast(`已提醒 ${m.with} 尽快确认`)} className={`${pill} border border-line bg-white`}>提醒对方</button>
                </>}
                {m.status === '已确认' && <>
                  <button onClick={() => setCancel(m)} className={`${pill} border border-line bg-white text-danger`}>取消</button>
                  <button onClick={() => toast('已添加到系统日历，会前 15 分钟提醒')} className={`${pill} border border-line bg-white`}><CalendarPlus size={14} />加入日历</button>
                  {m.mode === '视频会议' && <button onClick={() => toast('会议室将在开始前 10 分钟开放')} className={`${pill} bg-ink text-white`}><Video size={14} />进入</button>}
                </>}
                {m.status === '已完成' && (m.minutes ? (
                  <button onClick={() => setNotes(m)} className={`${pill} bg-linear-to-r from-ai to-brand text-white`}><Sparkles size={14} />查看 AI 纪要</button>
                ) : (
                  <button disabled={gen === m.id} onClick={() => genMinutes(m)} className={`${pill} bg-ai-soft text-ai-ink`}>{gen === m.id ? <><Loader2 size={14} className="animate-spin" />分身整理中…</> : <><Sparkles size={14} />生成 AI 纪要</>}</button>
                ))}
                {m.status === '已取消' && <button onClick={() => setCreate({ who: m.with, postId: m.postId })} className={`${pill} border border-line bg-white`}>重新预约</button>}
              </div>
            </Card>
          )
        })}
      </div>

      <Confirm open={!!cancel} text={`确定取消与 ${cancel?.with ?? ''} 的会议吗？对方会收到通知。`} okText="取消会议" onCancel={() => setCancel(null)} onOk={() => { if (cancel) updateMeeting(cancel.id, { status: '已取消' }); setCancel(null); toast('会议已取消') }} />
      <MeetingSheet open={!!create} onClose={() => setCreate(null)} withWho={create?.who} postId={create?.postId} inPanel />
      <Sheet open={!!notes} onClose={() => setNotes(null)} title="AI 会议纪要">
        {notes && (() => {
          const mi = minutesOf(notes.id)
          if (!mi) return null
          return (
            <div className="pb-1">
              <p className="text-[13px] text-muted">{notes.title} · {notes.time}</p>
              <div className="mt-3 rounded-2xl border border-ai/15 bg-linear-to-br from-ai-soft to-white p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ai-ink"><Sparkles size={13} className="text-ai" />一句话总结</p>
                <p className="mt-1.5 text-[15px] font-medium leading-[23px]">{mi.summary}</p>
              </div>
              <p className="mt-5 text-[14px] font-bold">关键结论</p>
              <ul className="mt-2 space-y-2">{mi.points.map((p) => <li key={p} className="flex gap-2 text-[14px] leading-[21px]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai" />{p}</li>)}</ul>
              <p className="mt-5 text-[14px] font-bold">待办</p>
              <div className="mt-2 space-y-2">
                {mi.todos.map((t) => {
                  const k = `${notes.id}-${t}`
                  const on = done.includes(k)
                  return (
                    <button key={t} onClick={() => setDone(on ? done.filter((x) => x !== k) : [...done, k])} className="flex w-full items-center gap-2.5 rounded-2xl bg-chip px-3.5 py-3 text-left text-[14px]">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${on ? 'border-success bg-success text-white' : 'border-line bg-white'}`}>{on && <Check size={12} strokeWidth={3} />}</span>
                      <span className={on ? 'text-subtle line-through' : ''}>{t}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex gap-2">
                <Btn kind="secondary" onClick={() => toast('纪要已复制')} className="!h-12 flex-1"><Copy size={15} />复制纪要</Btn>
                <Btn onClick={() => { setNotes(null); toast('待办已同步到日历') }} className="flex-1"><CalendarPlus size={16} />同步待办</Btn>
              </div>
            </div>
          )
        })()}
      </Sheet>
    </>
  )
}
