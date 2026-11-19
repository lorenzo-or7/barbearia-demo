import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Img } from '../components/Img'
import { EASE_OUT, MaskText, Parallax, Reveal, RevealImage } from '../components/motion'
import { Button } from '../components/ui'
import { gallery } from '../data/gallery'
import { getService } from '../data/services'
import { useBooking } from '../features/booking/BookingContext'
import { useDialog } from '../hooks/useDialog'

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <section id="galeria" className="gallery section" aria-labelledby="gallery-title" tabIndex={-1}>
      <div className="container">
        <header className="section-head section-head--wide">
          <div>
            <Reveal>
              <p className="section-index">Nº 03 — Galeria</p>
            </Reveal>
            <MaskText id="gallery-title" className="section-title" lines={['Trabalhos que', <em key="e">saem da cadeira.</em>]} />
          </div>
          <Reveal className="section-head__aside" delay={0.15}>
            <p>Do degradê navalhado ao topete clássico. Toque em uma foto para ver em tela cheia e agendar o mesmo estilo.</p>
          </Reveal>
        </header>

        <ul className="mosaic">
          {gallery.map((item, i) => (
            <li key={item.id} className={`mosaic__item mosaic__item--${item.shape}`}>
              <button
                type="button"
                className="mosaic__btn"
                onClick={() => setIndex(i)}
                aria-label={`Ampliar: ${item.title}`}
                aria-haspopup="dialog"
              >
                <RevealImage className="mosaic__frame" delay={(i % 3) * 0.08}>
                  <Parallax distance={i % 2 ? 22 : 34} className="mosaic__parallax">
                    <Img name={item.image} sizes="(max-width: 767px) 50vw, 33vw" className="cover" />
                  </Parallax>
                </RevealImage>
                <span className="mosaic__caption">
                  <span className="mosaic__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mosaic__title">{item.title}</span>
                  <Maximize2 className="mosaic__icon" size={16} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="gallery__credit">Fotografias ilustrativas de banco de imagens licenciadas (Unsplash), substituíveis pelo portfólio da barbearia.</p>
      </div>
      <Lightbox index={index} onChange={setIndex} />
    </section>
  )
}

function Lightbox({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const open = index !== null
  const close = useCallback(() => onChange(null), [onChange])
  const [dir, setDir] = useState(1)
  const reduce = useReducedMotion()
  const { open: openBooking } = useBooking()
  useDialog(ref, open, close)

  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      setDir(delta)
      onChange((index + delta + gallery.length) % gallery.length)
    },
    [index, onChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
  }

  const item = index !== null ? gallery[index] : null
  const service = item ? getService(item.serviceId) : null

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          ref={ref}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria: ${item.title}`}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="lightbox__top">
            <p className="lightbox__count" aria-live="polite">
              <span>{String(index + 1).padStart(2, '0')}</span> / {String(gallery.length).padStart(2, '0')}
            </p>
            <button type="button" className="icon-btn icon-btn--ink" onClick={close} aria-label="Fechar galeria" data-autofocus>
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <div className="lightbox__stage">
            <button type="button" className="icon-btn icon-btn--ink lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.figure
                key={item.id}
                className="lightbox__figure"
                custom={dir}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={onDragEnd}
              >
                <Img name={item.image} sizes="(max-width: 767px) 100vw, 60vw" className="lightbox__img" />
              </motion.figure>
            </AnimatePresence>
            <button type="button" className="icon-btn icon-btn--ink lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Próxima foto">
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="lightbox__info">
            <div>
              <p className="lightbox__title">{item.title}</p>
              <p className="lightbox__note">{item.note}</p>
            </div>
            {service && (
              <Button
                arrow
                onClick={() => {
                  close()
                  openBooking({ serviceId: service.id })
                }}
              >
                Agendar este estilo · {service.name}
              </Button>
            )}
          </div>
          <p className="lightbox__hint" aria-hidden="true">
            Deslize ou use as setas do teclado
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
