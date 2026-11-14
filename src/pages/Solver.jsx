import { useRef, useState } from 'react'
import { ArrowLeft, Calculator, CheckCircle2, ChevronDown, CircleHelp, History, Info, BookOpen, FileText, TriangleAlert } from 'lucide-react'
import MathFormula from '../components/Math'
import Graph from '../components/Graph'
import { PageTitle } from './Learning'
import { examples } from '../content/course'
import { analysisExamples, proofReferences } from '../content/proofMethods'
import { createEvaluator } from '../math/solver'
import { displayExpression, solveProblem } from '../math/analysisSolver'

const fa = n => Number(n).toLocaleString('fa-IR')
const methodLabels = { epsilon: 'تعریف و برآورد ε–δ / M–δ', theorems: 'قضایای حد با فرض‌ها', squeeze: 'نامساوی و محصورسازی حد', sequential: 'معیار دنباله‌ای' }

export default function Solver({ graphOnly, history, addHistory }) {
  const [expression, setExpression] = useState('(x^2-4)/(x-2)')
  const [point, setPoint] = useState('2')
  const [variable, setVariable] = useState('x')
  const [direction, setDirection] = useState('both')
  const [mode, setMode] = useState('analysis')
  const [task, setTask] = useState('limit')
  const [method, setMethod] = useState('auto')
  const [patchPoint, setPatchPoint] = useState(false)
  const [pointValue, setPointValue] = useState('')
  const [answers, setAnswers] = useState(null)
  const [tab, setTab] = useState(graphOnly ? 'graph' : 'steps')
  const [plotted, setPlotted] = useState({ expression: '(x^2-4)/(x-2)', point: 2, variable: 'x', result: 4 })
  const inputRef = useRef(null)
  const answer = answers?.[mode]
  const infinitePoint = ['Infinity', '+Infinity', '-Infinity', '∞', '+∞', '-∞'].includes(point.trim())
  let preview
  try { preview = displayExpression(expression, variable) } catch {}
  const change = setter => event => { setter(event.target.value); setAnswers(null) }

  function calculate(event) {
    event?.preventDefault()
    const results = solveProblem(expression, point, variable, { direction, task, method, pointValue: patchPoint ? pointValue : '' })
    setAnswers(results)
    const proven = results.analysis.rigorous && ['solved', 'dne'].includes(results.analysis.status)
    const graphResult = proven ? results.analysis : results.computational
    if (graphResult.expression && graphResult.status !== 'error') {
      const numeric = graphResult.numericResult ?? (graphResult.result !== null ? Number(graphResult.result) : null)
      setPlotted({ expression: graphResult.expression, variable, point: graphResult.at, result: Number.isFinite(numeric) ? numeric : null, functionValue: results.analysis.functionValue ?? graphResult.functionValue, nonGraphable: !!results.analysis.nonGraphable })
    }
    setTab(graphOnly ? 'graph' : 'steps')
    const result = mode === 'analysis' ? results.analysis : results.computational
    if (['solved', 'dne'].includes(result.status)) addHistory({ expression: result.expression, point: result.point, variable, direction, mode, task, method, pointValue: patchPoint ? pointValue : '', result: result.result, status: result.status, timestamp: Date.now() })
  }

  function chooseExample(sample) {
    setExpression(sample.expression)
    setPoint(sample.point)
    setVariable(sample.variable || 'x')
    setDirection(sample.direction || 'both')
    setTask(sample.task || 'limit')
    setMethod(sample.method || 'auto')
    setPatchPoint(sample.pointValue !== undefined && sample.pointValue !== '')
    setPointValue(sample.pointValue || '')
    if (sample.mode) setMode(sample.mode)
    setAnswers(null)
  }

  function insert(text) {
    const input = inputRef.current
    const start = input.selectionStart ?? expression.length, end = input.selectionEnd ?? start
    setExpression(expression.slice(0, start) + text + expression.slice(end))
    setAnswers(null)
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + text.length, start + text.length) })
  }

  return <div className="page-enter">
    <PageTitle eyebrow={graphOnly ? 'رسم تابع' : 'حد و پیوستگی'} title={graphOnly ? 'آزمایشگاه نمودار' : 'حل تمرین'} text={graphOnly ? 'نمایش نمودار تابع و رفتار نزدیک نقطهٔ میل.' : 'حل آنالیزی با تعریف‌ها، فرض‌های قضیه‌ها و برهان؛ در کنار حل محاسباتی.'}>
      <span className="local-badge"><span className="dot sage" />پردازش محلی</span>
    </PageTitle>
    <div className="solver-layout">
      <div className="solver-main">
        <section className="input-panel">
          <div className="input-panel-heading"><span className="stat-icon peach"><Calculator size={20} /></span><div><h2>مسئله</h2><p>عبارت تابع و نوع بررسی را انتخاب کنید.</p></div><span className="soft-tag">بدون نیاز به اینترنت</span></div>
          <div className="solution-mode-switch" role="group" aria-label="شیوهٔ حل">
            <button type="button" aria-pressed={mode === 'analysis'} className={mode === 'analysis' ? 'selected' : ''} onClick={() => setMode('analysis')}><BookOpen size={16} />حل آنالیزی</button>
            <button type="button" aria-pressed={mode === 'computational'} className={mode === 'computational' ? 'selected' : ''} onClick={() => setMode('computational')}><Calculator size={16} />حل محاسباتی</button>
          </div>
          <form onSubmit={calculate}>
            <div className="solver-fields proof-options">
              <label htmlFor="problem-task">نوع مسئله<select id="problem-task" value={task} onChange={change(setTask)}><option value="limit">حد</option><option value="continuity">پیوستگی و نوع ناپیوستگی</option></select></label>
              <label htmlFor="proof-method">روش آنالیزی<select id="proof-method" value={method} disabled={mode !== 'analysis'} onChange={change(setMethod)}><option value="auto">انتخاب خودکارِ روش معتبر</option>{Object.entries(methodLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            </div>
            <label className="field-label" htmlFor="expression">عبارت تابع <span dir="ltr">f({variable})</span></label>
            <div className="expression-field"><span dir="ltr">f({variable}) =</span><input autoComplete="off" spellCheck="false" dir="ltr" id="expression" ref={inputRef} value={expression} onChange={change(setExpression)} placeholder="(x^2-4)/(x-2)" /></div>
            <div className="math-keyboard" dir="ltr">{[variable, '^2', '/', '(', ')', 'sqrt(', 'sin(', 'cos(', 'abs(', 'exp('].map((key, i) => <button key={i} type="button" onClick={() => insert(key)} aria-label={`افزودن ${key}`}>{key === 'sqrt(' ? '√' : key === '^2' ? 'x²' : key.endsWith('(') ? key.slice(0, -1) : key}</button>)}</div>
            <div className="solver-fields">
              <label htmlFor="variable">متغیر<select id="variable" value={variable} onChange={change(setVariable)}><option value="x">x</option><option value="t">t</option><option value="h">h</option></select></label>
              <label htmlFor="point">{task === 'continuity' ? 'نقطهٔ بررسی' : 'نقطهٔ میل'}<input id="point" dir="ltr" value={point} onChange={change(setPoint)} placeholder="2 یا Infinity" /></label>
              <label htmlFor="direction">جهت نزدیک‌شدن<select id="direction" value={task === 'continuity' || infinitePoint ? 'both' : direction} disabled={task === 'continuity' || infinitePoint} onChange={change(setDirection)}><option value="both">از هر دو طرف</option><option value="left">از چپ −</option><option value="right">از راست +</option></select></label>
            </div>
            <div className="point-definition">
              <label className="patch-checkbox"><input type="checkbox" checked={patchPoint} onChange={e => { setPatchPoint(e.target.checked); setAnswers(null) }} />بازتعریف مقدار تابع فقط در نقطهٔ بررسی</label>
              {patchPoint && <><label htmlFor="point-value">مقدار جدید <span dir="ltr">f(a)</span><input required id="point-value" dir="ltr" value={pointValue} onChange={change(setPointValue)} placeholder="مثلاً 0 یا 7" /></label><p>ضابطه برای x≠a همان عبارت بالاست. این مقدار، حد را تغییر نمی‌دهد و در حل آنالیزی برای بررسی پیوستگی و نمودار استفاده می‌شود.</p></>}
            </div>
            {preview && <div className="expression-preview"><span>پیش‌نمایش تابع</span><MathFormula>{`f(${variable})=${preview}`}</MathFormula></div>}
            <button className="button peach-button solve-button" type="submit">{graphOnly ? 'رسم و بررسی تابع' : mode === 'analysis' ? 'بررسی و نمایش برهان' : 'محاسبهٔ حد و نمایش مراحل'}<ArrowLeft size={18} /></button>
          </form>
          <details className="solver-help"><summary><CircleHelp size={15} />دامنهٔ روش‌های پیاده‌سازی‌شده<ChevronDown size={14} /></summary><p>حالت آنالیزی: گواهی ε–δ برای توابع گویا در نقطهٔ گویای دقیق، حدهای نامتناهی با M–δ، حد توابع گویا در بی‌نهایت با ε–B، حاصل‌ضرب عامل گویای صفرشونده در عامل‌های کراندار سینوسی/کسینوسی، حد بنیادی سینوسی، معیار دنباله‌ای در نمونه‌های نوسانی، جزءصحیحِ تابع گویا در عدد صحیح، و قضایای ترکیب با فرض‌های نمادیِ تأییدشده.</p><p>مثال‌های جزوه با rationalSplit(x) یعنی x روی گویاها و صفر روی گنگ‌ها، و dirichlet(x) یعنی ۱ روی گویاها و −۱ روی گنگ‌ها در دسترس‌اند. نمودار عددی برای این دو تابع ارائه نمی‌شود.</p><p>در حالت محاسباتی، روش‌های قبلی حفظ شده‌اند. تقریب و نمودار، اثبات نیستند. انتخاب روش نامتناسب یا اثبات پیاده‌سازی‌نشده صریحاً پیام محدودیت می‌دهد؛ حالت محاسباتی پنهانی جای برهان را نمی‌گیرد.</p></details>
        </section>
        {answer?.status === 'error' && <div className="feedback error" role="alert"><TriangleAlert size={21} /><div><b>ورودی نیاز به اصلاح دارد</b><p>{answer.message}</p></div></div>}
        {answer?.status === 'unsupported' && <div className="feedback limitation" role="status"><Info size={21} /><div><b>{mode === 'analysis' ? 'برهان مورد درخواست در دامنهٔ فعلی نیست' : 'این محاسبه پشتیبانی نشده است'}</b><p>{answer.message}</p></div></div>}
        <section className="solution-panel">
          <div className="solution-tabs" role="tablist" aria-label="نمایش نتیجه">{[['steps', mode === 'analysis' ? 'برهان آنالیزی' : 'راه‌حل محاسباتی'], ['graph', 'نمودار تابع'], ['table', 'جدول نزدیک‌شدن']].map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
          {tab === 'steps' && <div className="solution-content">
            {!answer || answer.status === 'error' ? <div className="solution-empty"><span><BookOpen size={29} /></span><h3>هنوز بررسی انجام نشده است</h3><p>عبارت، نقطه و روش را انتخاب کنید و دکمهٔ بررسی را بزنید.</p></div> : <>
              <div className="solution-problem"><span className="eyebrow">{task === 'continuity' ? 'بررسی پیوستگی در نقطهٔ مشخص' : 'حد مورد بررسی'}</span><MathFormula>{`\\lim_{${answer.variable || variable}\\to ${answer.pointTex}${answer.direction === 'left' ? '^-' : answer.direction === 'right' ? '^+' : ''}}${answer.tex}`}</MathFormula></div>
              {mode === 'analysis' && answer.rigorous && <div className="proof-methods"><span>روش‌های برهان</span>{answer.methods?.map(id => <b key={id}>{methodLabels[id]}</b>)}</div>}
              {mode === 'computational' && task === 'continuity' && <p className="proof-scope-note">این حالت مقدار حد را محاسبه می‌کند. برای اثبات پیوستگی یا ناپیوستگی، حالت «حل آنالیزی» را انتخاب کنید.</p>}
              <SolutionSteps steps={answer.steps} />
              {['solved', 'dne'].includes(answer.status) && <SolutionSummary answer={answer} continuity={mode === 'analysis' && task === 'continuity'} />}
              {mode === 'analysis' && answer.references?.length > 0 && <ProofReferences answer={answer} />}
            </>}
          </div>}
          {tab === 'graph' && (plotted.nonGraphable ? <div className="empty-state">نمودار نمونه‌برداری معمول، گویا و گنگ را تشخیص نمی‌دهد؛ برای این تابع نمودار گمراه‌کننده رسم نمی‌شود.</div> : <Graph {...plotted} />)}
          {tab === 'table' && (plotted.nonGraphable ? <div className="empty-state">برای تابع تفکیک‌شده بر گویا و گنگ، جدول عددی معتبر ارائه نمی‌شود.</div> : <ApproachTable {...plotted} />)}
        </section>
      </div>
      <aside className="solver-aside">
        <section className="examples-panel"><span className="eyebrow">انتخاب یک مسئله</span><h3>{mode === 'analysis' ? 'نمونه‌های روش آنالیزی' : 'نمونه‌های محاسباتی'}</h3>{(mode === 'analysis' ? analysisExamples : examples).map((sample, i) => <button key={i} onClick={() => chooseExample(sample)}><span>{sample.label}</span><MathFormula>{`\\lim_{x\\to ${sample.point === 'Infinity' ? '\\infty' : sample.point}}${displayExpression(sample.expression)}`}</MathFormula><ArrowLeft size={15} /></button>)}</section>
        <section className="solver-note"><span className="note-icon"><Info size={19} /></span><h3>مرز برهان و محاسبه</h3><p>قضیه، فرض‌های کاربرد و منبع آن کنار برهان مشخص‌اند. برهانِ ساخته‌شده برای ورودی، نقلِ اثبات استاد نیست. نتیجهٔ عددی به‌عنوان اثبات معرفی نمی‌شود.</p></section>
        {history.length > 0 && <section className="history-panel"><h3><History size={17} />تمرین‌های اخیر</h3>{history.slice(0, 5).map((h, i) => <button key={i} onClick={() => chooseExample(h)}><span dir="ltr">{h.expression}</span><small dir="ltr">{h.variable} → {h.point}</small></button>)}</section>}
      </aside>
    </div>
  </div>
}

function SolutionSteps({ steps = [] }) {
  return steps.map((step, i) => <div className="solution-step" key={i}><span className="step-number">{fa(i + 1)}</span><div><h3>{step.title}</h3><p>{step.text}</p>{step.math && <MathFormula>{step.math}</MathFormula>}{step.supplement && <p className="step-supplement">{step.supplement}</p>}{step.reference && <span className="step-reference">{proofReferences[step.reference]?.supplemental ? 'قضیهٔ استاندارد تکمیلی' : `بر پایهٔ جزوهٔ ${fa(proofReferences[step.reference]?.file)}، صفحهٔ ${fa(proofReferences[step.reference]?.page)}`}</span>}</div></div>)
}

function SolutionSummary({ answer, continuity }) {
  const result = answer.continuity
  return <div className={`final-answer ${answer.status === 'dne' || (continuity && result?.status !== 'continuous') ? 'answer-dne' : ''}`}><CheckCircle2 size={23} /><div>
    <b>{continuity && result ? result.title : answer.status === 'dne' ? 'حد مورد نظر وجود ندارد' : answer.result?.includes('infty') ? answer.rigorous ? 'رفتار نامتناهی تابع ثابت شد' : 'نتیجهٔ نامتناهیِ محاسباتی' : answer.rigorous ? 'نتیجهٔ برهان' : 'نتیجهٔ محاسباتی'}{answer.approximate ? ' · مقدار عددی تقریبی' : ''}</b>
    {answer.status === 'solved' && <MathFormula>{`\\lim_{${answer.variable}\\to ${answer.pointTex}${answer.direction === 'left' ? '^-' : answer.direction === 'right' ? '^+' : ''}}f(${answer.variable})=${answer.result}`}</MathFormula>}
    {Number.isFinite(answer.at) && <div className="one-sided-results"><span>حد چپ <MathFormula block={false}>{answer.left ?? '\\nexists'}</MathFormula></span><span>حد راست <MathFormula block={false}>{answer.right ?? '\\nexists'}</MathFormula></span></div>}
    {continuity && result && <p>{result.explanation}</p>}
    {answer.result?.includes('infty') && <p>{answer.rigorous ? 'این نتیجه حد متناهی حقیقی نیست؛ معنای نامتناهی آن با تعریف M بررسی شده است.' : 'این نتیجه حد متناهی حقیقی نیست. برای مشاهدهٔ برهان، حالت حل آنالیزی را انتخاب کنید.'}</p>}
  </div></div>
}

function ProofReferences({ answer }) {
  return <details className="proof-references"><summary><FileText size={15} />منابع، فرض‌ها و منشأ برهان</summary><p>{answer.proofOrigin}</p><ul>{answer.references.map(ref => <li key={ref.id}>{ref.supplemental ? <span>{ref.label}</span> : <a href={`/materials/${ref.file}.pdf#page=${ref.page}`} target="_blank" rel="noreferrer">جزوهٔ {fa(ref.file)}، صفحهٔ {fa(ref.page)}: {ref.label}</a>}</li>)}</ul></details>
}

function ApproachTable({ expression, variable, point }) {
  let evaluate
  try { evaluate = createEvaluator(expression, variable) } catch { return <div className="empty-state">تابع معتبر وارد کنید.</div> }
  if (!Number.isFinite(point)) return <div className="empty-state">جدول نزدیک‌شدن برای نقطهٔ میل متناهی در دسترس است.</div>
  const value = x => { const y = evaluate(x); return typeof y === 'number' && Number.isFinite(y) ? Number(y.toPrecision(9)).toString() : 'تعریف‌نشده' }
  return <div className="approach-table-wrap"><p>این اعداد تقریبی‌اند و وجود حد را اثبات نمی‌کنند.</p><div className="table-scroll"><table className="approach-table"><thead><tr><th>فاصله تا نقطه</th><th>ورودی از چپ</th><th>خروجی از چپ</th><th>ورودی از راست</th><th>خروجی از راست</th></tr></thead><tbody>{[0.1, 0.01, 0.001, 0.0001, 0.00001].map(d => <tr key={d}><td dir="ltr">{d}</td><td dir="ltr">{Number((point - d).toPrecision(10))}</td><td dir="ltr">{value(point - d)}</td><td dir="ltr">{Number((point + d).toPrecision(10))}</td><td dir="ltr">{value(point + d)}</td></tr>)}</tbody></table></div></div>
}