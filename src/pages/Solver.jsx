import { useRef, useState } from 'react'
import { ArrowLeft, Calculator, CheckCircle2, ChevronDown, CircleHelp, Clock3, History, Info, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import MathFormula from '../components/Math'
import Graph from '../components/Graph'
import { PageTitle } from './Learning'
import { examples } from '../content/course'
import { createEvaluator, parseExpression, solveLimit } from '../math/solver'

const fa = n => Number(n).toLocaleString('fa-IR')

export default function Solver({ graphOnly, history, addHistory }) {
  const [expression, setExpression] = useState('(x^2-4)/(x-2)')
  const [point, setPoint] = useState('2')
  const [variable, setVariable] = useState('x')
  const [direction, setDirection] = useState('both')
  const [answer, setAnswer] = useState(null)
  const [tab, setTab] = useState(graphOnly ? 'graph' : 'steps')
  const [plotted, setPlotted] = useState({ expression: '(x^2-4)/(x-2)', point: 2, variable: 'x', result: 4 })
  const inputRef = useRef(null)
  let preview = null
  try { preview = parseExpression(expression, variable).tex } catch {}
  function calculate(e) {
    e?.preventDefault()
    const result = solveLimit(expression, point, variable, direction)
    setAnswer(result)
    if (!['error'].includes(result.status)) {
      const numeric = result.numericResult ?? (result.status === 'solved' && result.result !== null && !result.result.includes('infty') ? Number(result.result) : null)
      setPlotted({ expression: result.expression, variable, point: result.at, result: Number.isFinite(numeric) ? numeric : null, functionValue: result.functionValue })
    }
    setTab(graphOnly ? 'graph' : 'steps')
    if (result.status === 'solved' || result.status === 'dne') addHistory({ expression: result.expression, point: result.point, variable, direction, result: result.result, status: result.status, timestamp: Date.now() })
  }
  function chooseExample(sample) {
    setExpression(sample.expression)
    setPoint(sample.point)
    setVariable(sample.variable || 'x')
    setDirection(sample.direction || 'both')
    setAnswer(null)
  }
  function insert(text) {
    const input = inputRef.current
    const start = input.selectionStart ?? expression.length, end = input.selectionEnd ?? start
    setExpression(expression.slice(0, start) + text + expression.slice(end))
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + text.length, start + text.length) })
  }
  return <div className="page-enter"><PageTitle eyebrow={graphOnly ? 'رسم تابع' : 'محاسبهٔ حد'} title={graphOnly ? 'آزمایشگاه نمودار' : 'حل تمرین'} text={graphOnly ? 'نمایش نمودار تابع، نقطهٔ میل و مقادیر نزدیک آن از دو سمت.' : 'محاسبهٔ حد با نمایش مراحل حل و حدهای یک‌طرفه.'}><span className="local-badge"><span className="dot sage" />محاسبه روی دستگاه شما</span></PageTitle><div className="solver-layout"><div className="solver-main"><section className="input-panel"><div className="input-panel-heading"><span className="stat-icon peach"><Calculator size={20} /></span><div><h2>مسئلهٔ شما</h2><p>از نوشتار ریاضی ساده استفاده کنید.</p></div><span className="soft-tag">بدون نیاز به اینترنت</span></div><form onSubmit={calculate}><label className="field-label" htmlFor="expression">عبارت تابع <span dir="ltr">f({variable})</span></label><div className="expression-field"><span dir="ltr">f({variable}) =</span><input autoComplete="off" spellCheck="false" dir="ltr" id="expression" ref={inputRef} value={expression} onChange={e => { setExpression(e.target.value); setAnswer(null) }} placeholder="(x^2-4)/(x-2)" /></div><div className="math-keyboard" dir="ltr">{[variable, '^2', '/', '(', ')', 'sqrt(', 'sin(', 'cos(', 'abs(', 'exp('].map((key, i) => <button key={i} type="button" onClick={() => insert(key)} aria-label={`افزودن ${key}`}>{key === 'sqrt(' ? '√' : key === '^2' ? 'x²' : key.endsWith('(') ? key.slice(0, -1) : key}</button>)}</div><div className="solver-fields"><label htmlFor="variable">متغیر<select id="variable" value={variable} onChange={e => { setVariable(e.target.value); setAnswer(null) }}><option value="x">x</option><option value="t">t</option><option value="h">h</option></select></label><label htmlFor="point">نقطهٔ میل<input id="point" dir="ltr" value={point} onChange={e => { setPoint(e.target.value); setAnswer(null) }} placeholder="2 یا Infinity" /></label><label htmlFor="direction">جهت نزدیک‌شدن<select id="direction" value={direction} onChange={e => { setDirection(e.target.value); setAnswer(null) }}><option value="both">از هر دو طرف</option><option value="left">از چپ −</option><option value="right">از راست +</option></select></label></div>{preview && <div className="expression-preview"><span>پیش‌نمایش تابع</span><MathFormula>{`f(${variable})=${preview}`}</MathFormula></div>}<button className="button peach-button solve-button" type="submit">{graphOnly ? 'رسم و بررسی تابع' : 'محاسبهٔ حد و نمایش مراحل'}<ArrowLeft size={18} /></button></form><details className="solver-help"><summary><CircleHelp size={15} />چه عبارت‌هایی پشتیبانی می‌شوند؟<ChevronDown size={14} /></summary><p>توابع گویا با ضرایب عددی و توان صحیح تا ۱۲، ترکیب‌های پیوسته در داخل دامنه، sin(kx)/x، (1−cos(kx))/x²، (exp(kx)−1)/x و log(1+kx)/x در صفر، abs(x)/x و sin(1/x) یا cos(1/x) در صفر. برای بی‌نهایت از Infinity یا -Infinity استفاده کنید. زاویه‌ها رادیان‌اند.</p><p>عبارت‌های قطعه‌ای، پارامترهای نمادی، رادیکال‌های مبهم و حالت‌های عمومی خارج از این دامنه ممکن است حل نشوند. جدول و نمودار فقط ابزار مشاهده‌اند.</p></details></section>
      {answer?.status === 'error' && <div className="feedback error" role="alert"><TriangleAlert size={21} /><div><b>ورودی نیاز به اصلاح دارد</b><p>{answer.message}</p></div></div>}
      {answer?.status === 'unsupported' && <div className="feedback limitation" role="status"><Info size={21} /><div><b>این حد هنوز در دامنهٔ حل‌گر نیست</b><p>{answer.message}</p></div></div>}
      <section className="solution-panel"><div className="solution-tabs" role="tablist" aria-label="نمایش نتیجه"><button role="tab" aria-selected={tab === 'steps'} className={tab === 'steps' ? 'selected' : ''} onClick={() => setTab('steps')}>راه‌حل مرحله‌ای</button><button role="tab" aria-selected={tab === 'graph'} className={tab === 'graph' ? 'selected' : ''} onClick={() => setTab('graph')}>نمودار تابع</button><button role="tab" aria-selected={tab === 'table'} className={tab === 'table' ? 'selected' : ''} onClick={() => setTab('table')}>جدول نزدیک‌شدن</button></div>{tab === 'steps' && <div className="solution-content">{!answer || answer.status === 'error' ? <div className="solution-empty"><span><Sparkles size={29} /></span><h3>راه‌حلی محاسبه نشده است</h3><p>پس از وارد کردن عبارت و نقطهٔ میل،<br />دکمهٔ محاسبه را بزنید.</p></div> : <><div className="solution-problem"><span className="eyebrow">مسئله‌ای که بررسی می‌کنیم</span><MathFormula>{`\\lim_{${variable}\\to ${answer.pointTex}${direction === 'left' ? '^-' : direction === 'right' ? '^+' : ''}}${answer.tex}`}</MathFormula></div>{answer.steps?.map((step, i) => <div className="solution-step" key={i}><span className="step-number">{fa(i + 1)}</span><div><h3>{step.title}</h3><p>{step.text}</p>{step.math && <MathFormula>{step.math}</MathFormula>}</div></div>)}{['solved', 'dne'].includes(answer.status) && <div className={`final-answer ${answer.status === 'dne' ? 'answer-dne' : ''}`}><CheckCircle2 size={23} /><div><b>{answer.status === 'dne' ? 'حد مورد نظر وجود ندارد' : answer.result?.includes('infty') ? 'تابع به بی‌نهایت میل می‌کند' : 'نتیجهٔ نهایی'}{answer.approximate ? ' · مقدار تقریبی' : ''}</b>{answer.status === 'solved' && <MathFormula>{`\\lim_{${variable}\\to ${answer.pointTex}${direction === 'left' ? '^-' : direction === 'right' ? '^+' : ''}}f(${variable})=${answer.result}`}</MathFormula>}{!Number.isFinite(answer.at) ? null : <div className="one-sided-results"><span>حد چپ <MathFormula block={false}>{answer.left ?? '\\nexists'}</MathFormula></span><span>حد راست <MathFormula block={false}>{answer.right ?? '\\nexists'}</MathFormula></span></div>}{answer.result?.includes('infty') && <p>این نتیجه حد متناهی حقیقی نیست؛ رفتار نامتناهی تابع را بیان می‌کند.</p>}</div></div>}{answer.status === 'unsupported' && <p className="muted">برای این عبارت راه‌حل مطمئن ارائه نشده است. می‌توانید رفتار عددی را در دو زبانهٔ دیگر مشاهده کنید.</p>}</>}</div>}{tab === 'graph' && <Graph {...plotted} />}{tab === 'table' && <ApproachTable {...plotted} />}</section></div><aside className="solver-aside"><section className="examples-panel"><span className="eyebrow">برای شروع، یکی را انتخاب کنید</span><h3>چند مسئلهٔ پیشنهادی</h3>{examples.map((sample, i) => <button key={i} onClick={() => chooseExample(sample)}><span>{sample.label}</span><MathFormula>{`\\lim_{x\\to ${sample.point === 'Infinity' ? '\\infty' : sample.point}}${parseExpression(sample.expression).tex}`}</MathFormula><ArrowLeft size={15} /></button>)}</section><section className="solver-note"><span className="note-icon"><Info size={19} /></span><h3>دامنهٔ پشتیبانی حل‌گر</h3><p>برای عبارت‌های خارج از دامنهٔ پشتیبانی، پیام محدودیت نمایش داده می‌شود. جدول عددی و نمودار برای بررسی رفتار تابع‌اند.</p></section>{history.length > 0 && <section className="history-panel"><h3><History size={17} />تمرین‌های اخیر</h3>{history.slice(0, 5).map((h, i) => <button key={i} onClick={() => chooseExample(h)}><span dir="ltr">{h.expression}</span><small dir="ltr">{h.variable} → {h.point}</small></button>)}</section>}</aside></div></div>
}

