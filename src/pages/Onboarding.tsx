import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Building2, Check, ChevronLeft, CircleAlert, Lightbulb, Loader2, Radar as RadarIcon, RefreshCw, ShieldCheck, Sparkles, TrendingUp, Upload } from 'lucide-react'
import { Aurora, BottomBar, Btn, Field, Orb, Radar, useStore } from '../ui'
import { radar } from '../data'

export function Login() {
  const { tab, toast, setGuest, push } = useStore()
  const [agree, setAgree] = useState(false)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = () => {
    if (!agree) { setShake(true); toast('请先阅读并同意协议'); setTimeout(() => setShake(false), 500); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); push({ name: 'onboard' }) }, 900)
  }
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden px-6 pt-[112px]">
      <Aurora className="h-[560px]" />
      <div className="relative flex-1">
        <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-ink font-display text-[22px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(11,19,36,0.7)]">HB</div>
        <h1 className="mt-7 text-[36px] font-bold leading-[44px] tracking-tight">出海的人<br />都在<span className="text-gradient">这儿</span></h1>
        <p className="mt-2 text-[15px] text-muted">HIBOSS 海老板 · 你的 AI 出海分身</p>
        <div className="mt-9 space-y-2.5">
          {([[RadarIcon, '替你盯信息', '每天 5–8 条，只给跟你有关的'], [Lightbulb, '帮你做判断', '每条先给结论，再讲背景'], [ShieldCheck, '资源都核过', '企业、服务商、真人 Agent 全部审核留痕']] as const).map(([I, t, d]) => (
            <div key={t} className="flex items-center gap-3.5 rounded-2xl border border-white bg-white/60 p-3.5 backdrop-blur">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white"><I size={19} /></div>
              <div><div className="text-[15px] font-semibold">{t}</div><div className="text-[12px] text-muted">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative pb-10 pt-8">
        <Btn onClick={login} className={`w-full ${shake ? 'animate-[shake_.4s]' : ''}`}>{loading ? <Loader2 className="animate-spin" /> : '手机号快速登录'}</Btn>
        <button onClick={() => { setGuest(true); tab('events') }} className="mt-2 h-11 w-full text-[15px] font-medium">先看看</button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <button onClick={() => setAgree(!agree)} aria-label="同意协议" className={`grid h-4 w-4 place-items-center rounded-full border ${agree ? 'border-ink bg-ink' : 'border-subtle'}`}>{agree && <Check size={10} className="text-white" />}</button>
          我已阅读并同意<button onClick={() => push({ name: 'doc', params: '用户协议' })} className="text-ink underline-offset-2 hover:underline">《用户协议》</button><button onClick={() => push({ name: 'doc', params: '隐私政策' })} className="text-ink underline-offset-2 hover:underline">《隐私政策》</button>
        </div>
      </div>
    </div>
  )
}

const titles = ['董事长', '总经理', '外贸负责人', '市场负责人', '其他']
const industries = ['家居', '美妆个护', '消费电子', '食品', '机械制造', '服装', '新能源']
const sizes = ['1–20', '21–100', '101–500', '500+']
const countries = ['东南亚', '中东', '欧洲', '北美', '拉美', '非洲', '日韩', '其他']
const topics = ['市场机会', '政策合规', '渠道与买家', '供应链与物流', '用工与团队', '资金与收款', '认证与准入']
const stages = ['还在了解', '准备试水', '已出海要增长', '已在海外落地']
const STEP_COPY = [
  ['先认识一下，你是谁？', '已实时保存，随时可以继续'],
  ['你的企业在做什么？', '帮分身判断哪些政策和机会跟你有关'],
  ['你最想先搞清楚哪几件事？', '分身会按这些重点，每天替你筛信息'],
]

const Label = ({ children }: { children: ReactNode }) => <span className="mb-1.5 block text-[13px] font-medium text-muted">{children}</span>

const Chip = ({ on, onClick, children, className = '' }: { on: boolean; onClick: () => void; children: ReactNode; className?: string }) => (
  <button onClick={onClick} className={`flex h-10 items-center justify-center gap-1 rounded-full px-4 text-[14px] transition active:scale-95 ${on ? 'bg-ink font-medium text-white' : 'border border-line bg-white'} ${className}`}>
    {on && <Check size={13} strokeWidth={2.6} />}{children}
  </button>
)

export default function Onboard() {
  const { push, back, toast, setProfile, profile, scrolled } = useStore()
  const topRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: '', title: '', city: '深圳', phone: '138 0013 8000', company: '', inds: [] as string[], size: '', out: '', license: '' as '' | 'up' | 'ok' | 'fail', cs: [] as string[], ts: [] as string[], stage: '' })
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }))
  const tog = (k: 'inds' | 'cs' | 'ts', v: string, max = 99) => {
    const arr = f[k]
    if (arr.includes(v)) return set(k, arr.filter((x) => x !== v))
    if (arr.length >= max) return toast('先聚焦，最多选 5 个')
    set(k, [...arr, v])
  }
  // Steps share one page, so bring the phone's scroller (not the browser window) back to the top.
  const go = (n: number) => { setStep(n); topRef.current?.closest<HTMLElement>('.overflow-y-auto')?.scrollTo({ top: 0 }) }
  const phoneOk = /^1\d{10}$/.test(f.phone.replace(/\s/g, ''))
  const s1 = f.name.trim() && f.title && f.city.trim() && phoneOk
  const suggestions = ['深圳海鲸家居科技有限公司', '深圳海鲸供应链有限公司'].filter((s) => f.company && s.includes(f.company) && s !== f.company)
  const progress = f.cs.length + f.ts.length + (f.stage ? 1 : 0)
  const finish = () => {
    setProfile({ ...profile, name: f.name || profile.name, title: f.title || profile.title, city: f.city, company: f.company || profile.company, countries: f.cs.length ? f.cs : profile.countries, topics: f.ts.length ? f.ts : profile.topics, stage: f.stage || profile.stage })
    push({ name: 'portrait' })
  }
  const skip = () => { toast('跳过后画像会不准'); if (step === 1) go(2); else finish() }
  const upload = () => { set('license', 'up'); setTimeout(() => set('license', Math.random() > 0.25 ? 'ok' : 'fail'), 1200) }

  return (
    <div ref={topRef} className="relative min-h-full pb-36">
      <Aurora className="h-[300px]" />
      <div className={`sticky top-0 z-20 pt-2 transition-colors duration-200 ${scrolled ? 'border-b border-line/60 bg-canvas/80 backdrop-blur-xl' : ''}`}>
        <div className="flex h-11 items-center gap-2.5 pl-3 pr-[104px]">
          <button onClick={() => (step ? go(step - 1) : back())} aria-label="上一步" className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white"><ChevronLeft size={18} /></button>
          <span className="font-display text-[13px] font-semibold">{step + 1}<span className="text-subtle"> / 3</span></span>
          {step > 0 && <button onClick={skip} className="ml-auto text-[13px] text-muted">跳过</button>}
        </div>
        <div className="flex gap-1.5 px-4 pb-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.08]"><div className={`h-full rounded-full bg-linear-to-r from-brand to-brand-2 transition-all duration-500 ${i <= step ? 'w-full' : 'w-0'}`} /></div>)}
        </div>
      </div>

      <div className="relative px-5 pt-3">
        <div key={step} className="animate-[fadeup_.3s_ease-out]">
          <h1 className="text-[26px] font-bold leading-[34px] tracking-tight">{STEP_COPY[step][0]}</h1>
          <p className="mt-1 text-[13px] text-muted">{STEP_COPY[step][1]}</p>
        </div>

        {step === 0 && (
          <div className="mt-6 space-y-5">
            <Field required label="姓名" value={f.name} onChange={(v) => set('name', v)} placeholder="怎么称呼你" />
            <div>
              <Label>职位<span className="text-danger"> *</span></Label>
              <div className="flex flex-wrap gap-2">{titles.map((t) => <Chip key={t} on={f.title === t} onClick={() => set('title', t)}>{t}</Chip>)}</div>
            </div>
            <Field required label="所在城市" value={f.city} onChange={(v) => set('city', v)} />
            <Field required label="手机号（已自动带出）" value={f.phone} onChange={(v) => set('phone', v)} error={!phoneOk ? '手机号格式不正确，请输入 11 位号码' : undefined} />
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div className="relative">
              <Field label="企业名称" value={f.company} onChange={(v) => set('company', v)} placeholder="输入关键字搜索，如：海鲸" />
              {suggestions.length > 0 && (
                <div className="absolute inset-x-0 z-10 mt-1.5 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_-12px_rgba(11,19,36,0.3)]">
                  {suggestions.map((s) => <button key={s} onClick={() => set('company', s)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] active:bg-chip"><Building2 size={16} className="text-subtle" />{s}</button>)}
                </div>
              )}
              {f.company.length > 3 && !suggestions.length && !f.company.startsWith('深圳海鲸') && <p className="mt-1.5 text-[11px] text-muted">未搜索到该企业，将为你新建档案</p>}
            </div>
            <div><Label>所属行业（多选）</Label><div className="flex flex-wrap gap-2">{industries.map((t) => <Chip key={t} on={f.inds.includes(t)} onClick={() => tog('inds', t)}>{t}</Chip>)}</div></div>
            <div>
              <Label>员工规模</Label>
              <div className="grid grid-cols-4 gap-1 rounded-full bg-ink/[0.06] p-1">
                {sizes.map((t) => <button key={t} onClick={() => set('size', t)} className={`h-9 rounded-full font-display text-[13px] transition ${f.size === t ? 'bg-white font-semibold shadow-[0_2px_10px_-3px_rgba(11,19,36,0.2)]' : 'text-muted'}`}>{t}</button>)}
              </div>
            </div>
            <div className="rounded-[20px] border border-accent/20 bg-accent-soft p-4">
              <div className="flex items-baseline gap-1.5"><span className="text-[15px] font-bold text-accent-ink">是否已出海？</span><span className="text-[11px] text-accent-ink/80">决定你的推荐内容</span></div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['是', '筹备中', '否'].map((t) => <button key={t} onClick={() => set('out', t)} className={`h-10 rounded-full text-[14px] transition ${f.out === t ? 'bg-accent font-semibold text-white' : 'bg-white'}`}>{t}</button>)}
              </div>
            </div>
            <div>
              <Label>营业执照（可选，稍后上传不影响使用）</Label>
              {f.license === '' && <button onClick={upload} className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-subtle/70 bg-white/60 text-[13px] text-muted"><Upload size={22} />拍照或从相册上传</button>}
              {f.license === 'up' && <div className="flex h-24 items-center justify-center gap-2 rounded-2xl bg-white text-[13px] text-muted"><Loader2 size={18} className="animate-spin text-brand" />上传中…</div>}
              {f.license === 'fail' && (
                <div className="flex h-24 flex-col items-center justify-center rounded-2xl bg-danger-soft text-[13px] text-danger">
                  上传失败，网络不稳定
                  <button onClick={upload} className="mt-2 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-ink"><RefreshCw size={12} />重试</button>
                </div>
              )}
              {f.license === 'ok' && (
                <div className="flex items-center gap-3 rounded-2xl border border-line/70 bg-white p-3">
                  <div className="h-16 w-12 shrink-0 rounded-lg bg-linear-to-br from-chip to-line" />
                  <div className="min-w-0 flex-1 text-[13px]">营业执照.jpg<div className="text-[11px] text-accent-ink">审核中 · 预计 1–2 个工作日</div></div>
                  <button onClick={() => set('license', '')} className="text-[13px] text-danger">删除</button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-6">
            <div><Label>关注国别（至少选 1 个）</Label><div className="grid grid-cols-4 gap-2">{countries.map((t) => <Chip key={t} on={f.cs.includes(t)} onClick={() => tog('cs', t)} className="!px-0 !text-[13px]">{t}</Chip>)}</div></div>
            <div><Label>关注议题（最多 5 个，已选 {f.ts.length}）</Label><div className="flex flex-wrap gap-2">{topics.map((t) => <Chip key={t} on={f.ts.includes(t)} onClick={() => tog('ts', t, 5)}>{t}</Chip>)}</div></div>
            <div>
              <Label>当前阶段</Label>
              <div className="space-y-2">
                {stages.map((t) => {
                  const on = f.stage === t
                  return (
                    <button key={t} onClick={() => set('stage', t)} className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-[15px] transition ${on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line bg-white'}`}>
                      {t}<span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? 'border-brand bg-brand' : 'border-line'}`}>{on && <Check size={11} strokeWidth={3} className="text-white" />}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-2.5 rounded-[20px] border border-ai/15 bg-linear-to-br from-ai-soft to-white p-4">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-ai" />
              <p className="text-[13px] leading-[19px] text-ai-ink">选得越准，日报越像只为你一个人写的。之后随时可以在「我的画像」里修改。</p>
            </div>
          </div>
        )}
      </div>

      <BottomBar>
        {step === 0 && <Btn disabled={!s1} onClick={() => go(1)} className="flex-1">下一步</Btn>}
        {step === 1 && <><Btn kind="secondary" onClick={() => { toast('画像精度会下降'); go(2) }} className="!h-12 flex-1">稍后再说</Btn><Btn onClick={() => go(2)} className="flex-[2]">下一步</Btn></>}
        {step === 2 && <Btn disabled={!f.cs.length} onClick={finish} className="flex-1">生成我的画像 · 已选 {progress} 项</Btn>}
      </BottomBar>
    </div>
  )
}

export function Portrait() {
  const { tab, back } = useStore()
  const [done, setDone] = useState(false)
  const [line, setLine] = useState(0)
  useEffect(() => {
    const ts = [setTimeout(() => setLine(1), 1000), setTimeout(() => setLine(2), 2000), setTimeout(() => setDone(true), 3200)]
    return () => ts.forEach(clearTimeout)
  }, [])
  const steps = ['读政策', '比对同行', '生成本周重点']

  if (!done)
    return (
      <div className="relative flex min-h-full flex-col items-center overflow-hidden px-8 pt-[132px] text-center">
        <Aurora className="h-[520px]" />
        <div className="relative grid h-48 w-48 place-items-center">
          <span className="absolute inset-0 animate-[halo_2s_ease-out_infinite] rounded-full bg-brand/25" />
          <span className="absolute inset-0 animate-[halo_2s_ease-out_1s_infinite] rounded-full bg-ai/20" />
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white shadow-[0_20px_50px_-20px_rgba(46,91,255,0.6)]"><Orb size={64} /></div>
        </div>
        <h2 className="relative mt-10 text-[22px] font-bold tracking-tight">正在为你看一遍出海这件事</h2>
        <p className="relative mt-1 text-[13px] text-muted">大约需要 3 秒</p>
        <div className="relative mt-8 w-full space-y-2.5 text-left">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-[15px] transition-all duration-300 ${i <= line ? 'border-white bg-white/80 shadow-card' : 'border-transparent bg-white/40 text-subtle'}`}>
              {i < line ? <span className="grid h-5 w-5 place-items-center rounded-full bg-success"><Check size={12} strokeWidth={3} className="text-white" /></span>
                : i === line ? <Loader2 size={20} className="animate-spin text-brand" />
                  : <span className="h-5 w-5 rounded-full border-2 border-line" />}
              {s}
            </div>
          ))}
        </div>
      </div>
    )

  const insights = [
    [TrendingUp, '你的优势', '行动紧迫、模式已清晰', 'bg-success-soft text-success'],
    [CircleAlert, '最大短板', '本地化运营人才不足', 'bg-danger-soft text-danger'],
    [Lightbulb, '建议先做', '本月启动印尼清真认证', 'bg-brand-soft text-brand'],
  ] as const
  return (
    <div className="relative min-h-full overflow-hidden px-4 pb-10 pt-[60px]">
      <Aurora className="h-[420px]" />
      <div className="relative text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-[12px] font-medium text-brand backdrop-blur"><Sparkles size={12} />画像已生成</span>
        <h1 className="mt-3 text-[26px] font-bold tracking-tight">你的出海画像</h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand/30 ring-1 ring-brand" />你
          <span className="ml-2 inline-block w-4 border-t-2 border-dashed border-accent" />同行均值
        </p>
      </div>
      <div className="relative mt-4 rounded-[28px] border border-white bg-white/80 py-2 shadow-card backdrop-blur"><Radar {...radar} size={300} /></div>
      <div className="relative mt-3 space-y-2">
        {insights.map(([I, a, b, cls]) => (
          <div key={a} className="flex items-center gap-3 rounded-[20px] border border-line/70 bg-white p-3.5 shadow-card">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cls}`}><I size={18} /></span>
            <div><div className="text-[12px] text-muted">{a}</div><div className="text-[15px] font-semibold">{b}</div></div>
          </div>
        ))}
      </div>
      <Btn onClick={() => tab('home')} className="relative mt-6 w-full">看今天的日报</Btn>
      <Btn kind="secondary" onClick={back} className="relative mt-3 !h-12 w-full">修改关注点</Btn>
    </div>
  )
}
