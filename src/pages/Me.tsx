import { useState, type ReactNode } from 'react'
import { ArrowRight, Bell, CalendarClock, CalendarDays, CheckCircle2, ChevronRight, Clock, FileText, Handshake, Headphones, Heart, Info, Lock, MessageCircle, MessageSquareText, Palette, Pencil, Plus, Rss, ShieldCheck, Sparkles, Ticket, TrendingUp, Upload, X, XCircle } from 'lucide-react'
import { Aurora, Avatar, BottomBar, Btn, Card, CertBadge, Confirm, Empty, Field, NavBar, Radar, Section, Sheet, Switch, Tag, useStore, type AppTheme, type CertState } from '../ui'
import { events, messages as initMsgs, providers, radar } from '../data'

type Icon = typeof Ticket

const THEME_OPTIONS: { id: AppTheme; name: string; note: string; swatches: string[] }[] = [
  { id: 'apple', name: '苹果简洁', note: '清晰留白', swatches: ['#f7f9fc', '#3478f6', '#1e293b'] },
  { id: 'editorial', name: '商务杂志', note: '纸张与陶土红', swatches: ['#f7f1e8', '#b5543b', '#332b2a'] },
  { id: 'dark', name: '深色工作台', note: '专注与高对比', swatches: ['#0b1220', '#54d6bf', '#dce7f5'] },
  { id: 'bento', name: '清新 Bento', note: '薄荷与模块', swatches: ['#f1f8f5', '#179b75', '#173b32'] },
  { id: 'swiss', name: '瑞士国际主义', note: '黑白与红色', swatches: ['#fafafa', '#e21c2a', '#111111'] },
  { id: 'warm', name: '温暖人文', note: '杏桃与暖灰', swatches: ['#fff5ed', '#c65a3d', '#4b3029'] },
  { id: 'premium', name: '精致金融', note: '藏蓝与香槟金', swatches: ['#f3f5f7', '#bd9756', '#11233f'] },
  { id: 'soft', name: '柔和 Soft UI', note: '雾蓝与柔和阴影', swatches: ['#e9eef6', '#6d7fe8', '#35405d'] },
]

