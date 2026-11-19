/**
 * Agenda fictícia determinística.
 * A ocupação de cada horário é derivada de um hash (profissional + data + horário),
 * então o mesmo dia mostra sempre os mesmos horários livres. Nada é gravado.
 */
import { site } from '../../config/site'
import { team, ANY_BARBER, type Barber } from '../../data/team'
import { addDays, fromDateKey, startOfDay, timeToMinutes, toDateKey } from '../../utils/format'

export interface Slot {
  /** Minutos desde 00:00 */
  start: number
  /** Profissional que atenderia (útil em "sem preferência"). */
  barberId: string
}

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function hoursFor(date: Date) {
  const entry = site.hours.find((h) => h.day === date.getDay())
  if (!entry || !entry.open || !entry.close) return null
  return { open: timeToMinutes(entry.open), close: timeToMinutes(entry.close) }
}

export const isWorking = (barber: Barber, date: Date) => !barber.daysOff.includes(date.getDay()) && hoursFor(date) !== null

/** Taxa de ocupação simulada: sextas e sábados mais cheios. */
function busyRate(date: Date) {
  const day = date.getDay()
  return day === 5 || day === 6 ? 46 : day === 1 ? 22 : 32
}

function isBusy(barberId: string, dateKey: string, start: number, rate: number) {
  return hash(`${barberId}|${dateKey}|${start}`) % 100 < rate
}

export function bookingWindow(now = new Date()) {
  const first = startOfDay(now)
  const last = addDays(first, site.booking.maxDaysAhead)
  return { first, last }
}

function startsForBarber(barber: Barber, dateKey: string, duration: number, now: Date): number[] {
  const date = fromDateKey(dateKey)
  const hours = hoursFor(date)
  if (!hours || !isWorking(barber, date)) return []
  const step = site.booking.slotMinutes
  const rate = busyRate(date)
  const isToday = dateKey === toDateKey(now)
  const minStart = isToday ? now.getHours() * 60 + now.getMinutes() + site.booking.minLeadMinutes : -1
  const result: number[] = []
  for (let s = hours.open; s + duration <= hours.close; s += step) {
    if (s < minStart) continue
    let free = true
    for (let t = s; t < s + duration; t += step) {
      if (isBusy(barber.id, dateKey, t, rate)) {
        free = false
        break
      }
    }
    if (free) result.push(s)
  }
  return result
}

/** Todos os horários do dia, com indicação de disponibilidade. */
export function slotsFor(dateKey: string, barberId: string, duration: number, now = new Date()) {
  const date = fromDateKey(dateKey)
  const hours = hoursFor(date)
  if (!hours) return []
  const barbers = barberId === ANY_BARBER ? team : team.filter((b) => b.id === barberId)
  const free = new Map<number, string>()
  for (const b of barbers) {
    for (const s of startsForBarber(b, dateKey, duration, now)) {
      if (!free.has(s)) free.set(s, b.id)
    }
  }
  const step = site.booking.slotMinutes
  const all: { start: number; barberId: string | null }[] = []
  for (let s = hours.open; s + Math.min(duration, step) <= hours.close; s += step) {
    all.push({ start: s, barberId: free.get(s) ?? null })
  }
  return all
}

export function availableCount(dateKey: string, barberId: string, duration: number, now = new Date()) {
  return slotsFor(dateKey, barberId, duration, now).filter((s) => s.barberId).length
}

export type DayStatus = 'past' | 'closed' | 'off' | 'full' | 'few' | 'open' | 'out'

export function dayStatus(date: Date, barberId: string, duration: number, now = new Date()): DayStatus {
  const { first, last } = bookingWindow(now)
  if (date < first) return 'past'
  if (date > last) return 'out'
  if (!hoursFor(date)) return 'closed'
  if (barberId !== ANY_BARBER) {
    const b = team.find((x) => x.id === barberId)
    if (b && !isWorking(b, date)) return 'off'
  }
  const n = availableCount(toDateKey(date), barberId, duration, now)
  if (n === 0) return 'full'
  if (n <= 3) return 'few'
  return 'open'
}

/** Primeiro horário livre a partir de agora (para chamadas no hero). */
export function nextAvailable(duration: number, now = new Date()) {
  const { first } = bookingWindow(now)
  for (let i = 0; i <= 14; i++) {
    const key = toDateKey(addDays(first, i))
    const slot = slotsFor(key, ANY_BARBER, duration, now).find((s) => s.barberId)
    if (slot) return { dateKey: key, start: slot.start, barberId: slot.barberId as string }
  }
  return null
}
