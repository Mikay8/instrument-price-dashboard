/** Placeholder block shown while content loads. Size it with className. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-raised ${className}`} />
}
