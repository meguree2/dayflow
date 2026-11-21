import { type FormEvent, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Check, CheckCheck, Circle, Clock3, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { FormActions, Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { db } from '../data/db'
import { formatDate, today } from '../lib/date'
import type { Priority } from '../types'

type Filter = 'all' | 'active' | 'completed'

export function TasksPage() {
  const tasks = useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray(), [])
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (params.has('new')) { setIsOpen(true); setParams({}, { replace: true }) }
  }, [params, setParams])

  const doneCount = (tasks || []).filter((task) => task.completed).length
  const visibleTasks = (tasks || []).filter((task) => filter === 'all' || (filter === 'active' ? !task.completed : task.completed))

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    if (!title) return
    await db.tasks.add({ title, dueDate: String(data.get('dueDate')), dueTime: String(data.get('dueTime')), priority: data.get('priority') as Priority, completed: false, createdAt: new Date().toISOString() })
    setIsOpen(false)
  }

  return <div className="content-page">
    <PageHeader eyebrow="СПИСОК ДЕЛ" title="Задачи" description="Освободи голову — всё важное уже здесь." action={<button className="button button-primary" onClick={() => setIsOpen(true)}><Plus size={17} /> Новая задача</button>} />
    <div className="task-toolbar"><div className="filter-tabs" role="tablist" aria-label="Фильтр задач">{([['all', 'Все'], ['active', 'В планах'], ['completed', 'Готово']] as const).map(([key, label]) => <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)}>{label}<span>{key === 'all' ? tasks?.length || 0 : key === 'active' ? (tasks || []).length - doneCount : doneCount}</span></button>)}</div><div className="task-progress-label"><CheckCheck size={15} /> {doneCount} из {tasks?.length || 0} выполнено</div></div>
    <section className="task-list-card">
      {visibleTasks.length ? <div className="task-list">{visibleTasks.map((task) => <article key={task.id} className={`task-row ${task.completed ? 'task-complete' : ''}`}><button className={`task-checkbox ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'} onClick={() => task.id && db.tasks.update(task.id, { completed: !task.completed })}>{task.completed && <Check size={13} />}</button><div className="task-details"><strong>{task.title}</strong><div className="task-metadata"><span className={`priority-label priority-text-${task.priority}`}><span className="priority-bullet" />{task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Обычный' : 'Низкий'} приоритет</span><span><CalendarDays size={13} />{task.dueDate === today() ? 'Сегодня' : formatDate(task.dueDate)}</span>{task.dueTime && <span><Clock3 size={13} />{task.dueTime}</span>}</div></div><button className="icon-button delete-button" aria-label={`Удалить задачу ${task.title}`} onClick={() => task.id && db.tasks.delete(task.id)}><Trash2 size={16} /></button></article>)}</div> : <EmptyState icon={filter === 'completed' ? <CheckCheck size={23} /> : filter === 'active' ? <Circle size={23} /> : <CalendarDays size={23} />} title={filter === 'completed' ? 'Пока ничего не завершено' : filter === 'active' ? 'Все задачи выполнены' : 'Здесь будет твой план'} text={filter === 'all' ? 'Добавь первую задачу и освободи немного места в голове.' : 'Когда появятся задачи, они будут здесь.'} action={filter === 'all' && <button className="button button-primary button-small" onClick={() => setIsOpen(true)}><Plus size={15} /> Добавить задачу</button>} />}
    </section>
    {isOpen && <Modal title="Новая задача" onClose={() => setIsOpen(false)}><form className="form-stack" onSubmit={saveTask}><label className="field-label">Что нужно сделать?<input autoFocus name="title" placeholder="Например, закончить презентацию" required maxLength={100} /></label><div className="form-row"><label className="field-label">Дата<input type="date" name="dueDate" defaultValue={today()} required /></label><label className="field-label">Время<input type="time" name="dueTime" defaultValue="09:00" /></label></div><label className="field-label">Приоритет<select name="priority" defaultValue="medium"><option value="low">Низкий</option><option value="medium">Обычный</option><option value="high">Высокий</option></select></label><FormActions onCancel={() => setIsOpen(false)} /></form></Modal>}
  </div>
}
