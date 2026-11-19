import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Img } from '../components/Img'
import { MaskText, Reveal } from '../components/motion'
import { benefits } from '../data/content'

/** Storytelling: a imagem fixa troca conforme cada diferencial cruza o centro da tela. */
export function Experience() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])
  const reduce = useReducedMotion()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        })
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="experiencia" className="experience section" aria-labelledby="experience-title" tabIndex={-1}>
      <div className="container experience__grid">
        <div className="experience__sticky">
          <div className="experience__frame" aria-hidden="true">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="experience__img"
                initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }}
                animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.5 } }}
                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              >
                <Img name={benefits[active].image} sizes="(max-width: 899px) 0px, 40vw" className="cover" alt="" />
              </motion.div>
            </AnimatePresence>
            <p className="experience__counter">
              <span>0{active + 1}</span> / 0{benefits.length}
            </p>
          </div>
        </div>

        <div className="experience__content">
          <header>
            <Reveal>
              <p className="section-index">Nº 06 — Experiência</p>
            </Reveal>
            <MaskText id="experience-title" className="section-title" lines={['Os detalhes', <em key="e">que fazem voltar.</em>]} />
          </header>
          <ol className="experience__list">
            {benefits.map((b, i) => (
              <li
                key={b.title}
                ref={(el) => {
                  refs.current[i] = el
                }}
                data-index={i}
                className={`benefit ${active === i ? 'is-active' : ''}`}
              >
                <div className="benefit__media">
                  <Img name={b.image} sizes="(max-width: 899px) 92vw, 0px" className="cover" alt="" />
                </div>
                <span className="benefit__num" aria-hidden="true">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="benefit__title">{b.title}</h3>
                  <p className="benefit__text">{b.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
