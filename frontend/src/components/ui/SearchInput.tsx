import type { InputHTMLAttributes } from 'react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
}

/** Terminal-style input with a ">" prompt. */
export function SearchInput({ label, value, onChange, className = '', ...rest }: SearchInputProps) {
  return (
    <label
      className={`flex items-center gap-3 border border-hairline-strong bg-surface px-3 py-2.5 focus-within:border-accent ${className}`}
    >
      <span aria-hidden="true" className="text-accent">
        &gt;
      </span>
      <span className="sr-only">{label}</span>
      <input
        {...rest}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="w-full min-w-0 bg-transparent text-sm tracking-wider text-ink uppercase placeholder:text-ink-muted focus:outline-none"
      />
    </label>
  )
}