export default function Me() {
  const { push, reset, cert, profile, registered, favs, leads, posts, meetings, theme, setTheme, toast } = useStore()
  const [themeOpen, setThemeOpen] = useState(false)
  const myPosts = posts.filter((p) => p.mine)
  const pending = myPosts.filter((p) => p.status === '审核中').length
  const upcoming = meetings.filter((m) => m.status === '待确认' || m.status === '已确认').length
  const certState = cert === '未通过' ? '未认证' : cert
  const toBiz = (seg: 'mine' | 'meet') => reset([{ name: 'biz', params: seg }])
  const count = (n: number) => (n ? <span className="font-display text-[13px] text-subtle">{n}</span> : null)

  const stats: [number, string, () => void][] = [
    [registered.length, '报名', () => push({ name: 'myEvents' })],
    [myPosts.length, '发布', () => toBiz('mine')],
    [upcoming, '会议', () => toBiz('meet')],
    [favs.length, '收藏', () => push({ name: 'myFavs' })],
  ]
  const rows: [Icon, string, () => void, ReactNode?][] = [
    [Handshake, '我的发布', () => toBiz('mine'), pending ? <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">{pending} 条审核中</span> : count(myPosts.length)],
    [CalendarClock, '我的会议', () => toBiz('meet'), upcoming ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">{upcoming} 场待参加</span> : null],
    [Ticket, '我的报名', () => push({ name: 'myEvents' }), count(registered.length)],
    [Heart, '我的收藏', () => push({ name: 'myFavs' }), count(favs.length)],
    [MessageSquareText, '我的留资', () => push({ name: 'myLeads' }), count(leads.length)],
    [Rss, '信息源管理', () => push({ name: 'sources' })],
    [Palette, '主题风格', () => setThemeOpen(true), <span className="text-[13px] text-muted">{THEME_OPTIONS.find((x) => x.id === theme)?.name}</span>],
    [ShieldCheck, '企业认证', () => push({ name: 'cert' }), <CertBadge state={certState} />],
    [Bell, '消息设置', () => push({ name: 'messages' })],
  ]
  const docs: [Icon, string, string][] = [[Info, '关于海老板', 'doc'], [FileText, '用户协议', 'doc'], [Lock, '隐私政策', 'doc'], [MessageCircle, '意见反馈', 'feedback'], [Headphones, '客服', 'doc']]

  return (
    <div className="relative">
      <Aurora />
      <div className="relative px-4 pt-[72px]">
        <div onClick={() => push({ name: 'myPortrait' })} className="flex cursor-pointer items-center gap-3.5">
          <Avatar src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=70" text={profile.name} size={64} className="border-4 border-white shadow-card" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5"><span className="truncate text-[22px] font-bold tracking-tight">{profile.name}</span><CertBadge state={certState} /></div>
            <p className="mt-0.5 truncate text-[13px] text-muted">{profile.title} · {profile.company}</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-subtle" />
        </div>

        <button onClick={() => push({ name: 'myPortrait' })} className="relative mt-5 flex w-full items-center overflow-hidden rounded-[24px] bg-ink p-5 text-left text-white">
          <div aria-hidden className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-brand to-brand-2 opacity-50 blur-2xl" />
          <div className="relative">
            <div className="text-[12px] text-white/60">出海画像综合分</div>
            <div className="mt-1 flex items-end gap-2"><span className="font-display text-[40px] font-bold leading-none">66</span><span className="mb-1 flex items-center gap-0.5 text-[12px] font-medium text-success"><TrendingUp size={13} />本月 +3</span></div>
          </div>
          <div className="relative ml-auto text-right">
            <div className="text-[12px] text-white/60">最大短板</div>
            <div className="mt-1 text-[15px] font-semibold">本地化运营人才</div>
            <div className="mt-2 inline-flex items-center gap-0.5 text-[12px] text-white/70">查看画像<ChevronRight size={13} /></div>
          </div>
        </button>

        <div className="mt-3 grid grid-cols-4 rounded-[22px] border border-line/70 bg-white py-3.5 shadow-card">
          {stats.map(([n, t, fn]) => (
            <button key={t} onClick={fn} className="flex flex-col items-center">
              <span className="font-display text-[22px] font-bold leading-7">{n}</span>
              <span className="text-[12px] text-muted">{t}</span>
            </button>
          ))}
        </div>

        <button onClick={() => push({ name: 'publish' })} className="relative mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[22px] bg-linear-to-r from-brand to-brand-2 p-4 text-left text-white shadow-[0_14px_30px_-16px_var(--color-brand)] transition active:scale-[0.99]">
          <div aria-hidden className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20"><Plus size={22} /></span>
          <div className="relative min-w-0 flex-1">
            <div className="text-[15px] font-semibold">发布供需</div>
            <div className="truncate text-[12px] text-white/80">说说能做什么、需要什么，分身替你找对的人</div>
          </div>
          <ArrowRight size={18} className="relative shrink-0" />
        </button>
      </div>

      <div className="mx-4 mt-3 overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card">
        {rows.map(([I, t, fn, extra]) => (
          <button key={t} onClick={fn} className="flex w-full items-center gap-3 border-b border-line/70 px-4 py-3 text-[15px] last:border-0 active:bg-chip">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><I size={18} /></span>
            {t}
            <span className="ml-auto flex items-center gap-1.5">{extra}<ChevronRight size={16} className="text-subtle" /></span>
          </button>
        ))}
      </div>

      <div className="mx-4 mt-3 overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card">
        {docs.map(([I, t, r]) => (
          <button key={t} onClick={() => push({ name: r, params: t })} className="flex w-full items-center gap-3 border-b border-line/70 px-4 py-3.5 text-[15px] last:border-0 active:bg-chip">
            <I size={18} className="text-muted" />{t}<ChevronRight size={16} className="ml-auto text-subtle" />
          </button>
        ))}
      </div>
      <button onClick={() => reset([{ name: 'login' }])} className="mx-auto mt-6 block text-[13px] text-subtle">退出登录 / 重新体验建档</button>
      <p className="mt-2 text-center font-display text-[11px] text-subtle">HIBOSS 海老板 V1.0</p>

      <Sheet open={themeOpen} onClose={() => setThemeOpen(false)} title="主题风格">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {THEME_OPTIONS.map((option) => {
            const active = option.id === theme
            return (
              <button
                key={option.id}
                onClick={() => { setTheme(option.id); setThemeOpen(false); toast(`已切换为${option.name}`) }}
                className={`relative overflow-hidden rounded-[18px] border p-3 text-left transition active:scale-[0.98] ${active ? 'border-brand ring-2 ring-brand/15' : 'border-line'}`}
              >
                <div className="mb-3 flex h-12 items-end gap-1 rounded-xl p-2" style={{ background: option.swatches[0] }}>
                  <span className="h-6 w-1/2 rounded-md" style={{ background: option.swatches[1] }} />
                  <span className="h-4 flex-1 rounded-md" style={{ background: option.swatches[2] }} />
                </div>
                <p className="text-[14px] font-semibold">{option.name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{option.note}</p>
                {active && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">✓</span>}
              </button>
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}

export function MyPortrait() {
  const { profile, setProfile, toast, push } = useStore()
  const [mem, setMem] = useState(['主攻印尼市场', '关注清真认证', '海外团队 3 人', '已有雅加达本地仓', '明年计划进入沙特'])
  const [del, setDel] = useState<string | null>(null)
  const [edit, setEdit] = useState<string | null>(null)
  const [val, setVal] = useState('')
  const [fix, setFix] = useState(false)
  const [fixText, setFixText] = useState('')
  const [extra, setExtra] = useState<Record<string, string>>({ 行业: '家居 · 美妆个护', 规模: '101–500 人', 已出海状态: '是' })
  const fields: [string, string][] = [['行业', extra['行业']], ['规模', extra['规模']], ['已出海状态', extra['已出海状态']], ['关注国别', profile.countries.join('、')], ['关注议题', profile.topics.join('、')], ['当前阶段', profile.stage]]
  const save = () => {
    const v = val.trim()
    if (!v || !edit) return
    const list = v.split(/[、,，\s]+/).filter(Boolean)
    if (edit === '关注国别') setProfile({ ...profile, countries: list })
    else if (edit === '关注议题') setProfile({ ...profile, topics: list })
    else if (edit === '当前阶段') setProfile({ ...profile, stage: v })
    else setExtra({ ...extra, [edit]: v })
    setEdit(null)
    toast('已更新，明天的日报会按新画像推送')
  }

  return (
    <div className="min-h-full pb-12">
      <NavBar title="我的画像" />
      <div className="px-4 pt-2">
        <div className="relative overflow-hidden rounded-[24px] border border-line/70 bg-white p-4 shadow-card">
          <Aurora className="h-40 opacity-60" />
          <div className="relative flex items-center justify-between">
            <h2 className="text-[17px] font-bold">出海画像</h2>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success-soft px-2 py-0.5 text-[12px] font-semibold text-success"><TrendingUp size={12} />较上周 +3</span>
          </div>
          <div className="relative"><Radar {...radar} size={300} /></div>
          <div className="relative mt-1 grid grid-cols-2 gap-2">
            {radar.axes.map((a, i) => (
              <div key={a} className="rounded-2xl bg-chip p-2.5">
                <div className="flex justify-between text-[11px]"><span className="text-muted">{a}</span><b className="font-display text-brand">{radar.values[i]}</b></div>
                <p className="mt-0.5 text-[11px] leading-4">{radar.notes[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section title="画像字段">
        <div className="mx-4 overflow-hidden rounded-[20px] border border-line/70 bg-white shadow-card">
          {fields.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
              <span className="w-20 shrink-0 text-[13px] text-muted">{k}</span>
              <span className="min-w-0 flex-1 truncate text-[15px]">{v}</span>
              <button onClick={() => { setEdit(k); setVal(v) }} className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-brand"><Pencil size={12} />修改</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`分身记得的 ${mem.length} 件事`}>
        {mem.length ? (
          <div className="mx-4 flex flex-wrap gap-2">
            {mem.map((m) => (
              <span key={m} className="flex h-9 items-center gap-1 rounded-full border border-line bg-white pl-3.5 pr-2 text-[13px]">
                {m}<button onClick={() => setDel(m)} aria-label={`删除${m}`} className="grid h-5 w-5 place-items-center rounded-full text-subtle hover:bg-chip"><X size={13} /></button>
              </span>
            ))}
          </div>
        ) : <p className="mx-4 text-[13px] text-muted">分身暂时没有记住的事，多和它聊聊吧</p>}
        <button onClick={() => setFix(true)} className="mx-4 mt-4 flex items-center gap-1 text-[13px] font-medium text-ai"><Sparkles size={13} />哪条记错了？告诉分身<ChevronRight size={14} /></button>
      </Section>

      <div className="px-4 pt-7"><Btn kind="secondary" onClick={() => push({ name: 'onboard' })} className="!h-12 w-full">重新建档</Btn></div>

      <Confirm open={!!del} text={`删除记忆「${del}」后，分身将不再据此推荐，确定吗？`} okText="删除" onCancel={() => setDel(null)} onOk={() => { setMem(mem.filter((x) => x !== del)); setDel(null); toast('已删除') }} />
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={`修改${edit ?? ''}`}>
        <input value={val} onChange={(e) => setVal(e.target.value)} className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" />
        {(edit === '关注国别' || edit === '关注议题') && <p className="mt-2 text-[11px] text-subtle">多个用「、」分隔</p>}
        <Btn disabled={!val.trim()} onClick={save} className="mt-4 w-full">保存</Btn>
      </Sheet>
      <Sheet open={fix} onClose={() => setFix(false)} title="纠正分身">
        <textarea value={fixText} onChange={(e) => setFixText(e.target.value)} placeholder="例如：我们不做美妆了，只做家居" className="h-28 w-full resize-none rounded-2xl border border-line bg-white p-4 text-[15px] outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/10" />
        <Btn disabled={!fixText.trim()} onClick={() => { setFix(false); setFixText(''); toast('谢谢，分身已更新记忆') }} className="mt-4 w-full">提交</Btn>
      </Sheet>
    </div>
  )
}

const CERT_STATUS: Record<Exclude<CertState, '未认证'>, [Icon, string, string, string]> = {
  审核中: [Clock, 'bg-accent-soft text-accent', '审核中', '预计 1–2 个工作日完成，结果会通过消息通知你'],
  已认证: [CheckCircle2, 'bg-success-soft text-success', '认证已通过', '你已解锁完整资源、真人 Agent 预约与认证活动'],
  未通过: [XCircle, 'bg-danger-soft text-danger', '审核未通过', '原因：营业执照照片模糊，无法识别统一社会信用代码。请重新拍摄清晰完整的照片。'],
}
const PERKS = ['查看服务商联系方式', '预约真人 Agent', '报名认证活动']

export function Cert() {
  const { cert, setCert, profile, toast } = useStore()
  const [f, setF] = useState({ company: profile.company, code: '', contact: profile.name, title: profile.title })
  const [lic, setLic] = useState(false)
  const [view, setView] = useState<'form' | 'status'>(cert === '未认证' ? 'form' : 'status')
  const codeErr = f.code && f.code.length !== 18 ? '统一社会信用代码为 18 位' : undefined
  const ready = f.company.trim() && f.code.length === 18 && lic && f.contact.trim() && f.title.trim()
  const submit = () => { setCert('审核中'); setView('status'); toast('已提交，预计 1–2 个工作日完成审核') }

  if (view === 'status' && cert !== '未认证') {
    const [I, cls, t, d] = CERT_STATUS[cert]
    return (
      <div className="min-h-full pb-12">
        <NavBar title="企业认证" />
        <div className="flex flex-col items-center px-6 pt-10 text-center">
          <div key={cert} className={`grid h-20 w-20 animate-[pop_.4s_ease-out] place-items-center rounded-full ${cls}`}><I size={40} /></div>
          <h1 className="mt-5 text-[22px] font-bold tracking-tight">{t}</h1>
          <p className="mt-2 text-[14px] leading-[22px] text-muted">{d}</p>
          <div className="mt-6 w-full rounded-[20px] border border-line/70 bg-white p-4 text-left text-[13px] shadow-card">
            {[['企业名称', f.company], ['联系人', `${f.contact} · ${f.title}`], ['提交时间', '2026-11-09 10:24']].map(([a, b]) => (
              <div key={a} className="flex justify-between gap-4 py-1.5"><span className="shrink-0 text-muted">{a}</span><span className="truncate">{b}</span></div>
            ))}
          </div>
          {cert === '已认证' && <div className="mt-3 grid w-full grid-cols-3 gap-2">{PERKS.map((p) => <div key={p} className="rounded-2xl bg-success-soft px-1.5 py-2.5 text-[12px] leading-4 text-success">{p}</div>)}</div>}
          {cert === '未通过' && <Btn onClick={() => setView('form')} className="mt-6 w-full">重新提交</Btn>}
        </div>
        <div className="mx-4 mt-10 rounded-[20px] border border-dashed border-subtle/60 p-3.5">
          <p className="mb-2 text-[11px] text-subtle">演示：切换审核结果</p>
          <div className="flex gap-2">{(['审核中', '已认证', '未通过'] as const).map((s) => <Tag key={s} active={cert === s} onClick={() => setCert(s)}>{s}</Tag>)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-36">
      <NavBar title="企业认证" />
      <div className="px-4 pt-2">
        <div className="relative overflow-hidden rounded-[24px] bg-ink p-5 text-white">
          <div aria-hidden className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-linear-to-br from-brand to-brand-2 opacity-50 blur-2xl" />
          <div className="relative flex items-center gap-1.5 text-[12px] text-white/70"><ShieldCheck size={16} className="text-brand-2" />企业认证 · 1–2 个工作日</div>
          <p className="relative mt-2 text-[18px] font-bold leading-[26px]">认证后可以看到完整资源、报名认证活动</p>
          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-[12px] leading-4">{PERKS.map((t) => <div key={t} className="rounded-xl bg-white/10 px-1.5 py-2.5">{t}</div>)}</div>
        </div>
        <div className="mt-3 space-y-4 rounded-[20px] border border-line/70 bg-white p-4 shadow-card">
          <Field required label="企业名称" value={f.company} onChange={(v) => setF({ ...f, company: v })} />
          <Field required label="统一社会信用代码" value={f.code} onChange={(v) => setF({ ...f, code: v.toUpperCase() })} placeholder="18 位代码" error={codeErr} />
          <div>
            <span className="text-[13px] font-medium text-muted">营业执照<span className="text-danger"> *</span></span>
            <button onClick={() => setLic(true)} className={`mt-1.5 flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl text-[13px] transition ${lic ? 'bg-success-soft text-success' : 'border border-dashed border-subtle/70 bg-chip/50 text-muted'}`}>
              {lic ? <><CheckCircle2 size={22} />已上传 营业执照.jpg</> : <><Upload size={22} />拍照或上传</>}
            </button>
          </div>
          <Field required label="联系人" value={f.contact} onChange={(v) => setF({ ...f, contact: v })} />
          <Field required label="职位" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
        </div>
        <p className="mt-2 text-center text-[11px] text-subtle">演示：可输入 18 位代码 91440300MA5XXXXXX1</p>
      </div>
      <BottomBar><Btn disabled={!ready} onClick={submit} className="flex-1">提交认证</Btn></BottomBar>
    </div>
  )
}

const MSG_STYLE: Record<string, [Icon, string]> = {
  商机: [Handshake, 'bg-ai-soft text-ai'],
  活动: [CalendarDays, 'bg-accent-soft text-accent-ink'],
  审核: [ShieldCheck, 'bg-brand-soft text-brand'],
  日报: [Rss, 'bg-success-soft text-success'],
}
const msgTarget = (cat: string) =>
  cat === '商机' ? { name: 'bizDetail', params: 'my1' } : cat === '活动' ? { name: 'event', params: 'e1' } : cat === '审核' ? { name: 'cert' } : { name: 'daily', params: 'd1' }

export function Messages() {
  const { push, toast } = useStore()
  const [list, setList] = useState(initMsgs)
  const [cat, setCat] = useState('全部')
  const [sub, setSub] = useState(false)
  const shown = list.filter((m) => cat === '全部' || m.cat === cat)
  const unread = list.filter((m) => m.unread).length
  const go = (m: (typeof list)[number]) => { setList(list.map((x) => (x.id === m.id ? { ...x, unread: false } : x))); push(msgTarget(m.cat)) }
  const subscribe = (v: boolean) => { setSub(v); toast(v ? '授权成功，明早 8:00 推送日报' : '已关闭提醒') }

  return (
    <div className="min-h-full pb-12">
      <NavBar title="消息" right={<button disabled={!unread} onClick={() => { setList(list.map((m) => ({ ...m, unread: false }))); toast('已全部标为已读') }} className="text-[13px] text-muted disabled:text-subtle">全部已读</button>} />
      <div className="px-4 pt-2">
        <div className="flex items-center gap-3 rounded-[20px] border border-accent/20 bg-accent-soft p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-accent"><Bell size={20} /></span>
          <div className="min-w-0 flex-1"><p className="text-[15px] font-semibold">开启日报与活动提醒</p><p className="mt-0.5 text-[11px] leading-4 text-accent-ink">授权后明早 8:00 把日报推给你，只推一条</p></div>
          <Switch on={sub} onChange={subscribe} />
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {['全部', '商机', '活动', '审核', '日报'].map((t) => <Tag key={t} active={cat === t} onClick={() => setCat(t)}>{t}{t === '全部' && unread > 0 && <span className="ml-1 font-display">{unread}</span>}</Tag>)}
        </div>
      </div>
      {!shown.length ? <Empty icon={<Bell />} text="这个分类还没有消息" action={sub ? undefined : '去开启提醒'} onAction={() => subscribe(true)} /> : (
        <div className="mx-4 mt-3 overflow-hidden rounded-[20px] border border-line/70 bg-white shadow-card">
          {shown.map((m) => {
            const [I, cls] = MSG_STYLE[m.cat] ?? MSG_STYLE['日报']
            return (
              <button key={m.id} onClick={() => go(m)} className="flex w-full gap-3 border-b border-line/70 px-4 py-3.5 text-left last:border-0 active:bg-chip">
                <span className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cls}`}><I size={19} />{m.unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className={`truncate text-[15px] ${m.unread ? 'font-semibold' : ''}`}>{m.title}</span><span className="shrink-0 font-display text-[11px] text-subtle">{m.time}</span></div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-[19px] text-muted">{m.body}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function MyList({ kind }: { kind: 'myEvents' | 'myFavs' | 'myLeads' }) {
  const { push, tab, registered, favs, leads, posts } = useStore()
  const title = { myEvents: '我的报名', myFavs: '我的收藏', myLeads: '我的留资' }[kind]
  const favPosts = posts.filter((p) => favs.includes(p.id))
  const favProviders = providers.filter((p) => favs.includes(p.id))
  const kindTag = (t: string, cls: string) => <span className={`h-5 shrink-0 rounded-md px-1.5 text-[11px] font-semibold leading-5 ${cls}`}>{t}</span>

  return (
    <div className="min-h-full pb-12">
      <NavBar title={title} />
      <div className="space-y-3 px-4 pt-2">
        {kind === 'myEvents' && (registered.length ? events.filter((e) => registered.includes(e.id)).map((e) => (
          <Card key={e.id} onClick={() => push({ name: 'ticket', params: e.id })} className="flex items-center gap-3 !p-3">
            <img src={e.cover} alt={e.title} className="h-16 w-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1"><p className="line-clamp-2 text-[14px] font-semibold leading-5">{e.title}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted"><CalendarDays size={12} />{e.date}</p></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white"><Ticket size={16} /></span>
          </Card>
        )) : <Empty icon={<Ticket />} text="还没有报名活动" action="去看看活动" onAction={() => tab('events')} />)}

        {kind === 'myFavs' && (favPosts.length + favProviders.length ? (
          <>
            {favPosts.map((p) => (
              <Card key={p.id} onClick={() => push({ name: 'bizDetail', params: p.id })} className="flex items-center gap-3">
                <Avatar text={p.logo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">{kindTag('商机', 'bg-brand-soft text-brand')}<p className="truncate text-[15px] font-semibold">{p.anonymous ? '匿名企业' : p.company}</p></div>
                  <p className="mt-0.5 truncate text-[12px] text-muted">{p.need?.text ?? p.offer?.text}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-subtle" />
              </Card>
            ))}
            {favProviders.map((p) => (
              <Card key={p.id} onClick={() => push({ name: 'provider', params: p.id })} className="flex items-center gap-3">
                <Avatar text={p.logo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">{kindTag('服务商', 'bg-success-soft text-success')}<p className="truncate text-[15px] font-semibold">{p.name}</p></div>
                  <p className="mt-0.5 truncate text-[12px] text-muted">{p.pitch}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-subtle" />
              </Card>
            ))}
          </>
        ) : <Empty icon={<Heart />} text="收藏的商机和服务商会出现在这里" action="去逛商机广场" onAction={() => tab('biz')} />)}

        {kind === 'myLeads' && (leads.length ? leads.map((l, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between gap-2"><p className="truncate text-[15px] font-semibold">{l.name}</p><span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">待联系</span></div>
            <p className="mt-1 text-[13px] leading-[19px] text-muted">{l.note}</p>
            <p className="mt-1.5 font-display text-[11px] text-subtle">{l.time}</p>
          </Card>
        )) : <Empty icon={<MessageSquareText />} text="还没有留资记录" action="去出海资源库" onAction={() => push({ name: 'resources', params: 'lib' })} />)}
      </div>
    </div>
  )
}

const DOCS: Record<string, string[]> = {
  客服: ['工作日 9:00–18:00 在线', '电话：400-800-6688', '邮箱：help@hiboss.cn'],
  关于海老板: ['HIBOSS（海老板）是面向中国出海企业决策者与从业者的 AI Native 平台。', '给你一个懂你的出海分身，每天把该看的信息挑出来。平台内所有企业、需求、服务商、真人 Agent 都经过审核并留痕。'],
}
const POLICY = ['更新日期：2026 年 10 月 1 日', '我们会收集你的手机号、企业名称与地理位置，用于生成出海画像与推荐内容。所有信息仅用于为你提供服务，不会出售给第三方。', '你可以随时在「我的画像」中查看、修改或删除分身记住的信息。']

export function Doc({ title }: { title: string }) {
  return (
    <div className="min-h-full bg-white pb-12">
      <NavBar title={title} />
      <article className="space-y-3 px-5 pt-4 text-[15px] leading-[24px] text-ink/80">
        <h1 className="text-[24px] font-bold tracking-tight text-ink">{title}</h1>
        {(DOCS[title] ?? POLICY).map((p) => <p key={p}>{p}</p>)}
      </article>
    </div>
  )
}

export function Feedback() {
  const { back, toast } = useStore()
  const [kind, setKind] = useState('功能建议')
  const [t, setT] = useState('')
  return (
    <div className="min-h-full pb-12">
      <NavBar title="意见反馈" />
      <div className="px-4 pt-2">
        <p className="text-[13px] font-medium text-muted">反馈类型</p>
        <div className="mt-2 flex flex-wrap gap-2">{['功能建议', '内容不准', '体验问题', '其他'].map((x) => <Tag key={x} active={kind === x} onClick={() => setKind(x)}>{x}</Tag>)}</div>
        <div className="mt-5 rounded-2xl border border-line bg-white transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
          <textarea value={t} onChange={(e) => setT(e.target.value.slice(0, 300))} placeholder="说说你的想法，我们每条都会看" className="block h-40 w-full resize-none rounded-2xl bg-transparent p-4 text-[15px] leading-[22px] outline-none placeholder:text-subtle" />
          <div className="px-4 pb-3 text-right font-display text-[11px] text-subtle">{t.length}/300</div>
        </div>
        <Btn disabled={!t.trim()} onClick={() => { toast('感谢反馈，我们会尽快处理'); back() }} className="mt-5 w-full">提交</Btn>
      </div>
    </div>
  )
}
