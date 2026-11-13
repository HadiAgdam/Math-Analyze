import { ArrowUpLeft, BookOpen, Bookmark, Calculator, ChartNoAxesCombined, ChevronLeft, Download, FileText, Infinity, LayoutDashboard, LibraryBig, X } from 'lucide-react'

export const navigation = [
  { id: 'dashboard', title: 'پیشخوان', icon: LayoutDashboard },
  { id: 'lessons', title: 'مباحث آموزشی', icon: BookOpen },
  { id: 'formulas', title: 'فرمول‌ها', icon: LibraryBig },
  { id: 'solver', title: 'حل تمرین', icon: Calculator },
  { id: 'graph', title: 'نمودار توابع', icon: ChartNoAxesCombined },
  { id: 'saved', title: 'ذخیره‌شده‌ها', icon: Bookmark }
]

export default function Sidebar({ page, navigate, open, close, progress, install, installReady }) {
  return <>
    {open && <button className="sidebar-overlay" onClick={close} aria-label="بستن منو" />}
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <a href="#dashboard" className="brand" onClick={() => navigate('dashboard')}><span className="brand-symbol"><Infinity size={32} strokeWidth={2} /></span><div><strong>آنالیز<span className="brand-period">.</span></strong><small>آنالیز ریاضی</small></div></a>
      <button className="mobile-close icon-button" onClick={close} aria-label="بستن منو"><X size={20} /></button>
      <div className="sidebar-label">فضای یادگیری</div>
      <nav aria-label="ناوبری اصلی">{navigation.map(({ id, title, icon: Icon }) => <button key={id} className={`nav-item ${page === id || (page === 'lesson' && id === 'lessons') ? 'active' : ''}`} onClick={() => navigate(id)}><Icon size={20} strokeWidth={1.8} /><span>{title}</span>{page === id && <span className="active-dot" />}</button>)}</nav>
      <div className="sidebar-divider" />
      <div className="sidebar-label">درس‌های من</div>
      <button className="subject-link" onClick={() => navigate('lessons')}><span className="subject-dot" /><span>حد و پیوستگی</span><ChevronLeft size={15} /></button>
      <button className="source-link" onClick={() => navigate('sources')}><FileText size={17} />جزوه‌های مرجع<ArrowUpLeft size={14} /></button>
      <div className="sidebar-bottom">
        <div className="journey-card"><span className="eyebrow">پیشرفت مطالعه</span><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{fa(progress)}٪ از مباحث خوانده شده</small></div>
        <button className="install-button" onClick={install}><Download size={18} /><span>{installReady ? 'نصب برنامه' : 'راهنمای نصب برنامه'}</span></button>
        <div className="sidebar-footer"><span className="tiny-logo">∞</span> آنالیز ریاضی</div>
      </div>
    </aside>
  </>
}

function fa(n) { return Number(n).toLocaleString('fa-IR') }
