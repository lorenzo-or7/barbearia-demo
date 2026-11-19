import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef } from 'react'
import { Img } from '../components/Img'
import { EASE_OUT, MaskText, Reveal, RevealImage } from '../components/motion'
import { Button, DemoTag } from '../components/ui'
import { site } from '../config/site'
import { hero } from '../data/content'
import { getBarber } from '../data/team'
import { useBooking } from '../features/booking/BookingContext'
import { nextAvailable } from '../features/booking/schedule'
import { formatShortDate, minutesToTime, toDateKey } from '../utils/format'

function useNextSlotLabel() {
  return useMemo(() => {
    const slot = nextAvailable(45)
    if (!slot) return null
    const today = toDateKey(new Date())
    const day = slot.dateKey === today ? 'hoje' : formatShortDate(slot.dateKey)
    return { text: `${day}, ${minutesToTime(slot.start)}`, barber: getBarber(slot.barberId)?.name.split(' ')[0] }
  }, [])
}

export function Hero() {
  const { open } = useBooking()
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const detailY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const next = useNextSlotLabel()

  return (
    <section ref={ref} id="topo" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
      <div className="hero__media">
        <RevealImage className="hero__frame" immediate delay={0.15} duration={1.6}>
          <motion.div className="hero__img-wrap" style={{ y: reduce ? 0 : imgY }}>
            <picture>
              <source media="(max-width: 767px)" srcSet={`${import.meta.env.BASE_URL}images/hero-mobile-480.webp 480w, ${import.meta.env.BASE_URL}images/hero-mobile-960.webp 960w`} sizes="100vw" />
              <Img name="hero" priority sizes="(max-width: 767px) 100vw, 58vw" className="hero__img" />
            </picture>
          </motion.div>
        </RevealImage>

        <motion.div className="hero__detail" style={{ y: reduce ? 0 : detailY }}>
          <RevealImage className="hero__detail-frame" immediate delay={0.95} from="left" duration={1.2}>
            <Img name="hero-detail" sizes="(max-width: 767px) 0px, 18vw" className="hero__detail-img" />
          </RevealImage>
          <Reveal className="hero__detail-caption" immediate delay={1.5} y={10}>
            Barba na tesoura · acabamento à navalha
          </Reveal>
        </motion.div>
      </div>

      <motion.div className="hero__content container" style={{ y: reduce ? 0 : textY }}>
        <Reveal className="hero__eyebrow" immediate delay={0.3} y={12}>
          <span className="eyebrow">{hero.eyebrow}</span>
          <span className="hero__eyebrow-rule" aria-hidden="true" />
          <span className="eyebrow eyebrow--muted">{site.address.short}</span>
        </Reveal>

        <MaskText
          as="h1"
          id="hero-title"
          className="hero__title"
          immediate
          delay={0.45}
          stagger={0.12}
          lines={[
            hero.titleTop,
            <span key="b" className="hero__title-indent">
              {hero.titleBottom.split(' ')[0]}
            </span>,
            <em key="c">{hero.titleBottom.split(' ').slice(1).join(' ')}</em>,
          ]}
        />

        <Reveal className="hero__lead" immediate delay={0.95}>
          <p>{hero.lead}</p>
        </Reveal>

        <Reveal className="hero__ctas" immediate delay={1.08}>
          <Button size="lg" arrow onClick={() => open()}>
            {hero.primaryCta}
          </Button>
          <a href="#servicos" className="btn btn--outline btn--lg">
            <span className="btn__label">{hero.secondaryCta}</span>
          </a>
        </Reveal>

        <Reveal className="hero__meta" immediate delay={1.3} y={10}>
          {next && (
            <p className="hero__next">
              <span className="pulse-dot" aria-hidden="true" />
              Próximo horário livre: <strong>{next.text}</strong>
              {next.barber && <span className="hero__next-barber"> com {next.barber}</span>}
            </p>
          )}
          <DemoTag>Marca fictícia · agenda simulada</DemoTag>
        </Reveal>
      </motion.div>

      <motion.a
        href="#manifesto"
        className="hero__scroll"
        aria-label="Rolar para a próxima seção"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8, ease: EASE_OUT }}
      >
        <span className="hero__scroll-label">Role</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </motion.a>
    </section>
  )
}
