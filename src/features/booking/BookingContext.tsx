import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getService } from '../../data/services'
import { ANY_BARBER } from '../../data/team'
import { slotsFor } from './schedule'

export const STEPS = ['Serviço', 'Profissional', 'Data', 'Horário', 'Seus dados', 'Revisão'] as const
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5

export interface BookingDraft {
  serviceId: string | null
  barberId: string | null
  dateKey: string | null
  start: number | null
  /** Profissional efetivo do horário (difere de barberId quando "sem preferência"). */
  assignedBarberId: string | null
  name: string
  phone: string
}

interface BookingContextValue {
  isOpen: boolean
  step: StepIndex
  draft: BookingDraft
  completed: boolean
  open: (prefill?: Partial<Pick<BookingDraft, 'serviceId' | 'barberId'>>) => void
  close: () => void
  goTo: (step: StepIndex) => void
  next: () => void
  back: () => void
  update: (patch: Partial<BookingDraft>) => void
  complete: () => void
  reset: () => void
  isStepComplete: (step: StepIndex) => boolean
}

const STORAGE_KEY = 'oficio-booking-draft'

const emptyDraft: BookingDraft = {
  serviceId: null,
  barberId: null,
  dateKey: null,
  start: null,
  assignedBarberId: null,
  name: '',
  phone: '',
}

function loadDraft(): BookingDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDraft
    const parsed = { ...emptyDraft, ...JSON.parse(raw) } as BookingDraft
    // Descarta seleção de data/horário que já não é válida (ex.: dia passado).
    if (parsed.dateKey && parsed.serviceId && parsed.barberId && parsed.start !== null) {
      const svc = getService(parsed.serviceId)
      const ok = svc && slotsFor(parsed.dateKey, parsed.barberId, svc.duration).some((s) => s.start === parsed.start && s.barberId)
      if (!ok) return { ...parsed, dateKey: null, start: null, assignedBarberId: null }
    }
    return parsed
  } catch {
    return emptyDraft
  }
}

export const nameError = (v: string) => {
  const t = v.trim()
  if (!t) return 'Informe seu nome.'
  if (t.length < 3 || !/\p{L}{2,}/u.test(t)) return 'Use pelo menos 3 letras.'
  return null
}

export const phoneError = (v: string) => {
  const d = v.replace(/\D/g, '')
  if (!d) return 'Informe um telefone com DDD.'
  if (d.length < 10) return 'Telefone incompleto. Use DDD + número.'
  if (d.length === 11 && d[2] !== '9') return 'Celular deve começar com 9 após o DDD.'
  return null
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [step, setStep] = useState<StepIndex>(0)
  const [draft, setDraft] = useState<BookingDraft>(loadDraft)
  const [completed, setCompleted] = useState(false)
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      /* armazenamento indisponível: segue sem persistir */
    }
  }, [draft])

  const isStepComplete = useCallback(
    (s: StepIndex) => {
      switch (s) {
        case 0:
          return !!draft.serviceId
        case 1:
          return !!draft.barberId
        case 2:
          return !!draft.dateKey
        case 3:
          return draft.start !== null
        case 4:
          return !nameError(draft.name) && !phoneError(draft.phone)
        case 5:
          return completed
      }
    },
    [draft, completed],
  )

  const firstIncomplete = useCallback(
    (d: BookingDraft): StepIndex => {
      if (!d.serviceId) return 0
      if (!d.barberId) return 1
      if (!d.dateKey) return 2
      if (d.start === null) return 3
      if (nameError(d.name) || phoneError(d.phone)) return 4
      return 5
    },
    [],
  )

  const update = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch }
      // Mudanças em etapas anteriores invalidam escolhas dependentes.
      const serviceChanged = 'serviceId' in patch && patch.serviceId !== prev.serviceId
      const barberChanged = 'barberId' in patch && patch.barberId !== prev.barberId
      const dateChanged = 'dateKey' in patch && patch.dateKey !== prev.dateKey
      if ((serviceChanged || barberChanged || dateChanged) && !('start' in patch) && next.start !== null) {
        const svc = getService(next.serviceId)
        const stillValid =
          svc && next.barberId && next.dateKey &&
          slotsFor(next.dateKey, next.barberId, svc.duration).find((s) => s.start === next.start && s.barberId)
        if (stillValid) next.assignedBarberId = stillValid.barberId
        else {
          next.start = null
          next.assignedBarberId = null
        }
      }
      return next
    })
  }, [])

  const open = useCallback<BookingContextValue['open']>(
    (prefill) => {
      const prev = draftRef.current
      // Depois de uma simulação concluída, um novo agendamento recomeça do zero.
      let next = completed ? { ...emptyDraft, name: prev.name, phone: prev.phone } : prev
      if (prefill?.serviceId && prefill.serviceId !== next.serviceId) {
        next = { ...next, serviceId: prefill.serviceId, start: null, assignedBarberId: null }
      }
      if (prefill?.barberId && prefill.barberId !== next.barberId) {
        next = { ...next, barberId: prefill.barberId, start: null, assignedBarberId: null }
      }
      setCompleted(false)
      setDraft(next)
      setStep(firstIncomplete(next))
      setOpen(true)
    },
    [firstIncomplete, completed],
  )

  const value = useMemo<BookingContextValue>(
    () => ({
      isOpen,
      step,
      draft,
      completed,
      open,
      close: () => setOpen(false),
      goTo: (s) => setStep(s),
      next: () => setStep((s) => (Math.min(5, s + 1) as StepIndex)),
      back: () => setStep((s) => (Math.max(0, s - 1) as StepIndex)),
      update,
      complete: () => setCompleted(true),
      reset: () => {
        setDraft(emptyDraft)
        setCompleted(false)
        setStep(0)
      },
      isStepComplete,
    }),
    [isOpen, step, draft, completed, open, update, isStepComplete],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking precisa de <BookingProvider>')
  return ctx
}

export { ANY_BARBER }
