import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent'
type Size = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-[var(--shadow-lift)] disabled:bg-primary/40',
  secondary:
    'bg-secondary text-white hover:brightness-95 shadow-[var(--shadow-soft)] disabled:bg-secondary/40',
  accent:
    'bg-accent text-ink hover:brightness-95 shadow-[var(--shadow-soft)] disabled:bg-accent/40',
  ghost:
    'bg-surface text-ink border-2 border-border hover:border-primary hover:bg-primary-soft disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-[3.25rem] px-7 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold',
        'transition-calm focus-visible:outline-none',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
