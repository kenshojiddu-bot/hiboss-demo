import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, CalendarPlus, Check, ChevronRight, CircleAlert, Clock, EyeOff, Globe2, Loader2, Lock, Pencil, Plus, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Aurora, Avatar, BottomBar, Btn, CertBadge, MatchBadge, NavBar, Orb, Sheet, Switch, useStore } from '../ui'
import { budgets, deadlines, markets, needPrefer, needTypes, offerHighlights, offerTypes, type Post } from '../data'
import { MeetingSheet } from './Meetings'

type Offer = NonNullable<Post['offer']>
type Need = NonNullable<Post['need']>
const STEPS = ['我能做什么', '我需要什么', '预览发布']
const MAX_TEXT = 200

const NEED_COPY: Record<string, (r: string) => string> = {
  '找买家/采购': (r) => `寻找${r}的家居采购商、连锁卖场或电商大卖，首单 5–10 万美元，可提供样品与本地语言包装。`,
  找分销渠道: (r) => `寻找${r}有现代渠道或线上店铺资源的家居分销商，可给区域独家，首批铺货与营销费用可分担。`,
  找服务商: (r) => `寻找熟悉${r}市场的认证、清关与本地化运营服务商，希望 1 个月内启动，按阶段付款。`,
  '找资金/投资': (r) => `为${r}本地仓扩建与品牌推广寻找战略投资，计划融资 500–800 万元，可出让少量股权或做项目合作。`,
  找合作伙伴: (r) => `寻找在${r}有本地团队的合作伙伴，共同运营家居品牌，按销售分成，可先小批量试合作。`,
  找人才: (r) => `招聘${r}市场本地化运营负责人 1 名，熟悉 TikTok Shop 与 Shopee，可远程，薪资面议。`,
  其他: (r) => `希望在${r}市场拓展家居业务，欢迎有相关资源的企业联系交流。`,
}

const Label = ({ text, hint, error }: { text: string; hint?: string; error?: string }) => (
  <div className="mb-2 mt-6 flex items-baseline gap-2">
    <span className="shrink-0 text-[14px] font-semibold">{text}</span>
    {hint && <span className="shrink-0 text-[12px] text-subtle">{hint}</span>}
    {error && <span className="ml-auto flex min-w-0 items-center gap-1 text-[12px] text-danger"><CircleAlert size={12} className="shrink-0" /><span className="truncate">{error}</span></span>}
  </div>
)

const Chip = ({ on, onClick, children, amber }: { on: boolean; onClick: () => void; children: ReactNode; amber?: boolean }) => (
  <button onClick={onClick} className={`flex h-9 items-center gap-1 rounded-full px-3.5 text-[13px] transition active:scale-95 ${on ? `${amber ? 'bg-accent' : 'bg-ink'} font-medium text-white` : 'border border-line bg-white'}`}>
    {on && <Check size={13} strokeWidth={2.6} />}{children}
  </button>
)

const AiTextarea = ({ value, onChange, placeholder, writing, onAi, error }: { value: string; onChange: (v: string) => void; placeholder: string; writing: boolean; onAi: () => void; error?: boolean }) => (
  <div className={`relative rounded-2xl border bg-white transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 ${error ? 'animate-[shake_.3s] border-danger' : 'border-line'}`}>
    <textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT))} placeholder={placeholder} className="block h-32 w-full resize-none rounded-2xl bg-transparent p-4 pb-11 text-[15px] leading-[22px] outline-none placeholder:text-subtle" />
    <div className="absolute inset-x-3 bottom-3 flex items-center">
      <button onClick={onAi} disabled={writing} className="flex h-7 items-center gap-1 rounded-full bg-linear-to-r from-ai to-brand px-3 text-[12px] font-medium text-white disabled:opacity-70">
        {writing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}{writing ? '分身撰写中…' : value ? 'AI 重新写' : 'AI 按画像帮我写'}
      </button>
      <span className={`ml-auto font-display text-[11px] ${value.length >= MAX_TEXT ? 'text-danger' : 'text-subtle'}`}>{value.length}/{MAX_TEXT}</span>
    </div>
  </div>
)

