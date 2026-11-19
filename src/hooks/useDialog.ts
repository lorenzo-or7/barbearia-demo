import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let lockCount = 0

/**
 * Comportamento de diálogo modal acessível:
 * trava o scroll, torna o conteúdo de fundo inerte, prende o foco,
 * fecha com Escape e devolve o foco ao elemento que abriu.
 */
export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const root = document.getElementById('root')
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    lockCount++
    document.documentElement.classList.add('is-locked')
    document.documentElement.style.setProperty('--scrollbar', `${scrollbar}px`)
    root?.setAttribute('inert', '')

    const frame = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE)
      ;(target ?? el).focus({ preventScroll: true })
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      lockCount = Math.max(0, lockCount - 1)
      if (!lockCount) {
        document.documentElement.classList.remove('is-locked')
        root?.removeAttribute('inert')
      }
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, ref])
}
