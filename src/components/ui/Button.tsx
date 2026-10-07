import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent'
type Size = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

// Botones "de juguete": un borde inferior grueso les da volumen y se hunden al presionarlos.
const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-[0_5px_0_#2f6fd0,0_12px_24px_rgba(77,150,255,0.28)] active:shadow-[0_2px_0_#2f6fd0] disabled:bg-primary/40 disabled:shadow-none',
  secondary:
    'bg-secondary text-white hover:brightness-95 shadow-[0_5px_0_#4a9e56,0_12px_24px_rgba(107,203,119,0.28)] active:shadow-[0_2px_0_#4a9e56] disabled:bg-secondary/40 disabled:shadow-none',
  accent:
    'bg-accent text-ink hover:brightness-95 shadow-[0_5px_0_#d9b21f,0_12px_24px_rgba(255,217,61,0.3)] active:shadow-[0_2px_0_#d9b21f] disabled:bg-accent/40 disabled:shadow-none',
  ghost:
    'bg-surface text-ink border-2 border-border hover:border-primary hover:bg-primary-soft shadow-[0_4px_0_#dbe3f0] active:shadow-[0_1px_0_#dbe3f0] disabled:opacity-50',
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
        'hover:-translate-y-0.5 active:translate-y-[3px] disabled:translate-y-0',
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
