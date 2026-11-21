import { type FormEvent, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Flame, Plus, Sparkles, Trash2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { FormActions, Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { db } from '../data/db'
import { today } from '../lib/date'
import type { Habit } from '../types'

const habitColors = ['#a48eff', '#62b8ff', '#ffad75', '#69cfaa', '#ef8bbb', '#f1cb68']

export function HabitsPage() {
  const habits = useLiveQuery(() => db.habits.orderBy('createdAt').toArray(), [])
  const checks = useLiveQuery(() => db.habitChecks.where('date').equals(today()).toArray(), [])
  const [isOpen, setIsOpen] = useState(false)
  const checkByHabit = new Map((checks || []).map((check) => [check.habitId, check]))
  const completed = checkByHabit.size
  const count = habits?.length || 0

  async function saveHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    if (!title) return
    await db.habits.add({ title, color: habitColors[Math.floor(Math.random() * habitColors.length)], createdAt: new Date().toISOString() })
    setIsOpen(false)
  }

  async function toggleHabit(habit: Habit) {
    if (!habit.id) return
    const current = checkByHabit.get(habit.id)
    if (current?.id) await db.habitChecks.delete(current.id)
    else await db.habitChecks.add({ habitId: habit.id, date: today() })
  }

  async function deleteHabit(habitId?: number) {
    if (!habitId) return
    await db.transaction('rw', db.habits, db.habitChecks, async () => {
      await db.habitChecks.where('habitId').equals(habitId).delete()
      await db.habits.delete(habitId)
    })
  }

  return <div className="content-page">
    <PageHeader eyebrow="МАЛЕНЬКИЕ РИТУАЛЫ" title="Привычки" description="Регулярность важнее идеального результата." action={<button className="button button-primary" onClick={() => setIsOpen(true)}><Plus size={17} /> Новая привычка</button>} />
    <section className="habit-progress-card"><div className="habit-progress-icon"><Flame size={20} /></div><div className="habit-progress-copy"><span>ТВОЙ ДЕНЬ</span><strong>{count ? `${completed} из ${count} привычек` : 'Каждый путь начинается с шага'}</strong><p>{count ? completed === count ? 'Прекрасно! Ты сделал всё, что запланировал.' : 'Отметь привычки, которые уже выполнил сегодня.' : 'Выбери простое действие и повторяй его каждый день.'}</p></div><div className="habit-progress-track"><div className="habit-progress-value"><strong>{count ? Math.round(completed / count * 100) : 0}<small>%</small></strong><span>сегодня</span></div><div className="habit-progress-line"><span style={{ width: `${count ? completed / count * 100 : 0}%` }} /></div></div></section>
    {habits?.length ? <section className="habit-list">{habits.map((habit) => { const check = habit.id ? checkByHabit.get(habit.id) : undefined; return <article className={`habit-card ${check ? 'habit-done' : ''}`} key={habit.id}><div className="habit-card-orb" style={{ '--habit-color': habit.color } as React.CSSProperties}><Sparkles size={19} /></div><div className="habit-card-copy"><strong>{habit.title}</strong><span>{check ? 'Сегодня выполнено — так держать!' : 'Ежедневная привычка'}</span></div><button className={`habit-check-button ${check ? 'habit-checked' : ''}`} aria-label={check ? `Отменить отметку ${habit.title}` : `Отметить ${habit.title} выполненной`} onClick={() => toggleHabit(habit)}>{check ? <Check size={17} /> : <span />}</button><button className="icon-button delete-button" aria-label={`Удалить привычку ${habit.title}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={15} /></button></article>})}</section> : <EmptyState icon={<Sparkles size={23} />} title="Выбери свой первый ритуал" text="Добавь привычку, которую хочешь встроить в свой день." action={<button className="button button-primary button-small" onClick={() => setIsOpen(true)}><Plus size={15} /> Добавить привычку</button>} />}
    <div className="habit-quote"><span>“</span><p>Мы становимся тем, что делаем регулярно.</p><small>Джеймс Клир</small></div>
    {isOpen && <Modal title="Новая привычка" onClose={() => setIsOpen(false)}><form className="form-stack" onSubmit={saveHabit}><label className="field-label">Какой ритуал хочешь добавить?<input autoFocus name="title" placeholder="Например, прогулка утром" required maxLength={60} /></label><p className="field-hint">Отмечать выполнение можно каждый день. Привычки помогают создавать устойчивый ритм.</p><FormActions onCancel={() => setIsOpen(false)} label="Добавить привычку" /></form></Modal>}
  </div>
}
