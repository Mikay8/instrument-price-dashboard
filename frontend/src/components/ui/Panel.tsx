import type { ReactNode } from 'react'

/** Hairline-bordered frame used around the chart and the stats row. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border border-hairline bg-surface ${className}`}>{children}</div>
}
