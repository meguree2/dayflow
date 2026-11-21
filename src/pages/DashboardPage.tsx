import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, Circle, Clock3, CreditCard, ListTodo, Plus, Sparkles, StickyNote, Wallet, Zap } from 'lucide-react'
import { db } from '../data/db'
import { formatDate, formatMoney, formatToday, greeting, monthRange, today } from '../lib/date'

export function DashboardPage() {
  const navigate = useNavigate()
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const expenses = useLiveQuery(() => db.expenses.toArray(), [])
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const checks = useLiveQuery(() => db.habitChecks.where('date').equals(today()).toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('user'), [])
  const range = monthRange()
  const monthlyExpenses = (expenses || []).filter((expense) => expense.date >= range.start && expense.date <= range.end)
  const spend = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const spendByPeriod = Array.from({ length: 12 }, (_, index) => {
    const firstDay = Math.floor(index * daysInMonth / 12) + 1
    const lastDay = Math.floor((index + 1) * daysInMonth / 12)
    return monthlyExpenses.filter((expense) => {
      const day = Number(expense.date.slice(8, 10))
      return day >= firstDay && day <= lastDay
    }).reduce((sum, expense) => sum + expense.amount, 0)
  })
  const spendPeak = Math.max(...spendByPeriod, 1)
  const completed = (tasks || []).filter((task) => task.completed).length
  const remaining = (tasks || []).filter((task) => !task.completed).length
  const checkedIds = new Set((checks || []).map((check) => check.habitId))
  const habitPercent = habits?.length ? Math.round(checkedIds.size / habits.length * 100) : 0
  const upcoming = useMemo(() => (tasks || []).filter((task) => !task.completed && task.dueDate >= today()).sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`)).slice(0, 4), [tasks])
  const name = settings?.name || 'Артём'
  const currency = settings?.currency || '₸'

  return <div className="dashboard-page">
    <section className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-line" /> {formatToday()}</div><h1>{greeting()}, {name}<span className="wave">✦</span></h1><p>Один день за раз. Ты справишься.</p></div>
      <div className="welcome-date"><span className="date-sun">☼</span><div><span>ТВОЙ ФОКУС СЕГОДНЯ</span><strong>{remaining ? `${remaining} ${remaining === 1 ? 'задача' : 'задачи'} ждут тебя` : 'Начни с малого'}</strong></div></div>
    </section>

    <section className="stat-grid" aria-label="Сводка дня">
      <article className="stat-card stat-tasks"><div className="stat-top"><span className="stat-icon violet-icon"><ListTodo size={19} /></span><span className="stat-caption">Задачи сегодня</span><Link to="/tasks" className="stat-link" aria-label="Все задачи"><ArrowUpRight size={17} /></Link></div><div className="stat-value-row"><strong>{completed}<span className="stat-total"> / {completed + remaining}</span></strong><span className="stat-unit">выполнено</span></div><div className="mini-progress"><span style={{ width: `${completed + remaining ? completed / (completed + remaining) * 100 : 0}%` }} /></div><div className="stat-foot"><span><Check size={13} /> {completed} готово</span><span><Circle size={12} /> {remaining} осталось</span></div></article>
      <article className="stat-card stat-expenses"><div className="stat-top"><span className="stat-icon amber-icon"><Wallet size={19} /></span><span className="stat-caption">Расходы за месяц</span><Link to="/expenses" className="stat-link" aria-label="Открыть расходы"><ArrowUpRight size={17} /></Link></div><div className="stat-value-row"><strong>{formatMoney(spend, currency)}</strong></div><div className="expense-sparkline" aria-hidden="true">{spendByPeriod.map((periodSpend, index) => <span key={index} style={{ height: `${periodSpend ? Math.max(10, periodSpend / spendPeak * 100) : 4}%` }} />)}</div><div className="stat-foot"><span>{monthlyExpenses.length ? `${monthlyExpenses.length} ${monthlyExpenses.length === 1 ? 'запись' : 'записей'}` : 'Пока без записей'}</span><span className="muted">{new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date())}</span></div></article>
      <article className="stat-card stat-habits"><div className="stat-top"><span className="stat-icon mint-icon"><Sparkles size={19} /></span><span className="stat-caption">Привычки</span><Link to="/habits" className="stat-link" aria-label="Открыть привычки"><ArrowUpRight size={17} /></Link></div><div className="habit-stat-row"><div className="habit-ring" style={{ '--progress': `${habitPercent}%` } as React.CSSProperties}><span>{habits?.length ? `${habitPercent}%` : '—'}</span></div><div className="habit-stat-copy"><strong>{checkedIds.size} из {habits?.length || 0}</strong><span>выполнено сегодня</span></div></div><div className="stat-foot"><span>{habits?.length ? 'Маленькие ритуалы, большие перемены' : 'Добавь первую привычку'}</span></div></article>
    </section>

    <section className="dashboard-main-grid">
      <article className="panel upcoming-panel"><header className="panel-header"><div><div className="panel-kicker">ТВОЙ ПЛАН</div><h2>Ближайшие задачи</h2></div><Link to="/tasks" className="text-link">Все задачи <ArrowRight size={14} /></Link></header>
        {upcoming.length ? <div className="task-preview-list">{upcoming.map((task) => <button key={task.id} className="task-preview" onClick={() => navigate('/tasks')}><span className={`task-dot priority-${task.priority}`}><Check size={11} /></span><span className="task-preview-name">{task.title}</span><span className="task-time"><Clock3 size={13} />{task.dueDate === today() ? task.dueTime || 'Сегодня' : formatDate(task.dueDate)}</span></button>)}</div> : <div className="dashboard-empty"><div className="empty-illustration"><CheckCheck size={24} /></div><div><strong>План пока свободен</strong><p>Добавь задачу, чтобы задать ритм дню.</p></div><button className="button button-primary button-small" onClick={() => navigate('/tasks?new=1')}><Plus size={15} /> Создать задачу</button></div>}
        <div className="panel-divider" /><div className="task-summary"><span><span className="summary-dot done" /> Выполнено <strong>{completed}</strong></span><span><span className="summary-dot pending" /> В планах <strong>{remaining}</strong></span><Link to="/tasks" aria-label="Открыть задачи"><ChevronRight size={16} /></Link></div>
      </article>
      <article className="panel quick-panel"><header className="panel-header"><div><div className="panel-kicker">ДЕЙСТВИЯ</div><h2>Начни с одного шага</h2></div><span className="quick-sparkle"><Zap size={17} /></span></header><p className="panel-description">Что поможет тебе сегодня?</p>
        <div className="quick-actions"><button className="quick-action" onClick={() => navigate('/tasks?new=1')}><span className="quick-icon quick-violet"><ListTodo size={17} /></span><span><strong>Новая задача</strong><small>Запиши, что важно</small></span><ArrowUpRight size={15} /></button><button className="quick-action" onClick={() => navigate('/notes?new=1')}><span className="quick-icon quick-blue"><StickyNote size={17} /></span><span><strong>Быстрая заметка</strong><small>Сохрани мысль</small></span><ArrowUpRight size={15} /></button><button className="quick-action" onClick={() => navigate('/expenses?new=1')}><span className="quick-icon quick-amber"><CreditCard size={17} /></span><span><strong>Записать расход</strong><small>Следи за бюджетом</small></span><ArrowUpRight size={15} /></button><Link className="focus-link" to="/pomodoro"><span className="focus-link-icon"><Clock3 size={15} /></span>Начать фокус-сессию <ArrowRight size={14} /></Link></div>
      </article>
    </section>
    <div className="dashboard-note"><span className="note-star">✦</span><span>Тебе не нужно сделать всё сегодня. Просто выбери, что важно.</span><span className="note-rule" /></div>
  </div>
}
