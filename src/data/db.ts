import Dexie, { type EntityTable } from 'dexie'
import type { Expense, Habit, HabitCheck, Note, Task, UserSettings } from '../types'

class DayflowDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>
  expenses!: EntityTable<Expense, 'id'>
  notes!: EntityTable<Note, 'id'>
  habits!: EntityTable<Habit, 'id'>
  habitChecks!: EntityTable<HabitCheck, 'id'>
  settings!: EntityTable<UserSettings, 'id'>

  constructor() {
    super('dayflow')
    this.version(1).stores({
      tasks: '++id, completed, dueDate, createdAt',
      expenses: '++id, date, category, createdAt',
      notes: '++id, updatedAt',
      habits: '++id, createdAt',
      habitChecks: '++id, habitId, date, &[habitId+date]',
      settings: 'id',
    })
  }
}

export const db = new DayflowDatabase()

export const defaultSettings: UserSettings = {
  id: 'user',
  name: 'друг',
  currency: '₸',
  theme: 'dark',
}
