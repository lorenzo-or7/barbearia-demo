import { motion, useReducedMotion } from 'motion/react'
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, MessageCircle, RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { Img } from '../../components/Img'
import { Button } from '../../components/ui'
import { site, whatsappLink } from '../../config/site'
import { categories, getService, services } from '../../data/services'
import { ANY_BARBER, getBarber, team } from '../../data/team'
import {
  addDays,
  formatDuration,
  formatLongDate,
  formatMonthYear,
  formatPrice,
  fromDateKey,
  maskPhone,
  minutesToTime,
  toDateKey,
} from '../../utils/format'
import { nameError, phoneError, useBooking } from './BookingContext'
import { bookingWindow, dayStatus, slotsFor, type DayStatus } from './schedule'

type HeadingRef = RefObject<HTMLHeadingElement | null>

function StepHeading({ headingRef, title, hint }: { headingRef: HeadingRef; title: string; hint?: string }) {
  return (
    <header className="step-head">
      <h3 ref={headingRef} tabIndex={-1} className="step-head__title">
        {title}
      </h3>
      {hint && <p className="step-head__hint">{hint}</p>}
    </header>
  )
}

/* 01 — Serviço ------------------------------------------------------------ */
export function StepService({ headingRef, onPicked }: { headingRef: HeadingRef; onPicked: () => void }) {
  const { draft, update } = useBooking()
  return (
    <>
      <StepHeading headingRef={headingRef} title="Qual serviço você quer?" hint="Duração e valor aparecem em cada opção." />
      <div className="choice-groups">
        {categories.map((c) => (
          <fieldset key={c.id} className="choice-group">
            <legend className="choice-group__title">{c.label}</legend>
            <div className="choices">
              {services
                .filter((s) => s.category === c.id)
                .map((s) => (
                  <label key={s.id} className={`choice ${draft.serviceId === s.id ? 'is-checked' : ''}`}>
                    <input
                      type="radio"
                      name="service"
                      className="sr-only"
                      value={s.id}
                      checked={draft.serviceId === s.id}
                      onChange={() => update({ serviceId: s.id })}
                      onClick={(e) => e.detail > 0 && draft.serviceId !== s.id && onPicked()}
                    />
                    <span className="choice__mark" aria-hidden="true" />
                    <span className="choice__text">
                      <span className="choice__name">{s.name}</span>
                      <span className="choice__sub">
                        <Clock size={13} strokeWidth={1.6} aria-hidden="true" /> {formatDuration(s.duration)}
                      </span>
                    </span>
                    <span className="choice__price">{formatPrice(s.price)}</span>
                  </label>
                ))}
            </div>
          </fieldset>
        ))}
      </div>
    </>
  )
}

/* 02 — Profissional ------------------------------------------------------- */
export function StepBarber({ headingRef, onPicked }: { headingRef: HeadingRef; onPicked: () => void }) {
  const { draft, update } = useBooking()
  const service = getService(draft.serviceId)
  const options = team.map((b) => ({ id: b.id, name: b.name, role: b.role, image: b.image, signature: service ? b.signatureServices.includes(service.id) : false }))
  return (
    <>
      <StepHeading headingRef={headingRef} title="Com quem você quer cortar?" hint="Os horários da próxima etapa seguem a agenda do profissional." />
      <div className="barber-choices" role="radiogroup" aria-label="Profissional">
        {options.map((o) => (
          <label key={o.id} className={`barber-choice ${draft.barberId === o.id ? 'is-checked' : ''}`}>
            <input
              type="radio"
              name="barber"
              className="sr-only"
              checked={draft.barberId === o.id}
              onChange={() => update({ barberId: o.id })}
              onClick={(e) => e.detail > 0 && draft.barberId !== o.id && onPicked()}
            />
            <span className="barber-choice__photo">
              <Img name={o.image} sizes="96px" className="cover" alt="" />
            </span>
            <span className="barber-choice__text">
              <span className="barber-choice__name">{o.name}</span>
              <span className="barber-choice__role">{o.role}</span>
              {o.signature && <span className="barber-choice__badge">Referência neste serviço</span>}
            </span>
            <span className="choice__mark" aria-hidden="true" />
          </label>
        ))}
        <label className={`barber-choice barber-choice--any ${draft.barberId === ANY_BARBER ? 'is-checked' : ''}`}>
          <input
            type="radio"
            name="barber"
            className="sr-only"
            checked={draft.barberId === ANY_BARBER}
            onChange={() => update({ barberId: ANY_BARBER })}
            onClick={(e) => e.detail > 0 && draft.barberId !== ANY_BARBER && onPicked()}
          />
          <span className="barber-choice__photo barber-choice__photo--icon" aria-hidden="true">
            <Shuffle size={22} strokeWidth={1.4} />
          </span>
          <span className="barber-choice__text">
            <span className="barber-choice__name">Sem preferência</span>
            <span className="barber-choice__role">Mostra o primeiro profissional livre em cada horário</span>
          </span>
          <span className="choice__mark" aria-hidden="true" />
        </label>
      </div>
    </>
  )
}

