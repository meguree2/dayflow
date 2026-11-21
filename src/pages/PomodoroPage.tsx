import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, Check, CirclePause, CirclePlay, RotateCcw, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { db } from '../data/db'

const modes = {
  focus: { label: 'Фокус', minutes: 25 },
  short: { label: 'Короткий отдых', minutes: 5 },
  long: { label: 'Длинный отдых', minutes: 15 },
} as const
type Mode = keyof typeof modes

export function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('focus')
  const [remaining, setRemaining] = useState(modes.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [focusTaskId, setFocusTaskId] = useState('')
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const activeTasks = (tasks || []).filter((task) => !task.completed)
  const selectedTask = activeTasks.find((task) => String(task.id) === focusTaskId)
  const totalSeconds = modes[mode].minutes * 60
  const progress = (totalSeconds - remaining) / totalSeconds
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
  const seconds = String(remaining % 60).padStart(2, '0')

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => setRemaining((current) => current - 1), 1000)
    return () => window.clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning || remaining > 0) return
    setIsRunning(false)
    const nextMode: Mode = mode === 'focus' ? 'short' : 'focus'
    if (mode === 'focus') setSessions((current) => current + 1)
    setMode(nextMode)
    setRemaining(modes[nextMode].minutes * 60)
  }, [isRunning, remaining, mode])

  function chooseMode(nextMode: Mode) {
    setIsRunning(false)
    setMode(nextMode)
    setRemaining(modes[nextMode].minutes * 60)
  }

  return <div className="content-page pomodoro-page">
    <PageHeader eyebrow="ВРЕМЯ ДЛЯ СЕБЯ" title="Помодоро" description="Сосредоточься на одном. Остальное подождёт." />
    <section className="pomodoro-layout"><article className="pomodoro-card"><div className="pomodoro-tabs" role="tablist" aria-label="Режим таймера">{(Object.keys(modes) as Mode[]).map((key) => <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? 'selected' : ''} onClick={() => chooseMode(key)}>{modes[key].label}</button>)}</div><div className="timer-area"><div className="timer-ring" style={{ '--timer-progress': `${progress * 100}%` } as React.CSSProperties}><div className="timer-ring-inner"><div className="timer-caption">{isRunning ? 'В РАБОТЕ' : mode === 'focus' ? 'ВРЕМЯ ФОКУСА' : 'ВРЕМЯ ОТДЫХА'}</div><div className="timer-digits">{minutes}<span>:</span>{seconds}</div><div className="timer-mode-caption">{modes[mode].label}</div></div></div></div><div className="timer-controls"><button className="button button-primary timer-main-button" onClick={() => setIsRunning((current) => !current)}>{isRunning ? <><CirclePause size={19} /> Пауза</> : <><CirclePlay size={19} /> Начать фокус</>}</button><button className="icon-button timer-reset" aria-label="Сбросить таймер" onClick={() => { setIsRunning(false); setRemaining(totalSeconds) }}><RotateCcw size={17} /></button></div><div className="timer-complete"><span className="timer-complete-icon"><Check size={14} /></span><span>{sessions} {sessions === 1 ? 'сессия' : 'сессий'} завершено сегодня</span></div></article><aside className="pomodoro-side"><article className="panel focus-task-panel"><div className="panel-kicker">ТВОЁ НАМЕРЕНИЕ</div><h2>На чём сфокусируемся?</h2><p>Выбери одну задачу и удели ей это время.</p>{activeTasks.length ? <><select aria-label="Задача для фокус-сессии" value={focusTaskId} onChange={(event) => setFocusTaskId(event.target.value)}><option value="">Без задачи</option>{activeTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select>{selectedTask && <div className="focus-selected"><Check size={13} /><span>Фокус: {selectedTask.title}</span></div>}</> : <div className="no-focus-task"><Sparkles size={16} /><span>Нет активных задач — можно просто выдохнуть.</span></div>}</article><article className="panel timer-tips"><div className="panel-kicker">МЯГКИЕ ПРАВИЛА</div><div className="timer-tip"><span className="tip-number">01</span><p>Выбери одну конкретную задачу.</p></div><div className="timer-tip"><span className="tip-number">02</span><p>Убери отвлекающие вкладки.</p></div><div className="timer-tip"><span className="tip-number">03</span><p>После таймера отдохни без чувства вины.</p></div></article><div className="pomodoro-quote"><Bell size={15} /><span>Тихий фокус — тоже продуктивность.</span></div></aside></section>
  </div>
}
