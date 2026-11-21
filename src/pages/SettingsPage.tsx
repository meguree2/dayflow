import { type FormEvent, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Download, HardDrive, Moon, RotateCcw, Sun, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { db, defaultSettings } from '../data/db'
import { platformName } from '../lib/platform'
import type { UserSettings } from '../types'

export function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('user'), [])
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(defaultSettings.name)
  const [currency, setCurrency] = useState(defaultSettings.currency)
  const currentTheme = settings?.theme || defaultSettings.theme

  useEffect(() => {
    if (!settings) return
    setName(settings.name)
    setCurrency(settings.currency)
  }, [settings?.name, settings?.currency])

  async function updateSettings(partial: Partial<UserSettings>) {
    await db.settings.put({ ...defaultSettings, ...settings, ...partial, id: 'user' })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return
    void updateSettings({ name: cleanName, currency })
  }

  async function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      tasks: await db.tasks.toArray(), expenses: await db.expenses.toArray(),
      notes: await db.notes.toArray(), habits: await db.habits.toArray(),
      habitChecks: await db.habitChecks.toArray(), settings: await db.settings.get('user'),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `dayflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function clearContent() {
    if (!window.confirm('Удалить все задачи, расходы, заметки и привычки? Это действие нельзя отменить.')) return
    await db.transaction('rw', db.tasks, db.expenses, db.notes, db.habits, db.habitChecks, async () => {
      await Promise.all([db.tasks.clear(), db.expenses.clear(), db.notes.clear(), db.habits.clear(), db.habitChecks.clear()])
    })
  }

  return <div className="content-page">
    <PageHeader eyebrow="ТВОЁ ПРОСТРАНСТВО" title="Настройки" description="Настрой DAYFLOW под себя." />
    <div className="settings-layout"><aside className="settings-nav"><a className="settings-nav-item settings-nav-active" href="#profile"><UserRound size={16} />Профиль</a><a className="settings-nav-item" href="#appearance"><Moon size={16} />Внешний вид</a><a className="settings-nav-item" href="#data"><HardDrive size={16} />Данные</a></aside><div className="settings-content">
      <section id="profile" className="settings-section"><header className="settings-section-header"><div><h2>Личный профиль</h2><p>Имя появится в приветствии на главной странице.</p></div></header><form className="profile-settings-form" onSubmit={saveProfile}><label className="field-label">Как к тебе обращаться?<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required /></label><label className="field-label">Валюта расходов<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="₸">Тенге (₸)</option><option value="₽">Рубль (₽)</option><option value="$">Доллар ($)</option><option value="€">Евро (€)</option><option value="£">Фунт (£)</option></select></label><div className="settings-save-row"><button className="button button-primary button-small" type="submit">{saved ? <><Check size={15} /> Сохранено</> : 'Сохранить профиль'}</button></div></form></section>
      <section id="appearance" className="settings-section"><header className="settings-section-header"><div><h2>Внешний вид</h2><p>Выбери тему, в которой комфортно.</p></div></header><div className="theme-options"><button className={`theme-option ${currentTheme === 'dark' ? 'theme-selected' : ''}`} onClick={() => void updateSettings({ theme: 'dark' })}><span className="theme-preview theme-preview-dark"><Moon size={17} /></span><span><strong>Тёмная</strong><small>Мягкая для глаз</small></span>{currentTheme === 'dark' && <Check size={16} />}</button><button className={`theme-option ${currentTheme === 'light' ? 'theme-selected' : ''}`} onClick={() => void updateSettings({ theme: 'light' })}><span className="theme-preview theme-preview-light"><Sun size={17} /></span><span><strong>Светлая</strong><small>Чистая и воздушная</small></span>{currentTheme === 'light' && <Check size={16} />}</button></div></section>
      <section id="data" className="settings-section"><header className="settings-section-header"><div><h2>Данные и приватность</h2><p>Всё хранится локально на этом устройстве.</p></div></header><div className="data-action-row"><div className="data-action-icon"><Download size={17} /></div><div className="data-action-copy"><strong>Скачать резервную копию</strong><span>Экспортировать данные в JSON-файл</span></div><button className="button button-quiet button-small" onClick={() => void exportData()}>Экспортировать</button></div><div className="data-action-row danger-row"><div className="data-action-icon danger-icon"><Trash2 size={17} /></div><div className="data-action-copy"><strong>Очистить содержимое</strong><span>Удалить все записи, сохранив настройки</span></div><button className="button button-danger button-small" onClick={() => void clearContent()}><RotateCcw size={14} /> Очистить</button></div><div className="storage-note"><HardDrive size={14} /><span>Данные хранятся на устройстве ({platformName()}) и не отправляются на сервер.</span></div></section>
      <div className="settings-version">DAYFLOW <span>v0.1.0</span></div>
    </div></div>
  </div>
}
