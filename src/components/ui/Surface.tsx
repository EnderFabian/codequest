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
        'rounded-3xl bg-surface p-6 shadow-[var(--shadow-soft)]',
        'transition-calm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
