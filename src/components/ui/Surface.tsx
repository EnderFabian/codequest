import type { HTMLAttributes, ReactNode } from 'react'

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  as?: 'div' | 'section' | 'article'
}

/** Contenedor de superficie para interacciones — sombra suave, sin bordes duros */
export function Surface({
  children,
  className = '',
  as: Tag = 'div',
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={[
        'rounded-3xl border-[3px] border-white/80 bg-surface/90 p-6 shadow-[var(--shadow-clay)] backdrop-blur-sm',
        'transition-calm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
