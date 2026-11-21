function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const today = () => localDate(new Date())

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function formatToday() {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date())
}

export function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(parsed)
}

export function monthRange() {
  const now = new Date()
  const start = localDate(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = localDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { start, end }
}

export function formatMoney(amount: number, currency = '₸') {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} ${currency}`
}
