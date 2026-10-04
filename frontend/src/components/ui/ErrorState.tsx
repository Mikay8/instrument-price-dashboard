interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title, message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div role="alert" className={`flex flex-col items-start gap-3 border-l-2 border-negative bg-negative-soft p-4 ${className}`}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold tracking-widest text-negative uppercase">! {title}</p>
        <p className="text-sm text-ink-secondary">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring border border-hairline-strong px-3 py-1 text-sm tracking-wider text-ink uppercase hover:border-accent hover:text-accent"
        >
          Retry
        </button>
      )}
    </div>
  )
}
