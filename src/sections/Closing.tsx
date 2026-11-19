import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Img } from '../components/Img'
import { MaskText, Reveal } from '../components/motion'
import { Button } from '../components/ui'
import { closing } from '../data/content'
import { useBooking } from '../features/booking/BookingContext'

/** CTA final: a fotografia abre de uma janela estreita para tela cheia conforme o scroll. */
export function Closing() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { open } = useBooking()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(18% 22% 18% 22%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1])

  return (
    <section ref={ref} id="agendar" className="closing" aria-labelledby="closing-title" tabIndex={-1}>
      <motion.div className="closing__media" style={reduce ? undefined : { clipPath: clip }} aria-hidden="true">
        <motion.div className="closing__img" style={reduce ? undefined : { scale }}>
          <Img name="room" sizes="100vw" className="cover" alt="" />
        </motion.div>
        <div className="closing__scrim" />
      </motion.div>
      <div className="closing__content container">
        <Reveal>
          <p className="eyebrow eyebrow--ink">{closing.eyebrow}</p>
        </Reveal>
        <MaskText id="closing-title" className="closing__title" lines={['O próximo corte', <em key="e">começa aqui.</em>]} />
        <Reveal delay={0.25}>
          <Button size="lg" arrow className="btn--on-ink" onClick={() => open()}>
            {closing.cta}
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
