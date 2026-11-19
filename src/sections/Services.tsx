import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Clock } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Img } from '../components/Img'
import { EASE_OUT, MaskText, Reveal } from '../components/motion'
import type { ImageName } from '../data/images'
import { categories, services, sortOptions, sortServices, type ServiceCategory, type SortKey } from '../data/services'
import { useBooking } from '../features/booking/BookingContext'
import { formatDuration, formatPrice } from '../utils/format'

type Filter = 'todos' | ServiceCategory

const filterImage: Record<Filter, ImageName> = {
  todos: 'tools-wood',
  cortes: 'svc-cut',
  barba: 'svc-beard',
  combos: 'svc-clipper',
  tratamentos: 'svc-towel',
}

const filterCaption: Record<Filter, string> = {
  todos: 'Tesouras e navalhas higienizadas a cada atendimento.',
  cortes: 'Tesoura, máquina e navalha: o corte começa pela conversa.',
  barba: 'Toalha quente, óleo e navalha. Sem pressa.',
  combos: 'Corte e barba alinhados no mesmo horário.',
  tratamentos: 'Pele e fios tratados antes do acabamento.',
}

export function Services() {
  const [filter, setFilter] = useState<Filter>('todos')
  const [sort, setSort] = useState<SortKey>('recomendados')
  const { open } = useBooking()
  const reduce = useReducedMotion()
  const sortId = useId()

  const list = useMemo(
    () => sortServices(filter === 'todos' ? services : services.filter((s) => s.category === filter), sort),
    [filter, sort],
  )
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { todos: services.length, cortes: 0, barba: 0, combos: 0, tratamentos: 0 }
    services.forEach((s) => c[s.category]++)
    return c
  }, [])

  const filters: { id: Filter; label: string }[] = [{ id: 'todos', label: 'Todos' }, ...categories]

  return (
    <section id="servicos" className="services section" aria-labelledby="services-title" tabIndex={-1}>
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal>
              <p className="section-index">Nº 02 — Serviços</p>
            </Reveal>
            <MaskText id="services-title" className="section-title" lines={['Escolha o serviço.', <em key="e">A gente cuida do resto.</em>]} />
          </div>
          <Reveal className="section-head__aside" delay={0.15}>
            <p>Valores e duração de cada atendimento. Escolha um serviço e o agendamento já abre com ele selecionado.</p>
          </Reveal>
        </header>

        <div className="services__layout">
          <aside className="services__visual" aria-hidden="true">
            <div className="services__visual-frame">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={filter}
                  className="services__visual-img"
                  initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
                  animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.3 } }}
                  transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                >
                  <Img name={filterImage[filter]} sizes="(max-width: 1023px) 0px, 30vw" className="cover" alt="" />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="services__visual-caption">{filterCaption[filter]}</p>
          </aside>

          <div className="services__catalog">
            <div className="services__controls">
              <div className="filters" role="toolbar" aria-label="Filtrar serviços por categoria">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="filter"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                    <span className="filter__count">{counts[f.id]}</span>
                    {filter === f.id && (
                      <motion.span className="filter__bar" layoutId="filter-bar" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="sort">
                <label htmlFor={sortId} className="sort__label">
                  Ordenar
                </label>
                <select id={sortId} className="sort__select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              {list.length} serviços exibidos
            </p>

            <motion.ul className="service-list" layout={!reduce}>
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((s, i) => (
                  <motion.li
                    key={s.id}
                    layout={!reduce}
                    className="service"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.55, ease: EASE_OUT, delay: Math.min(i, 8) * 0.035 }}
                  >
                    <div className="service__main">
                      <p className="service__meta">
                        <span>{categories.find((c) => c.id === s.category)?.label}</span>
                        {s.featured && <span className="service__badge">Mais pedido</span>}
                      </p>
                      <h3 className="service__name">{s.name}</h3>
                      <p className="service__desc">{s.description}</p>
                    </div>
                    <div className="service__side">
                      <p className="service__price">{formatPrice(s.price)}</p>
                      <p className="service__duration">
                        <Clock size={14} strokeWidth={1.6} aria-hidden="true" />
                        {formatDuration(s.duration)}
                      </p>
                      <button
                        type="button"
                        className="service__cta"
                        onClick={() => open({ serviceId: s.id })}
                        aria-label={`Agendar ${s.name}, ${formatPrice(s.price)}, ${formatDuration(s.duration)}`}
                      >
                        Agendar
                        <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            <p className="services__note">Valores ilustrativos. Tratamentos químicos podem variar conforme o comprimento do cabelo.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