/* 03 — Data --------------------------------------------------------------- */
const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const WEEK_FULL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

const statusLabel: Record<DayStatus, string> = {
  past: 'data passada',
  out: 'fora do período de agendamento',
  closed: 'fechado',
  off: 'folga do profissional',
  full: 'sem horários livres',
  few: 'poucos horários',
  open: 'horários disponíveis',
}

export function StepDate({ headingRef, onPicked, showError }: { headingRef: HeadingRef; onPicked: () => void; showError: boolean }) {
  const { draft, update } = useBooking()
  const service = getService(draft.serviceId)
  const duration = service?.duration ?? 30
  const barberId = draft.barberId ?? ANY_BARBER
  const now = useMemo(() => new Date(), [])
  const { first, last } = bookingWindow(now)
  const initialMonth = draft.dateKey ? fromDateKey(draft.dateKey) : first
  const [month, setMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1))
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)

  const canPrev = month > new Date(first.getFullYear(), first.getMonth(), 1)
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= last

  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return {
      offset: start.getDay(),
      list: Array.from({ length: count }, (_, i) => {
        const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
        return { date: d, key: toDateKey(d), status: dayStatus(d, barberId, duration, now) }
      }),
    }
  }, [month, barberId, duration, now])

  const selectable = (s: DayStatus) => s === 'open' || s === 'few'

  useEffect(() => {
    if (!focusKey) return
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${focusKey}"]`)?.focus()
  }, [focusKey, days])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!delta) return
    e.preventDefault()
    const target = addDays(date, delta)
    if (target < first || target > last) return
    if (target.getMonth() !== month.getMonth()) setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
    setFocusKey(toDateKey(target))
  }

  const pick = (key: string, viaPointer: boolean) => {
    const changed = key !== draft.dateKey
    update({ dateKey: key })
    if (changed && viaPointer) onPicked()
  }

  // Dia que recebe o Tab: selecionado, ou o primeiro disponível do mês.
  const tabKey = days.list.find((d) => d.key === draft.dateKey)?.key ?? days.list.find((d) => selectable(d.status))?.key ?? days.list[0]?.key

  return (
    <>
      <StepHeading
        headingRef={headingRef}
        title="Escolha o dia"
        hint={`Agenda dos próximos ${site.booking.maxDaysAhead} dias${draft.barberId && draft.barberId !== ANY_BARBER ? ` de ${getBarber(draft.barberId)?.name.split(' ')[0]}` : ''}. Use as setas do teclado para navegar.`}
      />
      <div className="calendar">
        <div className="calendar__head">
          <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Mês anterior">
            <ChevronLeft size={18} strokeWidth={1.6} />
          </button>
          <p className="calendar__month" aria-live="polite">
            {formatMonthYear(month)}
          </p>
          <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} disabled={!canNext} aria-label="Próximo mês">
            <ChevronRight size={18} strokeWidth={1.6} />
          </button>
        </div>
        <div className="calendar__week" aria-hidden="true">
          {WEEK.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
        <div className="calendar__grid" ref={gridRef} role="group" aria-label={`Dias de ${formatMonthYear(month)}`}>
          {Array.from({ length: days.offset }, (_, i) => (
            <span key={`e${i}`} aria-hidden="true" />
          ))}
          {days.list.map((d) => {
            const ok = selectable(d.status)
            const selected = d.key === draft.dateKey
            const isToday = d.key === toDateKey(now)
            const inWindow = d.status !== 'past' && d.status !== 'out'
            return (
              <button
                key={d.key}
                type="button"
                data-key={d.key}
                className={`day day--${d.status} ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                aria-disabled={!ok}
                disabled={!inWindow}
                aria-pressed={selected}
                aria-label={`${d.date.getDate()}, ${WEEK_FULL[d.date.getDay()]}${isToday ? ', hoje' : ''} — ${statusLabel[d.status]}`}
                tabIndex={d.key === tabKey ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, d.date)}
                onClick={(e) => ok && pick(d.key, e.detail > 0)}
              >
                <span className="day__num">{d.date.getDate()}</span>
                {inWindow && d.status !== 'closed' && <span className="day__dot" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <ul className="calendar__legend" aria-label="Legenda">
          <li>
            <span className="legend legend--open" /> Disponível
          </li>
          <li>
            <span className="legend legend--few" /> Poucos horários
          </li>
          <li>
            <span className="legend legend--full" /> Lotado, folga ou fechado
          </li>
        </ul>
      </div>
      {showError && !draft.dateKey && (
        <p className="field-error" role="alert">
          Escolha um dia disponível para continuar.
        </p>
      )}
    </>
  )
}

/* 04 — Horário ------------------------------------------------------------ */
export function StepTime({ headingRef, showError }: { headingRef: HeadingRef; showError: boolean }) {
  const { draft, update } = useBooking()
  const service = getService(draft.serviceId)
  const reduce = useReducedMotion()
  const [loading, setLoading] = useState(true)

  // Pequena espera para comunicar a consulta à agenda (simulada, local).
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), reduce ? 0 : 450)
    return () => clearTimeout(t)
  }, [reduce])

  const slots = useMemo(() => {
    if (!draft.dateKey || !draft.barberId || !service) return []
    return slotsFor(draft.dateKey, draft.barberId, service.duration)
  }, [draft.dateKey, draft.barberId, service])

  const groups = [
    { label: 'Manhã', from: 0, to: 12 * 60 },
    { label: 'Tarde', from: 12 * 60, to: 18 * 60 },
    { label: 'Noite', from: 18 * 60, to: 24 * 60 },
  ]
    .map((g) => ({ ...g, slots: slots.filter((s) => s.start >= g.from && s.start < g.to) }))
    .filter((g) => g.slots.length)

  const freeCount = slots.filter((s) => s.barberId).length

  return (
    <>
      <StepHeading
        headingRef={headingRef}
        title="Agora, o horário"
        hint={draft.dateKey ? `${formatLongDate(draft.dateKey)} · ${service ? formatDuration(service.duration) : ''} de atendimento` : undefined}
      />
      {loading ? (
        <div className="slots-loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Consultando a agenda…
        </div>
      ) : freeCount === 0 ? (
        <div className="empty">
          <p>Nenhum horário livre neste dia para a duração do serviço.</p>
          <p className="muted">Volte uma etapa e escolha outra data, ou troque para "Sem preferência".</p>
        </div>
      ) : (
        <div className="slot-groups">
          <p className="slot-groups__count">{freeCount} horários livres</p>
          {groups.map((g, gi) => (
            <fieldset key={g.label} className="slot-group">
              <legend className="choice-group__title">{g.label}</legend>
              <div className="slots">
                {g.slots.map((s, i) => {
                  const free = !!s.barberId
                  const selected = draft.start === s.start
                  return (
                    <motion.button
                      key={s.start}
                      type="button"
                      className={`slot ${selected ? 'is-selected' : ''}`}
                      disabled={!free}
                      aria-pressed={selected}
                      aria-label={`${minutesToTime(s.start)}${free ? '' : ', indisponível'}${free && draft.barberId === ANY_BARBER ? ` com ${getBarber(s.barberId)?.name.split(' ')[0]}` : ''}`}
                      onClick={() => free && update({ start: s.start, assignedBarberId: s.barberId })}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.06 + i * 0.015, duration: 0.35 }}
                    >
                      {minutesToTime(s.start)}
                    </motion.button>
                  )
                })}
              </div>
            </fieldset>
          ))}
          {draft.barberId === ANY_BARBER && draft.start !== null && (
            <p className="slot-groups__assigned">
              Neste horário você seria atendido por <strong>{getBarber(draft.assignedBarberId)?.name}</strong>.
            </p>
          )}
        </div>
      )}
      {showError && draft.start === null && !loading && (
        <p className="field-error" role="alert">
          Escolha um horário disponível para continuar.
        </p>
      )}
    </>
  )
}

/* 05 — Seus dados --------------------------------------------------------- */
export function StepDetails({ headingRef, showErrors, onSubmit }: { headingRef: HeadingRef; showErrors: boolean; onSubmit: () => void }) {
  const { draft, update } = useBooking()
  const [touched, setTouched] = useState({ name: false, phone: false })
  const nameId = useId()
  const phoneId = useId()
  const nErr = nameError(draft.name)
  const pErr = phoneError(draft.phone)
  const showName = (touched.name || showErrors) && nErr
  const showPhone = (touched.phone || showErrors) && pErr

  useEffect(() => {
    if (!showErrors) return
    const target = nErr ? nameId : pErr ? phoneId : null
    if (target) document.getElementById(target)?.focus()
  }, [showErrors, nErr, pErr, nameId, phoneId])

  return (
    <>
      <StepHeading headingRef={headingRef} title="Como podemos te chamar?" hint="Só nome e telefone. Nada além disso." />
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setTouched({ name: true, phone: true })
          onSubmit()
        }}
      >
        <div className={`field ${showName ? 'has-error' : ''}`}>
          <label htmlFor={nameId} className="field__label">
            Nome
          </label>
          <input
            id={nameId}
            className="field__input"
            type="text"
            autoComplete="name"
            value={draft.name}
            maxLength={60}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={!!showName}
            aria-describedby={showName ? `${nameId}-err` : undefined}
            placeholder="Como está no seu documento ou como prefere"
          />
          {showName && (
            <p id={`${nameId}-err`} className="field-error">
              {nErr}
            </p>
          )}
        </div>
        <div className={`field ${showPhone ? 'has-error' : ''}`}>
          <label htmlFor={phoneId} className="field__label">
            Celular com DDD
          </label>
          <input
            id={phoneId}
            className="field__input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={draft.phone}
            onChange={(e) => update({ phone: maskPhone(e.target.value) })}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={!!showPhone}
            aria-describedby={`${phoneId}-hint${showPhone ? ` ${phoneId}-err` : ''}`}
            placeholder="(00) 00000-0000"
          />
          <p id={`${phoneId}-hint`} className="field__hint">
            Usado só para confirmar o horário. Nesta demonstração, nada é enviado.
          </p>
          {showPhone && (
            <p id={`${phoneId}-err`} className="field-error">
              {pErr}
            </p>
          )}
        </div>
        <button type="submit" className="sr-only" tabIndex={-1}>
          Continuar
        </button>
      </form>
    </>
  )
}

/* 06 — Revisão ------------------------------------------------------------ */
export function StepReview({ headingRef }: { headingRef: HeadingRef }) {
  const { draft, goTo } = useBooking()
  const service = getService(draft.serviceId)
  const assigned = getBarber(draft.assignedBarberId)
  const rows: { label: string; value: string; step: 0 | 1 | 2 | 3 | 4 }[] = [
    { label: 'Serviço', value: service?.name ?? '—', step: 0 },
    { label: 'Profissional', value: draft.barberId === ANY_BARBER ? `${assigned?.name ?? '—'} (sem preferência)` : assigned?.name ?? getBarber(draft.barberId)?.name ?? '—', step: 1 },
    { label: 'Data', value: draft.dateKey ? formatLongDate(draft.dateKey) : '—', step: 2 },
    { label: 'Horário', value: draft.start !== null ? minutesToTime(draft.start) : '—', step: 3 },
    { label: 'Duração', value: service ? formatDuration(service.duration) : '—', step: 0 },
    { label: 'Valor', value: service ? formatPrice(service.price) : '—', step: 0 },
    { label: 'Nome', value: draft.name.trim(), step: 4 },
    { label: 'Celular', value: draft.phone, step: 4 },
  ]
  return (
    <>
      <StepHeading headingRef={headingRef} title="Confira antes de concluir" hint="Toque em alterar para corrigir qualquer etapa." />
      <dl className="review">
        {rows.map((r) => (
          <div key={r.label} className="review__row">
            <dt>{r.label}</dt>
            <dd>
              <span>{r.value}</span>
              {r.label !== 'Duração' && r.label !== 'Valor' && (
                <button type="button" className="summary__edit" onClick={() => goTo(r.step)}>
                  Alterar<span className="sr-only"> {r.label.toLowerCase()}</span>
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="notice">
        Este é um fluxo demonstrativo. Ao concluir, nenhum horário é reservado e nenhum dado é enviado a servidores.
      </p>
    </>
  )
}

/* Concluído --------------------------------------------------------------- */
export function StepDone({ headingRef }: { headingRef: HeadingRef }) {
  const { draft, reset, close } = useBooking()
  const service = getService(draft.serviceId)
  const assigned = getBarber(draft.assignedBarberId)
  const reduce = useReducedMotion()
  const message =
    service && draft.dateKey && draft.start !== null
      ? `Olá! Gostaria de agendar ${service.name} em ${formatLongDate(draft.dateKey)} às ${minutesToTime(draft.start)}${assigned ? ` com ${assigned.name}` : ''}. Nome: ${draft.name.trim()}.`
      : ''
  const wa = message ? whatsappLink(message) : null

  return (
    <div className="done">
      <motion.span
        className="done__mark"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        aria-hidden="true"
      >
        <CalendarCheck size={28} strokeWidth={1.4} />
      </motion.span>
      <h3 ref={headingRef} tabIndex={-1} className="done__title">
        Simulação concluída
      </h3>
      <p className="done__lead">
        {service?.name} · {draft.dateKey && formatLongDate(draft.dateKey)} às {draft.start !== null && minutesToTime(draft.start)}
        {assigned && ` · ${assigned.name}`}
      </p>
      <p className="done__text">
        Nenhum horário foi reservado. Na versão da barbearia, este é o momento em que o pedido chega à agenda real e o cliente recebe a confirmação.
      </p>
      <div className="done__actions">
        {wa && (
          <a className="btn btn--primary btn--md" href={wa} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className="btn__label">Enviar pedido pelo WhatsApp</span>
          </a>
        )}
        <Button variant={wa ? 'outline' : 'primary'} icon={<RotateCcw size={16} strokeWidth={1.6} aria-hidden="true" />} onClick={reset}>
          Simular novo agendamento
        </Button>
        <Button variant="ghost" onClick={close}>
          Voltar ao site
        </Button>
      </div>
    </div>
  )
}
