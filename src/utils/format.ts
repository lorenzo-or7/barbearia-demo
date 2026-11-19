import { site } from '../config/site'

const currency = new Intl.NumberFormat(site.currency.locale, {
  style: 'currency',
  currency: site.currency.code,
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number) => currency.format(value)

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export const pad = (n: number) => String(n).padStart(2, '0')

/** Minutos desde 00:00 → 'HH:MM' */
export const minutesToTime = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Data local → 'YYYY-MM-DD' (sem fuso UTC). */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

const longDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

export const formatLongDate = (key: string) => longDate.format(fromDateKey(key))
export const formatShortDate = (key: string) => shortDate.format(fromDateKey(key)).replace(/\./g, '')
export const formatMonthYear = (d: Date) => monthYear.format(d)

/** Mantém só dígitos e aplica máscara (00) 00000-0000. */
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
