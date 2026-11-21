import { type FormEvent, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { Lightbulb, NotebookPen, Plus, Search, StickyNote, Trash2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { FormActions, Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { db } from '../data/db'
import type { Note } from '../types'

const palette = ['note-lavender', 'note-blue', 'note-peach', 'note-mint']

export function NotesPage() {
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [])
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => { if (params.has('new')) { setSelected(null); setIsOpen(true); setParams({}, { replace: true }) } }, [params, setParams])
  const filteredNotes = (notes || []).filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase()))

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    const content = String(data.get('content') || '').trim()
    if (!title && !content) return
    const note = { title: title || 'Без названия', content, updatedAt: new Date().toISOString() }
    if (selected?.id) await db.notes.update(selected.id, note)
    else await db.notes.add(note)
    setIsOpen(false)
    setSelected(null)
  }

  function editNote(note: Note) { setSelected(note); setIsOpen(true) }

  return <div className="content-page">
    <PageHeader eyebrow="ТВОИ МЫСЛИ" title="Заметки" description="Идеи, планы и мысли — в одном спокойном месте." action={<button className="button button-primary" onClick={() => { setSelected(null); setIsOpen(true) }}><Plus size={17} /> Новая заметка</button>} />
    <div className="notes-toolbar"><div className="notes-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти заметку..." aria-label="Поиск заметок" /></div><span className="notes-count">{filteredNotes.length} {filteredNotes.length === 1 ? 'заметка' : 'заметок'}</span></div>
    {filteredNotes.length ? <section className="notes-grid">{filteredNotes.map((note, index) => <article key={note.id} className={`note-card ${palette[index % palette.length]}`}><button className="note-open" onClick={() => editNote(note)} aria-label={`Редактировать: ${note.title}`}><div className="note-card-top"><span className="note-card-icon"><StickyNote size={16} /></span><span className="note-date">{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(note.updatedAt))}</span></div><h3>{note.title}</h3><p>{note.content || 'Откройте, чтобы добавить текст...'}</p></button><button className="icon-button note-delete" aria-label={`Удалить заметку ${note.title}`} onClick={() => note.id && db.notes.delete(note.id)}><Trash2 size={15} /></button></article>)}</section> : <EmptyState icon={search ? <Search size={23} /> : <NotebookPen size={23} />} title={search ? 'Ничего не найдено' : 'Начни собирать идеи'} text={search ? 'Попробуй изменить запрос.' : 'Записывай мысли, чтобы они всегда были под рукой.'} action={!search && <button className="button button-primary button-small" onClick={() => setIsOpen(true)}><Plus size={15} /> Создать заметку</button>} />}
    <div className="notes-hint"><Lightbulb size={15} /><span>Подсказка: используй поиск, чтобы быстро найти нужную мысль.</span></div>
    {isOpen && <Modal title={selected ? 'Редактировать заметку' : 'Новая заметка'} onClose={() => { setIsOpen(false); setSelected(null) }}><form className="form-stack" onSubmit={saveNote}><label className="field-label">Заголовок<input autoFocus name="title" defaultValue={selected?.title} placeholder="Без названия" maxLength={100} /></label><label className="field-label">Текст<textarea name="content" defaultValue={selected?.content} placeholder="Начни записывать..." rows={7} maxLength={5000} /></label><FormActions onCancel={() => { setIsOpen(false); setSelected(null) }} label={selected ? 'Сохранить изменения' : 'Сохранить заметку'} /></form></Modal>}
  </div>
}
