import type { CSSProperties } from 'react'
import { img, type ImageName } from '../data/images'

interface ImgProps {
  name: ImageName
  /** Valor do atributo sizes. */
  sizes: string
  className?: string
  /** Imagem LCP: carrega com prioridade, sem lazy. */
  priority?: boolean
  /** Sobrescreve o texto alternativo. '' = decorativa. */
  alt?: string
  style?: CSSProperties
}

const widths = [480, 960, 1600] as const

export function Img({ name, sizes, className, priority, alt, style }: ImgProps) {
  const a = img(name)
  const srcSet = widths.map((w) => `${import.meta.env.BASE_URL}images/${name}-${w}.webp ${w}w`).join(', ')
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/${name}-960.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={a.width}
      height={a.height}
      alt={alt ?? a.alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      draggable={false}
      style={{ objectPosition: a.focus, ...style }}
    />
  )
}
