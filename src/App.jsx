import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Check, ChevronLeft, Download, Infinity, Menu, Search, Sigma, Wifi, WifiOff, X } from 'lucide-react'
import Sidebar, { navigation } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { FormulasPage, LessonPage, LessonsPage, SavedPage, SourcesPage } from './pages/Learning'
import Solver from './pages/Solver'
import useLocalStorage from './hooks/useLocalStorage'
import { formulas, lessons } from './content/course'

const validPages = ['dashboard', 'lessons', 'lesson', 'formulas', 'solver', 'graph', 'saved', 'sources']
function getRoute() {
  const [page, id] = location.hash.slice(1).split('/')
  return { page: validPages.includes(page) ? page : 'dashboard', id: page === 'formulas' && formulas.some(f => f.id === id) ? id : lessons.some(l => l.id === id) ? id : 'limit' }
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [installEvent, setInstallEvent] = useState(null)
  const [installHelp, setInstallHelp] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [completedRaw, setCompleted] = useLocalStorage('analyz-completed', [])
  const completed = completedRaw.filter(id => lessons.some(l => l.id === id))
  const [recent, setRecent] = useLocalStorage('analyz-recent', [])
  const [bookmarks, setBookmarks] = useLocalStorage('analyz-bookmarks', [])
  const [history, setHistory] = useLocalStorage('analyz-history', [])
  const searchRef = useRef(null)
  const dialogRef = useRef(null)
  const searchResults = [
    ...lessons.map(l => ({ type: 'lesson', id: l.id, label: l.short, sub: l.category })),
    ...formulas.map(f => ({ type: 'formula', id: f.id, label: f.title, sub: 'فرمول' }))
  ].filter(r => `${r.label} ${r.sub}`.includes(search)).slice(0, 9)
  useEffect(() => {
    const hash = () => { setRoute(getRoute()); window.scrollTo(0, 0) }
    const install = e => { e.preventDefault(); setInstallEvent(e) }
    const installed = () => setInstallEvent(null)
    const connectivity = () => setOnline(navigator.onLine)
    window.addEventListener('hashchange', hash)
    window.addEventListener('beforeinstallprompt', install)
    window.addEventListener('appinstalled', installed)
    window.addEventListener('online', connectivity)
    window.addEventListener('offline', connectivity)
    return () => { window.removeEventListener('hashchange', hash); window.removeEventListener('beforeinstallprompt', install); window.removeEventListener('appinstalled', installed); window.removeEventListener('online', connectivity); window.removeEventListener('offline', connectivity) }
  }, [])
  useEffect(() => {
    if (route.page === 'lesson') setRecent(previous => [route.id, ...previous.filter(id => id !== route.id)].slice(0, 6))
  }, [route.page, route.id])
  useEffect(() => {
    const dialog = dialogRef.current
    if (searchOpen || installHelp) { dialog?.showModal(); if (searchOpen) searchRef.current?.focus() }
    else dialog?.close()
  }, [searchOpen, installHelp])
  const navigate = page => { location.hash = page; setMenuOpen(false) }
  const openLesson = id => { location.hash = `lesson/${id}`; setMenuOpen(false); setSearchOpen(false) }
  const toggleComplete = id => setCompleted(current => current.includes(id) ? current.filter(v => v !== id) : [...current, id])
  const toggleBookmark = id => setBookmarks(current => current.includes(id) ? current.filter(v => v !== id) : [...current, id])
  async function install() {
    if (installEvent) { await installEvent.prompt(); await installEvent.userChoice; setInstallEvent(null) }
    else setInstallHelp(true)
  }
  const pageTitle = navigation.find(n => n.id === route.page)?.title || (route.page === 'lesson' ? 'مباحث آموزشی' : 'جزوه‌های مرجع')
  return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content').focus() }}>رفتن به محتوای اصلی</a><Sidebar page={route.page} navigate={navigate} open={menuOpen} close={() => setMenuOpen(false)} progress={Math.round(completed.length / lessons.length * 100)} install={install} installReady={!!installEvent} /><div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="باز کردن منو"><Menu size={21} /></button><span>فضای یادگیری من</span><ChevronLeft size={14} /><b>{pageTitle}</b></div><div className="topbar-actions"><button className="global-search" aria-label="جست‌وجوی سراسری" onClick={() => { setSearch(''); setSearchOpen(true) }}><Search size={17} /><span>دنبال چه مفهومی هستید؟</span><span className="search-key">جست‌وجو</span></button><span className={`connectivity ${!online ? 'offline' : ''}`} title={online ? 'متصل به شبکه' : 'در حالت آفلاین'}>{online ? <Wifi size={17} /> : <WifiOff size={17} />}<span>{online ? 'متصل به شبکه' : 'حالت آفلاین'}</span></span><span className="avatar" aria-label="فضای شخصی محلی">م</span></div></header><main id="main-content" tabIndex={-1} className="main-content">{route.page === 'dashboard' && <Dashboard navigate={navigate} openLesson={openLesson} completed={completed} recent={recent} solvedCount={history.length} />}{route.page === 'lessons' && <LessonsPage openLesson={openLesson} completed={completed} />}{route.page === 'lesson' && <LessonPage key={route.id} id={route.id} openLesson={openLesson} completed={completed} toggleComplete={toggleComplete} bookmarks={bookmarks} toggleBookmark={toggleBookmark} navigate={navigate} />}{route.page === 'formulas' && <FormulasPage initialId={route.id} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}{(route.page === 'solver' || route.page === 'graph') && <Solver key={route.page} graphOnly={route.page === 'graph'} history={history} addHistory={item => setHistory(current => [item, ...current].slice(0, 100))} />}{route.page === 'saved' && <SavedPage bookmarks={bookmarks} toggleBookmark={toggleBookmark} openLesson={openLesson} />}{route.page === 'sources' && <SourcesPage />}</main></div><dialog ref={dialogRef} className={`app-dialog ${searchOpen ? 'search-dialog' : ''}`} onCancel={() => { setSearchOpen(false); setInstallHelp(false) }} onClick={e => { if (e.target === e.currentTarget) { setSearchOpen(false); setInstallHelp(false) } }}><button className="dialog-close icon-button" aria-label="بستن" onClick={() => { setSearchOpen(false); setInstallHelp(false) }}><X size={20} /></button>{searchOpen ? <><h2>جست‌وجوی درس و فرمول</h2><label className="search-dialog-input"><Search size={20} /><input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="حد، پیوستگی، مقدار میانی…" aria-label="جست‌وجوی سراسری" /></label><div className="search-results">{searchResults.length ? searchResults.map(r => <button key={`${r.type}:${r.id}`} onClick={() => { if (r.type === 'lesson') openLesson(r.id); else { navigate(`formulas/${r.id}`); setSearchOpen(false) } }}><span className="search-result-icon">{r.type === 'lesson' ? <BookOpen size={18} /> : <Sigma size={18} />}</span><span>{r.label}<small>{r.sub}</small></span><ArrowLeft size={17} /></button>) : <p className="empty-state">نتیجه‌ای پیدا نشد.</p>}</div></> : <><span className="install-dialog-icon"><Download size={28} /></span><h2>نصب برنامه</h2><p>در Chrome اندروید، منوی مرورگر را باز کنید و «نصب برنامه» یا «افزودن به صفحهٔ اصلی» را بزنید. در دسکتاپ، نشان نصب کنار نوار آدرس را انتخاب کنید.</p><div className="install-note"><Check size={19} /><span>پس از اولین بار بارگذاری کامل نسخهٔ ساخته‌شده، درس‌ها، جزوه‌ها و محاسبات به‌صورت آفلاین در دسترس‌اند.</span></div><p className="caption">نصب PWA به HTTPS یا localhost نیاز دارد. برای نصب روی اندروید از شبکهٔ محلی، راهنمای README پروژه را ببینید.</p><button className="button peach-button" onClick={() => setInstallHelp(false)}>متوجه شدم</button></>}</dialog></div>
}
