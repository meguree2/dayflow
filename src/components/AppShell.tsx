import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowUpRight, CheckSquare, CircleHelp, Command, LayoutDashboard, NotebookPen, Settings2, Sparkles, WalletCards, X } from 'lucide-react'
import { useState } from 'react'
import { db, defaultSettings } from '../data/db'

const mainNavigation = [
  { to: '/', label: 'Главная', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Задачи', icon: CheckSquare },
  { to: '/expenses', label: 'Расходы', icon: WalletCards },
  { to: '/notes', label: 'Заметки', icon: NotebookPen },
  { to: '/habits', label: 'Привычки', icon: Sparkles },
  { to: '/pomodoro', label: 'Помодоро', icon: Command },
]

const pageTitles: Record<string, string> = {
  '/': 'Главная', '/tasks': 'Задачи', '/expenses': 'Расходы', '/notes': 'Заметки',
  '/habits': 'Привычки', '/pomodoro': 'Помодоро', '/settings': 'Настройки',
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const settings = useLiveQuery(() => db.settings.get('user'), [])
  const location = useLocation()
  const navigate = useNavigate()
  const name = settings?.name || defaultSettings.name
  const title = pageTitles[location.pathname] || 'DAYFLOW'

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <NavLink to="/" className="brand-mark" onClick={() => setMobileOpen(false)} aria-label="DAYFLOW, главная"><span>day</span><i>flow</i><b>✳</b></NavLink>
          <button className="icon-button mobile-close" aria-label="Закрыть меню" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher"><div className="workspace-avatar">{name.slice(0, 1).toUpperCase()}</div><div className="workspace-copy"><strong>Мой день</strong><span>Личное пространство</span></div><span className="switcher-dots">•••</span></div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Основная навигация">
          {mainNavigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Задачи' && <span className="nav-link-hint">⌘ 1</span>}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div className="tip-glow"><Sparkles size={16} /></div><strong>Маленькие шаги</strong><p>приводят к большим переменам.</p></div>
          <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link settings-link ${isActive ? 'active' : ''}`}><Settings2 size={18} strokeWidth={1.8} /><span>Настройки</span></NavLink>
          <div className="profile-card"><div className="avatar">{name.slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{name}</strong><span>Личный аккаунт</span></div><button className="icon-button profile-help" title="О приложении" onClick={() => window.alert('DAYFLOW — ваш личный центр управления повседневными делами. Все данные хранятся на этом устройстве.')}><CircleHelp size={17} /></button></div>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" aria-label="Закрыть меню" onClick={() => setMobileOpen(false)} />}
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><button className="icon-button menu-trigger" aria-label="Открыть меню" onClick={() => setMobileOpen(true)}><span className="hamburger">☰</span></button><span className="brand-word">day<i>flow</i><b>✳</b></span></div><div className="breadcrumbs"><span>Пространство</span><span className="crumb-sep">/</span><strong>{title}</strong></div><div className="topbar-right"><span className="sync-status"><span className="status-dot" /> Все изменения сохранены</span><button className="avatar avatar-small" title={`Настройки профиля ${name}`} onClick={() => navigate('/settings')}>{name.slice(0, 1).toUpperCase()}</button></div></header>
        <div className="page-container"><Outlet /></div>
        <footer className="app-footer"><span>Сделано с вниманием к себе <span className="footer-heart">✳</span></span><span>DAYFLOW <span className="footer-version">v0.1.0</span><a href="https://tauri.app" target="_blank" rel="noreferrer" className="footer-platform">Подготовлено для Tauri <ArrowUpRight size={12} /></a></span></footer>
      </main>
    </div>
  )
}
