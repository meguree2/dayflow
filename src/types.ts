export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id?: number
  title: string
  dueDate: string
  dueTime: string
  priority: Priority
  completed: boolean
  createdAt: string
}

export interface Expense {
  id?: number
  title: string
  category: string
  amount: number
  date: string
  createdAt: string
}

export interface Note {
  id?: number
  title: string
  content: string
  updatedAt: string
}

export interface Habit {
  id?: number
  title: string
  color: string
  createdAt: string
}

export interface HabitCheck {
  id?: number
  habitId: number
  date: string
}

export interface UserSettings {
  id: 'user'
  name: string
  currency: string
  theme: 'dark' | 'light'
}