const Skipped = ({ text, onRestore }: { text: string; onRestore: () => void }) => (
  <div className="mt-5 rounded-[22px] border border-dashed border-line bg-white/60 p-6 text-center">
    <p className="text-[14px] text-muted">{text}</p>
    <button onClick={onRestore} className="mt-3 inline-flex h-9 items-center gap-1 rounded-full bg-ink px-4 text-[13px] font-medium text-white"><Plus size={14} />我要填写</button>
  </div>
)

const PreviewSide = ({ kind, on, label, text, extra, onEdit, onAdd }: { kind: 'offer' | 'need'; on: boolean; label: string; text: string; extra?: ReactNode; onEdit: () => void; onAdd: () => void }) =>
  on ? (
    <div className={`mt-3 rounded-2xl p-3.5 ${kind === 'offer' ? 'bg-success-soft/70' : 'bg-brand-soft/80'}`}>
      <div className="flex items-center gap-2">
        <span className={`h-5 shrink-0 rounded-md px-1.5 text-[11px] font-semibold leading-5 text-white ${kind === 'offer' ? 'bg-success' : 'bg-brand'}`}>{kind === 'offer' ? '能做' : '需要'}</span>
        <span className={`truncate text-[12px] font-medium ${kind === 'offer' ? 'text-success' : 'text-brand'}`}>{label}</span>
        <button onClick={onEdit} className="ml-auto flex shrink-0 items-center gap-0.5 text-[12px] text-muted"><Pencil size={12} />修改</button>
      </div>
      <p className="mt-2 text-[14px] leading-[21px]">{text}</p>
      {extra}
    </div>
  ) : (
    <button onClick={onAdd} className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-line py-3 text-[13px] text-muted"><Plus size={14} />补充「{kind === 'offer' ? '我能做什么' : '我需要什么'}」，匹配更全面</button>
  )

