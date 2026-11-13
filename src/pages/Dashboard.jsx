import { ArrowLeft, ArrowUpLeft, BookOpen, Calculator, Check, ChevronLeft, Clock3, FileText, Lightbulb, MoveLeft, Sigma, Sparkles } from 'lucide-react'
import Graph from '../components/Graph'
import MathFormula from '../components/Math'
import { formulas, lessons } from '../content/course'

const fa = n => n.toLocaleString('fa-IR')

export default function Dashboard({ navigate, completed, recent, openLesson, solvedCount }) {
  const next = lessons.find(l => !completed.includes(l.id)) || lessons[0]
  const percent = Math.round(completed.length / lessons.length * 100)
  return <div className="page-enter dashboard">
    <div className="welcome-line"><div><div className="eyebrow">آنالیز ریاضی</div><h1>پیشخوان</h1><p>دسترسی به درس‌ها، فرمول‌ها، حل تمرین و نمودار توابع.</p></div><span className="semester-tag"><span className="dot sage" />آنالیز ریاضی · فصل اول</span></div>
    <section className="hero-panel" aria-labelledby="hero-title">
      <div className="hero-copy"><div className="hero-badge"><span className="pulse-dot" />فصل اول</div><h2 id="hero-title">حد و پیوستگی</h2><p>تعریف حد، پیوستگی در فضای متری، فشردگی،<br />پیوستگی یکنواخت و حدهای یک‌طرفه.</p><div className="hero-actions"><button className="button dark" onClick={() => openLesson(next.id)}>{completed.length ? 'ادامهٔ مطالعه' : 'مشاهدهٔ درس اول'}<ArrowLeft size={18} /></button><button className="hero-text-button" onClick={() => navigate('solver')}>حل تمرین<ArrowUpLeft size={16} /></button></div><div className="hero-meta"><span><BookOpen size={14} />۱۲ مبحث آموزشی</span><i /><span><FileText size={14} />بر اساس جزوه‌های درس</span></div></div>
      <div className="hero-visual"><div className="hero-graph-label"><span className="graph-title-small">حد تابع گویا</span><span className="graph-mini-tag">مثال</span></div><MathFormula>{String.raw`\lim_{x\to2}\frac{x^2-4}{x-2}=4`}</MathFormula><Graph compact /><span className="hero-graph-caption">تابع در ۲ تعریف نشده؛ اما حد آن وجود دارد.</span></div>
    </section>
    <div className="stats-grid">
      <Stat icon={BookOpen} title="مباحث آموزشی" value="۱۲" unit="مبحث" subtitle="از تعریف حد تا توابع یکنوا" color="peach" />
      <Stat icon={Sigma} title="جعبه‌ابزار ریاضی" value={fa(formulas.length)} unit="فرمول" subtitle="قوانین و حدهای ویژه" color="sage" />
      <Stat icon={Calculator} title="تمرین‌های شما" value={fa(solvedCount)} unit="محاسبه" subtitle="محاسبه‌های ثبت‌شده در این دستگاه" color="lilac" />
      <div className="stat-card progress-stat"><div className="progress-ring" style={{ '--progress': `${percent * 3.6}deg` }}><b>{fa(percent)}<small>٪</small></b></div><div><span className="stat-label">پیشرفت شما</span><strong>{fa(completed.length)} از ۱۲ مبحث</strong><small>مباحث علامت‌خورده به‌عنوان خوانده‌شده</small></div></div>
    </div>
    <div className="dashboard-columns">
      <section className="learning-section"><div className="section-heading"><div><span className="eyebrow">فصل اول</span><h2>مباحث حد و پیوستگی</h2></div><button className="text-button" onClick={() => navigate('lessons')}>همهٔ مباحث<ChevronLeft size={16} /></button></div><div className="topic-list">{lessons.slice(0, 4).map((lesson, i) => <button className="topic-row" key={lesson.id} onClick={() => openLesson(lesson.id)}><span className={`topic-number ${completed.includes(lesson.id) ? 'finished' : ''}`}>{completed.includes(lesson.id) ? <Check size={19} /> : fa(i + 1).padStart(2, '۰')}</span><span className="topic-row-text"><b>{lesson.short}</b><small>{i === 0 ? 'تعریف حد با ε و δ در فضای متری' : i === 1 ? 'معیار دنباله‌ای و یکتایی حد' : i === 2 ? 'قوانین جمع، تفاضل، ضرب و تقسیم' : 'تعریف پیوستگی و ترکیب توابع'}</small></span><span className="topic-time"><Clock3 size={13} />{fa(lesson.minutes)} دقیقه</span><ChevronLeft size={17} /></button>)}</div><button className="course-footer" onClick={() => navigate('lessons')}><span className="dot sage" />مشاهدهٔ همهٔ ۱۲ مبحث<MoveLeft size={19} /></button></section>
      <section className="practice-card"><span className="practice-icon"><Sparkles size={22} /></span><span className="eyebrow">حل تمرین</span><h2>محاسبهٔ حد</h2><p>ورود عبارت، بررسی حدهای یک‌طرفه<br />و نمایش مراحل حل.</p><div className="practice-formula"><MathFormula>{String.raw`\lim_{x\to2}\frac{x^2-4}{x-2}=?`}</MathFormula></div><button className="button peach-button" onClick={() => navigate('solver')}>حل این تمرین<ArrowLeft size={17} /></button></section>
    </div>
    <div className="dashboard-bottom"><section className="daily-formula"><div className="section-heading"><h3><Lightbulb size={19} />تفاوت حد و پیوستگی</h3><span className="soft-tag">مفهوم کلیدی</span></div><p>وجود حد به مقدار تابع در خود نقطه وابسته نیست.</p><MathFormula>{String.raw`\lim_{x\to a}f(x)=L\quad\not\Rightarrow\quad f(a)=L`}</MathFormula><button className="text-button" onClick={() => openLesson('continuity')}>تفاوت حد و پیوستگی را بخوانید<ArrowUpLeft size={15} /></button></section><section className="recent-card"><h3>{recent.length ? 'آخرین مطالعهٔ شما' : 'درس اول'}</h3><p>{recent.length ? lessons.find(l => l.id === recent[0])?.title : 'تعریف حد در فضای متری و شرط وجود آن.'}</p><button className="text-button" onClick={() => openLesson(recent[0] || 'limit')}>{recent.length ? 'بازگشت به درس' : 'ورود به اولین درس'}<ArrowLeft size={15} /></button><span className="background-symbol">ε</span></section></div>
    <footer className="main-footer"><span>آنالیز ریاضی</span><span>ذخیره‌سازی محلی <span className="footer-dot">•</span> بدون نیاز به حساب کاربری</span></footer>
  </div>
}

function Stat({ icon: Icon, title, value, unit, subtitle, color }) {
  return <div className="stat-card"><span className={`stat-icon ${color}`}><Icon size={22} strokeWidth={1.7} /></span><div><span className="stat-label">{title}</span><strong>{value}<small>{unit}</small></strong><small>{subtitle}</small></div></div>
}
