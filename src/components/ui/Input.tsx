import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export function Input({ label, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <label className="flex w-full flex-col gap-2 text-left" htmlFor={inputId}>
      <span className="font-bold text-ink">{label}</span>
      <input
        id={inputId}
        className={[
          'min-h-12 w-full rounded-2xl border-2 border-border bg-surface px-4',
          'text-ink placeholder:text-ink-muted/70',
          'transition-calm focus:border-primary focus:outline-none',
          className,
        ].join(' ')}
        {...props}
      />
      {hint ? <span className="text-sm text-ink-muted">{hint}</span> : null}
    </label>
  )
}
