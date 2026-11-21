import { type FormEvent, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownRight, Plus, Receipt, Trash2, Wallet } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { FormActions, Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { db } from '../data/db'
import { formatDate, formatMoney, monthRange, today } from '../lib/date'

const categories = ['Продукты', 'Транспорт', 'Кафе и рестораны', 'Дом', 'Здоровье', 'Подписки', 'Покупки', 'Другое']
const categoryColors = ['#a48eff', '#64b8ff', '#ffbd70', '#ed85b7', '#71d6ad', '#f08a75', '#75cdd3', '#8891a5']

export function ExpensesPage() {
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('user'), [])
  const [params, setParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => { if (params.has('new')) { setIsOpen(true); setParams({}, { replace: true }) } }, [params, setParams])
  const range = monthRange()
  const monthItems = (expenses || []).filter((expense) => expense.date >= range.start && expense.date <= range.end)
  const total = monthItems.reduce((sum, expense) => sum + expense.amount, 0)
  const currency = settings?.currency || '₸'
  const grouped = monthItems.reduce<Record<string, number>>((result, expense) => { result[expense.category] = (result[expense.category] || 0) + expense.amount; return result }, {})
  const categoriesSorted = Object.entries(grouped).sort((a, b) => b[1] - a[1])

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const amount = Number(data.get('amount'))
    const title = String(data.get('title') || '').trim()
    if (!title || !amount || amount < 0) return
    await db.expenses.add({ title, category: String(data.get('category')), amount, date: String(data.get('date')), createdAt: new Date().toISOString() })
    setIsOpen(false)
  }

  return <div className="content-page">
    <PageHeader eyebrow="ФИНАНСЫ" title="Расходы" description="Замечай, куда уходит бюджет — без лишних сложностей." action={<button className="button button-primary" onClick={() => setIsOpen(true)}><Plus size={17} /> Добавить расход</button>} />
    <section className="expense-overview-grid"><article className="expense-total-card"><div className="expense-total-orb"><Wallet size={21} /></div><span className="overview-label">РАСХОДЫ В ЭТОМ МЕСЯЦЕ</span><strong>{formatMoney(total, currency)}</strong><div className="overview-foot"><span className="overview-neutral"><ArrowDownRight size={15} /> {monthItems.length} записей</span><span>{new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date())}</span></div></article><article className="panel category-panel"><header className="panel-header"><div><div className="panel-kicker">РАСПРЕДЕЛЕНИЕ</div><h2>По категориям</h2></div><span className="category-count">{categoriesSorted.length} {categoriesSorted.length === 1 ? 'категория' : 'категорий'}</span></header>{categoriesSorted.length ? <div className="category-bars">{categoriesSorted.slice(0, 5).map(([category, value], index) => <div className="category-bar-row" key={category}><div className="category-row-label"><span className="category-dot" style={{ background: categoryColors[index % categoryColors.length] }} />{category}<strong>{formatMoney(value, currency)}</strong></div><div className="category-track"><span style={{ width: `${Math.max(4, value / total * 100)}%`, background: categoryColors[index % categoryColors.length] }} /></div></div>)}</div> : <div className="category-empty"><div className="empty-icon"><Receipt size={20} /></div><span>Добавь расходы — и распределение появится здесь.</span></div>}</article></section>
    <section className="panel expense-list-panel"><header className="panel-header"><div><div className="panel-kicker">ИСТОРИЯ</div><h2>Последние записи</h2></div><span className="list-total">{expenses?.length || 0} всего</span></header>{expenses?.length ? <div className="expense-list">{expenses.map((expense, index) => <article className="expense-row" key={expense.id}><div className={`expense-category-icon category-${index % 5}`}><Receipt size={17} /></div><div className="expense-info"><strong>{expense.title}</strong><span>{expense.category}<i>·</i>{formatDate(expense.date)}</span></div><strong className="expense-amount">− {formatMoney(expense.amount, currency)}</strong><button className="icon-button delete-button" aria-label={`Удалить расход ${expense.title}`} onClick={() => expense.id && db.expenses.delete(expense.id)}><Trash2 size={15} /></button></article>)}</div> : <EmptyState icon={<Wallet size={23} />} title="Расходов пока нет" text="Добавь первую запись, чтобы начать следить за бюджетом." action={<button className="button button-primary button-small" onClick={() => setIsOpen(true)}><Plus size={15} /> Добавить расход</button>} />}</section>
    {isOpen && <Modal title="Новый расход" onClose={() => setIsOpen(false)}><form className="form-stack" onSubmit={saveExpense}><label className="field-label">На что потрачено?<input autoFocus name="title" placeholder="Например, обед" required maxLength={80} /></label><div className="form-row"><label className="field-label">Сумма<input name="amount" type="number" min="1" step="1" placeholder="0" required /></label><label className="field-label">Дата<input name="date" type="date" defaultValue={today()} required /></label></div><label className="field-label">Категория<select name="category" defaultValue={categories[0]}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><FormActions onCancel={() => setIsOpen(false)} label="Сохранить расход" /></form></Modal>}
  </div>
}
