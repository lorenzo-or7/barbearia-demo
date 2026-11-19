import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, type ElementType, type ReactNode, type RefObject } from 'react'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

interface MaskTextProps {
  /** Cada item vira uma linha revelada por máscara. */
  lines: ReactNode[]
  as?: ElementType
  className?: string
  delay?: number
  /** Revela ao montar (hero) em vez de ao entrar na viewport. */
  immediate?: boolean
  stagger?: number
  id?: string
}

/** Headline com revelação tipográfica linha a linha por máscara. */
export function MaskText({ lines, as: Tag = 'h2', className, delay = 0, immediate, stagger = 0.09, id }: MaskTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const show = immediate || inView
  return (
    <Tag ref={ref} className={className} id={id}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span
            className="mask-line__inner"
            initial={reduce ? false : { y: '108%' }}
            animate={show ? { y: '0%' } : undefined}
            transition={{ duration: 1.05, ease: EASE_OUT, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'p' | 'section' | 'article' | 'span'
  immediate?: boolean
}

/** Fade + deslocamento curto ao entrar na viewport. */
export function Reveal({ children, className, delay = 0, y = 24, as = 'div', immediate }: RevealProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  const anim = { opacity: 1, y: 0 }
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      {...(immediate ? { animate: anim } : { whileInView: anim, viewport: { once: true, margin: '0px 0px -10% 0px' } })}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </Comp>
  )
}

interface RevealImageProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Direção da cortina. */
  from?: 'bottom' | 'top' | 'left' | 'right'
  immediate?: boolean
  duration?: number
}

const curtains = {
  bottom: 'inset(100% 0% 0% 0%)',
  top: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
}

/** Revelação cinematográfica: cortina por clip-path + leve recuo de escala. */
export function RevealImage({ children, className, delay = 0, from = 'bottom', immediate, duration = 1.4 }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const reduce = useReducedMotion()
  const show = immediate || inView
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { clipPath: curtains[from] }}
      animate={show ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      transition={{ duration, ease: EASE_IN_OUT, delay }}
    >
      <motion.div
        className="reveal-image__inner"
        initial={reduce ? false : { scale: 1.18 }}
        animate={show ? { scale: 1 } : undefined}
        transition={{ duration: duration + 0.5, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Parallax vertical sutil baseado na posição do elemento na viewport. */
export function useParallax(distance = 60): { ref: RefObject<HTMLDivElement | null>; y: MotionValue<number> | number } {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])
  return { ref, y: reduce ? 0 : y }
}

export function Parallax({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const { ref, y } = useParallax(distance)
  return (
    <div ref={ref} className={`parallax ${className ?? ''}`}>
      <motion.div className="parallax__inner" style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