/** Three-step publish wizard. `edit` reopens an existing post under the same id; `focus: 'need'` starts at the need step. */
export default function Publish({ focus, edit }: { focus?: 'offer' | 'need'; edit?: string }) {
  const { posts, profile, cert, addPost, replace, toast } = useStore()
  const old = edit ? posts.find((p) => p.id === edit) : undefined
  const [step, setStep] = useState(focus === 'need' && !old ? 1 : 0)
  const [useOffer, setUseOffer] = useState(old ? !!old.offer : focus !== 'need')
  const [useNeed, setUseNeed] = useState(old ? !!old.need : true)
  const [offer, setOffer] = useState<Offer>(old?.offer ?? { types: [], text: '', highlights: [] })
  const [need, setNeed] = useState<Need>(old?.need ?? { type: '', text: '', budget: '面议', deadline: '1 个月内', prefer: [] })
  const [region, setRegion] = useState<string[]>(old?.region ?? profile.countries.filter((c) => markets.includes(c)))
  const [scope, setScope] = useState(old?.scope ?? '所有注册用户')
  const [anonymous, setAnonymous] = useState(old?.anonymous ?? false)
  const [expire, setExpire] = useState(old?.expire ?? '30 天')
  const [agree, setAgree] = useState(!!old)
  const [rules, setRules] = useState(false)
  const [err, setErr] = useState<Record<string, string>>({})
  const [writing, setWriting] = useState<'offer' | 'need' | null>(null)
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)
  const topRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => clearInterval(timer.current), [])

  const fix = (k: string) => setErr((e) => { if (!e[k]) return e; const n = { ...e }; delete n[k]; return n })
  const toggle = (list: string[], v: string, max = 99) => (list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v])
  // Scroll the phone's page scroller (not the browser window) back to the step header.
  const go = (s: number) => { setErr({}); setStep(s); topRef.current?.closest<HTMLElement>('.overflow-y-auto')?.scrollTo({ top: 0 }) }

  const checkOffer = () => {
    const e: Record<string, string> = {}
    if (!useOffer) return e
    if (!offer.types.length) e.offerTypes = '至少选择 1 个能力类型'
    if (offer.text.trim().length < 10) e.offerText = '至少写 10 个字'
    return e
  }
  const checkNeed = () => {
    const e: Record<string, string> = {}
    if (!useNeed) return e
    if (!need.type) e.needType = '请选择需求类型'
    if (need.text.trim().length < 10) e.needText = '至少写 10 个字'
    return e
  }
  const checkAll = () => {
    const e: Record<string, string> = { ...checkOffer(), ...checkNeed() }
    if (!useOffer && !useNeed) e.sides = '至少填写「能做什么」或「需要什么」中的一项'
    if (!region.length) e.region = '至少选择 1 个目标市场'
    if (!agree) e.agree = '请先阅读并同意发布规范'
    return e
  }

  const checks = [
    ...(useOffer ? [offer.types.length > 0, offer.text.trim().length >= 10, offer.highlights.length > 0] : []),
    ...(useNeed ? [!!need.type, need.text.trim().length >= 10, need.budget !== '面议', need.prefer.length > 0] : []),
    useOffer || useNeed, region.length > 0, agree,
  ]
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100)
  const hint = useOffer && !offer.highlights.length ? '能力亮点' : useNeed && need.budget === '面议' ? '具体预算' : useNeed && !need.prefer.length ? '合作偏好' : !useOffer ? '「我能做什么」' : !useNeed ? '「我需要什么」' : ''

  const aiWrite = (side: 'offer' | 'need') => {
    const r = region.join('、') || profile.countries.join('、')
    const text = side === 'offer'
      ? `${profile.company.replace(/有限公司$/, '')}：主营收纳家居，年产 60 万件，支持 OEM/ODM 与小单试产${offer.types.length ? `，可提供${offer.types.join('、')}` : ''}；雅加达有 3000㎡ 本地仓，样品 7 天内可达。`
      : (NEED_COPY[need.type] ?? NEED_COPY['找合作伙伴'])(r)
    clearInterval(timer.current)
    setWriting(side)
    fix(side === 'offer' ? 'offerText' : 'needText')
    let i = 0
    timer.current = setInterval(() => {
      i += 2
      const s = text.slice(0, i)
      if (side === 'offer') setOffer((o) => ({ ...o, text: s }))
      else setNeed((n) => ({ ...n, text: s }))
      if (i >= text.length) { clearInterval(timer.current); setWriting(null) }
    }, 22)
  }

  const skip = () => {
    if (step === 0) { setUseOffer(false); go(1); return }
    if (!useOffer) { toast('至少要填写一项，「我能做什么」已跳过'); return }
    setUseNeed(false)
    go(2)
  }

  const submit = () => {
    const id = old?.id ?? `my${Date.now()}`
    addPost({
      id, company: profile.company, logo: old?.logo ?? (profile.company.includes('海鲸') ? '鲸' : profile.company.slice(0, 1)), cert: cert === '已认证',
      region, time: '刚刚', views: old?.views ?? 0, intents: old?.intents ?? 0, match: 0, mine: true, status: '审核中',
      anonymous, scope, expire, rank: old?.rank, contact: old?.contact ?? `${profile.name} · 138 0013 8000`,
      offer: useOffer ? { ...offer, text: offer.text.trim() } : undefined,
      need: useNeed ? { ...need, text: need.text.trim() } : undefined,
    })
    replace({ name: 'published', params: id })
  }

  const next = () => {
    if (writing) return
    const e = step === 0 ? checkOffer() : step === 1 ? checkNeed() : checkAll()
    setErr(e)
    const first = Object.values(e)[0]
    if (first) { toast(first); return }
    if (step < 2) go(step + 1)
    else submit()
  }

  return (
    <div ref={topRef} className="min-h-full pb-36">
      <NavBar title={old ? '编辑供需' : '发布供需'} />
      <div className="px-4 pt-2">
        <div className="rounded-[22px] border border-line/70 bg-white p-4 shadow-card">
          <div className="flex gap-2">
            {STEPS.map((s, i) => {
              const skipped = (i === 0 && !useOffer) || (i === 1 && !useNeed)
              return (
                <button key={s} onClick={() => i < step && go(i)} disabled={i >= step} className="flex flex-1 flex-col gap-1.5 text-left">
                  <span className={`h-1.5 rounded-full transition-colors ${i <= step ? (skipped ? 'bg-line' : 'bg-linear-to-r from-brand to-brand-2') : 'bg-line'}`} />
                  <span className={`text-[12px] ${i === step ? 'font-semibold text-ink' : i < step ? 'text-brand' : 'text-subtle'}`}>{i + 1} {s}{skipped && i !== step ? ' · 跳过' : ''}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3">
            <span className="text-[12px] text-muted">信息完整度</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-chip"><div className="h-full rounded-full bg-linear-to-r from-ai to-brand transition-all duration-500" style={{ width: `${pct}%` }} /></div>
            <span className="font-display text-[13px] font-bold">{pct}%</span>
          </div>
          {pct < 100 && hint && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ai-ink"><Sparkles size={11} className="text-ai" />补充{hint}，分身匹配会更准</p>}
        </div>

        {old && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-accent-soft px-3.5 py-2.5 text-[12px] text-accent-ink"><CircleAlert size={14} className="shrink-0" />修改后需重新审核，审核期间暂停对外展示</div>}

        {step === 0 && (
          <div key="offer" className="animate-[fadeup_.25s_ease-out]">
            <h2 className="mt-6 text-[22px] font-bold tracking-tight">你能提供什么？</h2>
            <p className="mt-1 text-[13px] text-muted">写清你的能力，分身会推给正需要它的企业</p>
            {!useOffer ? <Skipped text="这次不发布「我能做什么」" onRestore={() => setUseOffer(true)} /> : <>
              <Label text="能力类型" hint="最多 3 个" error={err.offerTypes} />
              <div className="flex flex-wrap gap-2">{offerTypes.map((t) => <Chip key={t} on={offer.types.includes(t)} onClick={() => { setOffer({ ...offer, types: toggle(offer.types, t, 3) }); fix('offerTypes') }}>{t}</Chip>)}</div>
              <Label text="一句话描述" error={err.offerText} />
              <AiTextarea value={offer.text} onChange={(v) => { setOffer({ ...offer, text: v }); fix('offerText') }} placeholder="例如：年产 60 万件收纳家居，支持 OEM/ODM，雅加达有本地仓" writing={writing === 'offer'} onAi={() => aiWrite('offer')} error={!!err.offerText} />
              <Label text="能力亮点" hint="选填，可多选" />
              <div className="flex flex-wrap gap-2">{offerHighlights.map((h) => <Chip key={h} on={offer.highlights.includes(h)} onClick={() => setOffer({ ...offer, highlights: toggle(offer.highlights, h) })}>{h}</Chip>)}</div>
              <button onClick={skip} className="mt-7 flex w-full items-center justify-center gap-0.5 text-[13px] text-muted">这次只发需求，跳过此步<ChevronRight size={14} /></button>
            </>}
          </div>
        )}

        {step === 1 && (
          <div key="need" className="animate-[fadeup_.25s_ease-out]">
            <h2 className="mt-6 text-[22px] font-bold tracking-tight">你需要什么？</h2>
            <p className="mt-1 text-[13px] text-muted">说清需求，分身会帮你找到能做的企业</p>
            {!useNeed ? <Skipped text="这次不发布「我需要什么」" onRestore={() => setUseNeed(true)} /> : <>
              <Label text="需求类型" error={err.needType} />
              <div className="flex flex-wrap gap-2">{needTypes.map((t) => <Chip key={t} on={need.type === t} onClick={() => { setNeed({ ...need, type: t }); fix('needType') }}>{t}</Chip>)}</div>
              <Label text="需求描述" error={err.needText} />
              <AiTextarea value={need.text} onChange={(v) => { setNeed({ ...need, text: v }); fix('needText') }} placeholder="例如：寻找沙特的家居分销商，首单 5–10 万美元" writing={writing === 'need'} onAi={() => aiWrite('need')} error={!!err.needText} />
              <Label text="预算" />
              <div className="flex flex-wrap gap-2">{budgets.map((b) => <Chip key={b} amber on={need.budget === b} onClick={() => setNeed({ ...need, budget: b })}>{b}</Chip>)}</div>
              <Label text="期望时间" />
              <div className="flex flex-wrap gap-2">{deadlines.map((d) => <Chip key={d} on={need.deadline === d} onClick={() => setNeed({ ...need, deadline: d })}>{d}</Chip>)}</div>
              <Label text="对合作方的偏好" hint="选填，可多选" />
              <div className="flex flex-wrap gap-2">{needPrefer.map((x) => <Chip key={x} on={need.prefer.includes(x)} onClick={() => setNeed({ ...need, prefer: toggle(need.prefer, x) })}>{x}</Chip>)}</div>
              <button onClick={skip} className="mt-7 flex w-full items-center justify-center gap-0.5 text-[13px] text-muted">这次只发能力，跳过此步<ChevronRight size={14} /></button>
            </>}
          </div>
        )}

        {step === 2 && (
          <div key="preview" className="animate-[fadeup_.25s_ease-out]">
            <h2 className="mt-6 text-[22px] font-bold tracking-tight">预览并发布</h2>
            <p className="mt-1 text-[13px] text-muted">这是其他企业在商机广场看到的样子</p>
            {err.sides && <p className="mt-3 flex items-center gap-1.5 rounded-2xl bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger"><CircleAlert size={14} />{err.sides}</p>}
            <div className="mt-4 rounded-[24px] border border-line/70 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <Avatar text={anonymous ? '匿' : old?.logo ?? '鲸'} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><span className="truncate text-[15px] font-semibold">{anonymous ? '匿名企业' : profile.company}</span><CertBadge state={cert} /></div>
                  <div className="mt-0.5 text-[12px] text-subtle">{region.join(' · ') || '未选择市场'} · 刚刚</div>
                </div>
              </div>
              <PreviewSide kind="offer" on={useOffer} label={offer.types.join(' · ')} text={offer.text} onEdit={() => go(0)} onAdd={() => { setUseOffer(true); go(0) }}
                extra={!!offer.highlights.length && <div className="mt-2 flex flex-wrap gap-1.5">{offer.highlights.map((h) => <span key={h} className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-success">{h}</span>)}</div>} />
              <PreviewSide kind="need" on={useNeed} label={need.type} text={need.text} onEdit={() => go(1)} onAdd={() => { setUseNeed(true); go(1) }}
                extra={<div className="mt-2 flex items-center gap-2 text-[12px] text-muted"><span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-ink">{need.budget}</span><span className="flex items-center gap-0.5"><Clock size={11} />{need.deadline}</span></div>} />
            </div>

            <Label text="目标市场" hint="可多选" error={err.region} />
            <div className="flex flex-wrap gap-2">{markets.map((m) => <Chip key={m} on={region.includes(m)} onClick={() => { setRegion(toggle(region, m)); fix('region') }}>{m}</Chip>)}</div>

            <Label text="谁可以看到" />
            <div className="grid grid-cols-2 gap-2">
              {([['所有注册用户', Globe2, '曝光更多'], ['仅认证企业', Lock, '更精准，过滤无效咨询']] as const).map(([v, I, d]) => (
                <button key={v} onClick={() => setScope(v)} className={`rounded-2xl border p-3.5 text-left transition ${scope === v ? 'border-ink bg-white ring-1 ring-ink' : 'border-line bg-white/70'}`}>
                  <div className="flex items-center justify-between"><I size={18} className={scope === v ? 'text-ink' : 'text-muted'} />{scope === v && <span className="grid h-4 w-4 place-items-center rounded-full bg-ink text-white"><Check size={10} strokeWidth={3} /></span>}</div>
                  <div className="mt-2 text-[14px] font-semibold">{v}</div>
                  <div className="text-[11px] text-muted">{d}</div>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <EyeOff size={18} className="shrink-0 text-muted" />
              <div className="min-w-0 flex-1"><div className="text-[14px] font-medium">匿名发布</div><div className="text-[11px] text-muted">隐藏公司名，收到意向后再决定是否公开</div></div>
              <Switch on={anonymous} onChange={setAnonymous} />
            </div>

            <Label text="有效期" />
            <div className="flex gap-2">{['7 天', '30 天', '90 天'].map((x) => <Chip key={x} on={expire === x} onClick={() => setExpire(x)}>{x}</Chip>)}</div>

            {cert !== '已认证' && <p className="mt-5 flex items-start gap-2 rounded-2xl bg-brand-soft px-3.5 py-3 text-[12px] leading-[18px] text-brand"><ShieldCheck size={15} className="mt-px shrink-0" />发布后可在「我的 · 企业认证」完成认证，带「已认证」标识的供需平均多获得 3 倍意向</p>}

            <div className={`mt-5 flex items-start gap-2 text-[12px] leading-[18px] ${err.agree ? 'animate-[shake_.3s] text-danger' : 'text-muted'}`}>
              <button onClick={() => { setAgree(!agree); fix('agree') }} role="checkbox" aria-checked={agree} aria-label="同意发布规范" className={`mt-px grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition ${agree ? 'border-brand bg-brand text-white' : err.agree ? 'border-danger bg-white' : 'border-subtle bg-white'}`}>{agree && <Check size={11} strokeWidth={3} />}</button>
              <p>我确认信息真实有效，已阅读并同意<button onClick={() => setRules(true)} className="text-brand">《海老板供需发布规范》</button>，违规内容将被下架</p>
            </div>
          </div>
        )}
      </div>

      <BottomBar>
        {step > 0 && <Btn kind="secondary" onClick={() => go(step - 1)} className="!h-12 w-[104px] shrink-0">上一步</Btn>}
        <Btn onClick={next} className="flex-1">{step < 2 ? <>下一步<ArrowRight size={17} /></> : old ? '重新提交审核' : '提交审核'}</Btn>
      </BottomBar>

      <Sheet open={rules} onClose={() => setRules(false)} title="海老板供需发布规范">
        <ol className="list-decimal space-y-2.5 pl-5 text-[14px] leading-[21px] text-ink/85">
          <li>发布内容须真实、合法，不得夸大或虚构企业资质与案例。</li>
          <li>不得发布违禁品、侵权产品或涉及洗钱、传销的合作信息。</li>
          <li>联系方式仅向已认证企业展示，平台不会对外出售你的信息。</li>
          <li>被多次举报并核实的内容将被下架，严重者限制发布权限。</li>
          <li>对接过程中请勿提前支付保证金等费用，谨防诈骗。</li>
        </ol>
        <Btn onClick={() => { setAgree(true); fix('agree'); setRules(false) }} className="mt-5 w-full">我已阅读并同意</Btn>
      </Sheet>
    </div>
  )
}

/** Rank other companies' live posts against a newly published post. */
function matchesFor(p: Post, posts: Post[]) {
  return posts
    .filter((x) => !x.mine && (x.status ?? '已发布') === '已发布')
    .map((x) => {
      const shared = x.region.find((r) => p.region.includes(r))
      const fills = !!(p.need && x.offer) || !!(p.offer && x.need)
      const score = Math.min(98, Math.round(x.match * 0.7 + (shared ? 18 : 0) + (fills ? 10 : 0)))
      const reason = p.need && x.offer && shared ? `对方在${shared}提供「${x.offer.types.join('、')}」，正好补上你「${p.need.type}」的需求`
        : p.offer && x.need ? `对方正在「${x.need.type}」，与你提供的「${p.offer.types[0] ?? '能力'}」互补`
        : x.reasons?.[0] ?? '与你的画像和本次发布高度相关'
      return { post: x, score, reason }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function Published({ id }: { id: string }) {
  const { posts, push, reset } = useStore()
  const [meet, setMeet] = useState<{ who: string; postId: string } | null>(null)
  const p = posts.find((x) => x.id === id) ?? posts.find((x) => x.mine)
  if (!p) return null
  const pending = p.status === '审核中'
  const matches = matchesFor(p, posts)
  const toMine = () => reset([{ name: 'biz', params: 'mine' }])

  return (
    <div className="relative min-h-full pb-36">
      <Aurora className="h-[440px]" />
      <button onClick={toMine} aria-label="关闭" className="absolute left-4 top-[50px] z-10 grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70 backdrop-blur"><X size={16} /></button>
      <div className="relative px-6 pt-[112px] text-center">
        <div className="relative mx-auto h-20 w-20">
          {pending && <span className="absolute inset-0 animate-[halo_1.6s_ease-out_infinite] rounded-full bg-accent/40" />}
          <div key={pending ? 'pending' : 'done'} className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_18px_40px_-14px_rgba(11,19,36,0.5)] ${pending ? 'bg-linear-to-br from-accent to-[#fdb022]' : 'animate-[pop_.45s_ease-out] bg-linear-to-br from-success to-[#5fe0b7]'}`}>
            {pending ? <Clock size={34} /> : <Check size={38} strokeWidth={2.6} />}
          </div>
        </div>
        <h1 className="mt-5 text-[24px] font-bold tracking-tight">{pending ? '已提交，正在审核' : '发布成功'}</h1>
        <p className="mt-1.5 text-[13px] leading-5 text-muted">{pending ? '平台通常 5 秒内完成审核（演示），通过后自动在商机广场展示' : '已在商机广场展示，分身会持续为你推荐匹配的企业'}</p>
        <div className="mx-auto mt-6 flex max-w-[290px] items-start">
          {['提交', '平台审核', '广场展示'].map((s, i) => {
            const done = i === 0 || !pending
            const active = pending && i === 1
            return (
              <Fragment key={s}>
                {i > 0 && <span className={`mt-3 h-0.5 flex-1 rounded-full ${done ? 'bg-brand' : active ? 'bg-linear-to-r from-brand to-accent' : 'bg-line'}`} />}
                <div className="flex w-14 flex-col items-center gap-1">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-brand text-white' : active ? 'border-2 border-accent bg-white text-accent' : 'bg-line text-subtle'}`}>{done ? <Check size={13} strokeWidth={3} /> : active ? <Loader2 size={12} className="animate-spin" /> : i + 1}</span>
                  <span className={`text-[11px] ${active ? 'font-medium text-accent-ink' : 'text-muted'}`}>{s}</span>
                </div>
              </Fragment>
            )
          })}
        </div>
        <button onClick={() => push({ name: 'bizDetail', params: p.id })} className="mt-5 inline-flex items-center gap-0.5 text-[13px] font-medium text-brand">查看这条发布<ChevronRight size={14} /></button>
      </div>

      <section className="relative mt-7 px-4">
        <div className="mb-3 flex items-center gap-2.5">
          <Orb size={30} />
          <div><h2 className="text-[17px] font-bold">分身已为你找到 {matches.length} 个匹配</h2><p className="text-[12px] text-muted">基于你的画像和本次发布，按匹配度排序</p></div>
        </div>
        <div className="space-y-3">
          {matches.map(({ post: m, score, reason }, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 90}ms` }} className="animate-[fadeup_.35s_ease-out_both] rounded-[22px] border border-line/70 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <Avatar text={m.logo} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><span className="truncate text-[15px] font-semibold">{m.company}</span>{m.cert && <CertBadge />}</div>
                  <div className="text-[12px] text-subtle">{m.region.join(' · ')} · {m.offer ? m.offer.types[0] : m.need?.type}</div>
                </div>
                <MatchBadge value={score} />
              </div>
              <p className="mt-3 flex gap-2 rounded-2xl bg-ai-soft/70 px-3 py-2.5 text-[13px] leading-[19px] text-ai-ink"><Sparkles size={14} className="mt-0.5 shrink-0 text-ai" />{reason}</p>
              <div className="mt-3 flex gap-2">
                <Btn kind="secondary" onClick={() => push({ name: 'bizDetail', params: m.id })} className="!h-10 flex-1 !text-[14px]">查看详情</Btn>
                <Btn onClick={() => setMeet({ who: m.company, postId: m.id })} className="!h-10 flex-1 !text-[14px]"><CalendarPlus size={15} />约会议</Btn>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomBar>
        <Btn kind="secondary" onClick={() => reset([{ name: 'biz' }])} className="!h-12 flex-1">去商机广场</Btn>
        <Btn onClick={toMine} className="flex-[1.3]">查看我的发布</Btn>
      </BottomBar>
      <MeetingSheet open={!!meet} onClose={() => setMeet(null)} withWho={meet?.who} postId={meet?.postId} />
    </div>
  )
}
