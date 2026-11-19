import { AnimatePresence, motion } from 'motion/react'
import { Check, MessageCircle, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EASE_OUT, MaskText, Reveal } from '../components/motion'
import { Button } from '../components/ui'
import { site, whatsappLink } from '../config/site'
import { plans, type Plan } from '../data/plans'
import { useBooking } from '../features/booking/BookingContext'
import { useDialog } from '../hooks/useDialog'
import { formatPrice } from '../utils/format'

export function Plans() {
  const [selected, setSelected] = useState<Plan | null>(null)

  return (
    <section id="planos" className="plans section" aria-labelledby="plans-title" tabIndex={-1}>
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal>
              <p className="section-index">Nº 05 — Planos</p>
            </Reveal>
            <MaskText id="plans-title" className="section-title" lines={['O visual em dia,', <em key="e">o mês inteiro.</em>]} />
          </div>
          <Reveal className="section-head__aside" delay={0.15}>
            <p>Assinatura mensal para quem corta com frequência. Menos por visita, prioridade na agenda e benefícios na casa.</p>
          </Reveal>
        </header>

        <ul className="plans__list">
          {plans.map((p, i) => {
            const saving = p.standalone - p.monthly
            return (
              <Reveal as="li" key={p.id} className={`plan ${p.highlight ? 'plan--highlight' : ''}`} delay={i * 0.1}>
                <div className="plan__head">
                  <p className="plan__label">
                    Plano
                    {p.highlight && <span className="plan__flag">Mais escolhido</span>}
                  </p>
                  <h3 className="plan__name">{p.name}</h3>
                  <p className="plan__tagline">{p.tagline}</p>
                </div>
                <div className="plan__price">
                  <p className="plan__amount">
                    <span className="plan__currency">R$</span>
                    {p.monthly}
                    <span className="plan__per">/mês</span>
                  </p>
                  <p className="plan__compare">
                    Avulso: <s>{formatPrice(p.standalone)}</s> · economia de {formatPrice(saving)}
                  </p>
                </div>
                <div className="plan__group">
                  <p className="plan__group-title">Inclui</p>
                  <ul className="plan__items">
                    {p.includes.map((x) => (
                      <li key={x}>
                        <Check size={16} strokeWidth={1.8} aria-hidden="true" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="plan__group">
                  <p className="plan__group-title">Diferenciais</p>
                  <ul className="plan__items plan__items--muted">
                    {p.perks.map((x) => (
                      <li key={x}>
                        <span className="plan__dash" aria-hidden="true" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className="plan__cta"
                  variant={p.highlight ? 'primary' : 'outline'}
                  arrow
                  aria-haspopup="dialog"
                  onClick={() => setSelected(p)}
                >
                  {p.cta}
                </Button>
              </Reveal>
            )
          })}
        </ul>
        <p className="plans__note">Valores ilustrativos. Nenhuma cobrança ou assinatura é feita por este site.</p>
      </div>
      <PlanDialog plan={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function PlanDialog({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => onClose(), [onClose])
  const { open: openBooking } = useBooking()
  useDialog(ref, !!plan, close)

  const wa = plan
    ? whatsappLink(`Olá! Vi o site da ${site.brand.name} e quero saber mais sobre o plano ${plan.name} (${formatPrice(plan.monthly)}/mês).`)
    : null

  return createPortal(
    <AnimatePresence>
      {plan && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="overlay__backdrop" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            className="sheet plan-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-dialog-title"
            tabIndex={-1}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <div className="sheet__head">
              <div>
                <p className="eyebrow">Resumo do plano</p>
                <h2 id="plan-dialog-title" className="plan-dialog__title">
                  {plan.name} <em>{formatPrice(plan.monthly)}/mês</em>
                </h2>
              </div>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar resumo">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="plan-dialog__body">
              <p className="plan-dialog__tagline">{plan.tagline}</p>
              <dl className="plan-dialog__compare">
                <div>
                  <dt>Serviços avulsos</dt>
                  <dd>{formatPrice(plan.standalone)}</dd>
                </div>
                <div>
                  <dt>No plano</dt>
                  <dd>{formatPrice(plan.monthly)}</dd>
                </div>
                <div className="is-accent">
                  <dt>Você economiza</dt>
                  <dd>{formatPrice(plan.standalone - plan.monthly)}</dd>
                </div>
              </dl>
              <ul className="plan__items">
                {[...plan.includes, ...plan.perks].map((x) => (
                  <li key={x}>
                    <Check size={16} strokeWidth={1.8} aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="notice">
                Demonstração: nenhuma assinatura é criada e nenhum pagamento é solicitado.
                {!wa && ' O canal de atendimento comercial será configurado na versão da barbearia.'}
              </p>
            </div>

            <div className="sheet__foot">
              {wa ? (
                <a className="btn btn--primary btn--md" href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span className="btn__label">Pedir informações no WhatsApp</span>
                </a>
              ) : (
                <Button
                  arrow
                  onClick={() => {
                    onClose()
                    openBooking({ serviceId: 'corte-assinatura' })
                  }}
                >
                  Agendar uma visita para conhecer
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Voltar aos planos
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
