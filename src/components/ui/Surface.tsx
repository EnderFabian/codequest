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
        'rounded-3xl border-[3px] border-white/85 bg-gradient-to-b from-white/95 to-surface/88 p-6 shadow-[var(--shadow-clay)] backdrop-blur-md',
        'ring-1 ring-[rgba(77,150,255,0.08)]',
        'transition-calm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
