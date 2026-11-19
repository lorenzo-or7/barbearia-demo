import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EASE_OUT } from '../../components/motion'
import { Button } from '../../components/ui'
import { getService } from '../../data/services'
import { getBarber } from '../../data/team'
import { useDialog } from '../../hooks/useDialog'
import { formatDuration, formatPrice, formatShortDate, minutesToTime } from '../../utils/format'
import { STEPS, useBooking, type StepIndex } from './BookingContext'
import { StepBarber, StepDate, StepDetails, StepDone, StepReview, StepService, StepTime } from './steps'

export function BookingDialog() {
  const { isOpen, close, step, goTo, next, back, isStepComplete, completed, draft, complete } = useBooking()
  const ref = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduce = useReducedMotion()
  const [dir, setDir] = useState(1)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const prevStep = useRef(step)
  const onClose = useCallback(() => close(), [close])
  useDialog(ref, isOpen, onClose)

  // Direção da transição e foco no título da etapa a cada mudança.
  useEffect(() => {
    setDir(step >= prevStep.current ? 1 : -1)
    prevStep.current = step
    setShowErrors(false)
    bodyRef.current?.scrollTo({ top: 0 })
  }, [step])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 420)
    return () => clearTimeout(t)
  }, [step, completed, isOpen])

  const canGo = (target: StepIndex) => {
    for (let s = 0; s < target; s++) if (!isStepComplete(s as StepIndex)) return false
    return true
  }

  const handleNext = () => {
    if (!isStepComplete(step)) {
      setShowErrors(true)
      return
    }
    next()
  }

  const finish = () => {
    setSubmitting(true)
    // Simulação local: apenas uma pausa curta para o feedback de processamento.
    setTimeout(
      () => {
        setSubmitting(false)
        complete()
      },
      reduce ? 200 : 1100,
    )
  }

  const service = getService(draft.serviceId)
  const stepContent = completed ? (
    <StepDone headingRef={headingRef} />
  ) : (
    [
      <StepService key="s0" headingRef={headingRef} onPicked={() => setTimeout(next, reduce ? 0 : 260)} />,
      <StepBarber key="s1" headingRef={headingRef} onPicked={() => setTimeout(next, reduce ? 0 : 260)} />,
      <StepDate key="s2" headingRef={headingRef} onPicked={() => setTimeout(next, reduce ? 0 : 260)} showError={showErrors} />,
      <StepTime key="s3" headingRef={headingRef} showError={showErrors} />,
      <StepDetails key="s4" headingRef={headingRef} showErrors={showErrors} onSubmit={handleNext} />,
      <StepReview key="s5" headingRef={headingRef} />,
    ][step]
  )

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="overlay overlay--booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <div className="overlay__backdrop" onClick={close} aria-hidden="true" />
          <motion.div
            ref={ref}
            className="booking"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, clipPath: 'inset(8% 0% 0% 0% round 6px)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 6px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, ease: EASE_OUT }}
          >
            <div className="booking__main">
              <div className="booking__top">
                <h2 id="booking-title" className="booking__title">
                  Agendamento <span className="booking__title-tag">demonstrativo</span>
                </h2>
                <button type="button" className="icon-btn" onClick={close} aria-label="Fechar agendamento">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {!completed && (
                <nav className="stepper" aria-label="Etapas do agendamento">
                  <p className="stepper__mobile" aria-hidden="true">
                    Etapa {step + 1} de {STEPS.length} · <strong>{STEPS[step]}</strong>
                  </p>
                  <div className="stepper__progress" aria-hidden="true">
                    <motion.span
                      className="stepper__progress-bar"
                      animate={{ scaleX: (step + 1) / STEPS.length }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                  </div>
                  <ol className="stepper__list">
                    {STEPS.map((label, i) => {
                      const idx = i as StepIndex
                      const done = isStepComplete(idx) && i !== step
                      const reachable = canGo(idx)
                      return (
                        <li key={label}>
                          <button
                            type="button"
                            className={`stepper__item ${i === step ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
                            aria-current={i === step ? 'step' : undefined}
                            disabled={!reachable}
                            onClick={() => goTo(idx)}
                          >
                            <span className="stepper__num">{done ? <Check size={12} strokeWidth={2.4} aria-hidden="true" /> : `0${i + 1}`}</span>
                            <span className="stepper__label">{label}</span>
                            {done && <span className="sr-only"> (concluída)</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                </nav>
              )}

              <div className="booking__body" ref={bodyRef}>
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={completed ? 'done' : step}
                    className="booking__step"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 36 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -24 }}
                    transition={{ duration: 0.38, ease: EASE_OUT }}
                  >
                    {stepContent}
                  </motion.div>
                </AnimatePresence>
              </div>

              {!completed && (
                <div className="booking__foot">
                  <div className="booking__foot-summary" aria-hidden={step === 5}>
                    {service ? (
                      <>
                        <span className="booking__foot-name">{service.name}</span>
                        <span className="booking__foot-price">
                          {formatPrice(service.price)} · {formatDuration(service.duration)}
                        </span>
                      </>
                    ) : (
                      <span className="booking__foot-name muted">Nenhum serviço escolhido</span>
                    )}
                  </div>
                  <div className="booking__foot-actions">
                    {step > 0 && (
                      <Button variant="ghost" onClick={back} icon={<ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />}>
                        Voltar
                      </Button>
                    )}
                    {step < 5 ? (
                      <Button arrow onClick={handleNext} aria-disabled={!isStepComplete(step)} className={!isStepComplete(step) ? 'is-soft-disabled' : ''}>
                        Continuar
                      </Button>
                    ) : (
                      <Button arrow onClick={finish} disabled={submitting} aria-busy={submitting}>
                        {submitting ? 'Processando simulação…' : 'Concluir simulação'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <BookingSummary />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function BookingSummary() {
  const { draft, goTo, completed, isStepComplete } = useBooking()
  const service = getService(draft.serviceId)
  const barber = draft.barberId === 'any' ? null : getBarber(draft.barberId)
  const assigned = getBarber(draft.assignedBarberId)
  const rows: { label: string; value: string | null; step: StepIndex }[] = [
    { label: 'Serviço', value: service?.name ?? null, step: 0 },
    {
      label: 'Profissional',
      value: draft.barberId === 'any' ? (assigned ? `Sem preferência · ${assigned.name.split(' ')[0]}` : 'Sem preferência') : barber?.name ?? null,
      step: 1,
    },
    { label: 'Data', value: draft.dateKey ? formatShortDate(draft.dateKey) : null, step: 2 },
    { label: 'Horário', value: draft.start !== null ? minutesToTime(draft.start) : null, step: 3 },
  ]
  return (
    <aside className="booking__aside" aria-label="Resumo do agendamento">
      <p className="eyebrow eyebrow--ink">Resumo</p>
      <dl className="summary">
        {rows.map((r) => (
          <div key={r.label} className="summary__row">
            <dt>{r.label}</dt>
            <dd>
              {r.value ?? <span className="summary__empty">—</span>}
              {r.value && !completed && (isStepComplete(r.step) || r.step === 0) && (
                <button type="button" className="summary__edit" onClick={() => goTo(r.step)}>
                  Alterar<span className="sr-only"> {r.label.toLowerCase()}</span>
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="summary__total">
        <span>Total</span>
        <strong>{service ? formatPrice(service.price) : '—'}</strong>
      </div>
      {service && <p className="summary__duration">Duração prevista: {formatDuration(service.duration)}</p>}
      <p className="summary__note">Agenda simulada para demonstração. Nenhum horário é reservado e nenhum dado sai do seu navegador.</p>
    </aside>
  )
}
