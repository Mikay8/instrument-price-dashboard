interface EmptyStateProps {
  title: string
  hint?: string
  className?: string
}

export function EmptyState({ title, hint, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-8 text-center ${className}`}>
      <p className="text-sm font-bold tracking-widest text-ink-secondary uppercase">{title}</p>
      {hint && <p className="max-w-xs text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}
