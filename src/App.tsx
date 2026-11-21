import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { AppShell } from './components/AppShell'
import { db, defaultSettings } from './data/db'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { NotesPage } from './pages/NotesPage'
import { HabitsPage } from './pages/HabitsPage'
import { PomodoroPage } from './pages/PomodoroPage'
import { SettingsPage } from './pages/SettingsPage'

function ThemeSync() {
  const settings = useLiveQuery(() => db.settings.get('user'), [])
  useEffect(() => {
    document.documentElement.dataset.theme = settings?.theme || defaultSettings.theme
  }, [settings?.theme])
  return null
}

export default function App() {
  return <BrowserRouter><ThemeSync /><Routes><Route element={<AppShell />}><Route index element={<DashboardPage />} /><Route path="tasks" element={<TasksPage />} /><Route path="expenses" element={<ExpensesPage />} /><Route path="notes" element={<NotesPage />} /><Route path="habits" element={<HabitsPage />} /><Route path="pomodoro" element={<PomodoroPage />} /><Route path="settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></BrowserRouter>
}