function ApproachTable({ expression, variable, point }) {
  let evaluate
  try { evaluate = createEvaluator(expression, variable) } catch { return <div className="empty-state">تابع معتبر وارد کنید.</div> }
  if (!Number.isFinite(point)) return <div className="empty-state">جدول نزدیک‌شدن برای نقطهٔ میل متناهی در دسترس است.</div>
  const value = x => { try { const y = evaluate(x); return typeof y === 'number' && Number.isFinite(y) ? Number(y.toPrecision(9)).toString() : 'تعریف‌نشده' } catch { return 'تعریف‌نشده' } }
  return <div className="approach-table-wrap"><p>فاصله‌ها کوچک‌تر می‌شوند؛ این اعداد تقریبی‌اند و وجود حد را اثبات نمی‌کنند.</p><div className="table-scroll"><table className="approach-table"><thead><tr><th>فاصله تا نقطه</th><th>ورودی از چپ</th><th>خروجی از چپ</th><th>ورودی از راست</th><th>خروجی از راست</th></tr></thead><tbody>{[0.1, 0.01, 0.001, 0.0001, 0.00001].map(d => <tr key={d}><td dir="ltr">{d}</td><td dir="ltr">{Number((point - d).toPrecision(10))}</td><td dir="ltr">{value(point - d)}</td><td dir="ltr">{Number((point + d).toPrecision(10))}</td><td dir="ltr">{value(point + d)}</td></tr>)}</tbody></table></div></div>
}
