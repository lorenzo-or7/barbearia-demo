import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
export const THEME_KEY = 'oficio-theme'

const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

/** Tema persistido em localStorage. O valor inicial é aplicado antes da pintura em index.html. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#10100F' : '#F4F0E9')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* sem persistência disponível */
    }
  }, [theme])

  const toggle = useCallback(() => {
    const apply = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (doc.startViewTransition && !reduce) doc.startViewTransition(apply)
    else apply()
  }, [])

  return { theme, toggle }
}
