import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Moon, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, DemoTag, Logo } from '../components/ui'
import { EASE_OUT } from '../components/motion'
import { site } from '../config/site'
import { nav } from '../data/content'
import { useBooking } from '../features/booking/BookingContext'
import { useActiveSection, useScrolled } from '../hooks/useActiveSection'
import { useDialog } from '../hooks/useDialog'
import { useTheme } from '../hooks/useTheme'

const ids = nav.map((n) => n.id)

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      <span className="theme-toggle__track" data-dark={isDark}>
        <span className="theme-toggle__thumb">{isDark ? <Moon size={14} strokeWidth={1.8} /> : <Sun size={14} strokeWidth={1.8} />}</span>
      </span>
    </button>
  )
}

export function Navbar() {
  const scrolled = useScrolled(40)
  const active = useActiveSection(ids)
  const { open: openBooking } = useBooking()
  const [menuOpen, setMenuOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nav__bar">
          <a href="#topo" className="nav__brand" aria-label={`${site.brand.name} ${site.brand.descriptor} — início`}>
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Principal">
            <ul>
              {nav.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="nav__link" aria-current={active === item.id ? 'location' : undefined}>
                    <span className="nav__num" aria-hidden="true">
                      0{i + 1}
                    </span>
                    {item.label}
                    {active === item.id && (
                      <motion.span
                        className="nav__indicator"
                        layoutId="nav-indicator"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__actions">
            <ThemeToggle className="nav__theme" />
            <Button className="nav__cta" size="sm" onClick={() => openBooking()}>
              Agendar
            </Button>
            <button
              type="button"
              className="nav__burger"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
    </>
  )
}

function MobileMenu({ open, onClose, active }: { open: boolean; onClose: () => void; active: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const { open: openBooking } = useBooking()
  const close = useCallback(() => onClose(), [onClose])
  useDialog(ref, open, close)

  // Fecha ao passar para layout desktop.
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 1080px)')
    const onChange = () => mq.matches && onClose()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="mobile-menu"
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="menu__top">
            <Logo />
            <button type="button" className="menu__close" onClick={onClose} aria-label="Fechar menu" data-autofocus>
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Menu móvel" className="menu__nav">
            <ul>
              {nav.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.18 + i * 0.06 }}
                >
                  <a
                    href={`#${item.id}`}
                    className="menu__link"
                    aria-current={active === item.id ? 'location' : undefined}
                    onClick={(e) => {
                      // Fecha o menu (libera o scroll) e só então navega até a âncora.
                      e.preventDefault()
                      onClose()
                      setTimeout(() => {
                        const el = document.getElementById(item.id)
                        el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
                        history.replaceState(null, '', `#${item.id}`)
                        el?.focus({ preventScroll: true })
                      }, 80)
                    }}
                  >
                    <span className="menu__num">0{i + 1}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>
          <motion.div
            className="menu__foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="menu__row">
              <span className="menu__label">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              size="lg"
              arrow
              className="menu__cta"
              onClick={() => {
                onClose()
                openBooking()
              }}
            >
              Agendar horário
            </Button>
            <p className="menu__note">
              {site.address.short} <DemoTag />
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
