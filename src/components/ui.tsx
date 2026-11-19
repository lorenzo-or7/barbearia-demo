import { ArrowUpRight } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { site } from '../config/site'

type Variant = 'primary' | 'outline' | 'ghost' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'lg' | 'sm'
  icon?: ReactNode
  /** Ícone à direita com seta animada. */
  arrow?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon, arrow, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {icon}
      <span className="btn__label">{children}</span>
      {arrow && (
        <span className="btn__arrow" aria-hidden="true">
          <ArrowUpRight size={18} strokeWidth={1.6} />
          <ArrowUpRight size={18} strokeWidth={1.6} />
        </span>
      )}
    </button>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>
}

/** Logotipo tipográfico. Usa `site.brand.logoSrc` quando houver arquivo de marca. */
export function Logo({ className = '' }: { className?: string }) {
  if (site.brand.logoSrc) {
    return <img src={site.brand.logoSrc} alt={site.brand.name} className={`logo-img ${className}`} height={40} />
  }
  return (
    <span className={`logo ${className}`}>
      <span className="logo__name">{site.brand.name}</span>
      <span className="logo__rule" aria-hidden="true" />
      <span className="logo__descriptor">{site.brand.descriptor}</span>
    </span>
  )
}

export function Or7Signature({ className = '' }: { className?: string }) {
  return (
    <a
      href={site.credits.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`or7-signature ${className}`}
      aria-label={`${site.credits.studio} — idealizado e desenvolvido por Lorenzo Orsetti (abre em nova aba)`}
    >
      <img src={site.credits.signatureSrc} alt="" width={720} height={102} loading="lazy" draggable={false} />
    </a>
  )
}

export function DemoTag({ children = 'Demonstração', className = '' }: { children?: ReactNode; className?: string }) {
  if (!site.demoMode) return null
  return <span className={`demo-tag ${className}`}>{children}</span>
}
