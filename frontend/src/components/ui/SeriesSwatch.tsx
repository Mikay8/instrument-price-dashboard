/** Small square in a series' color, tying a label to its line on the chart. */
export function SeriesSwatch({ color, className = '' }: { color: string; className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-3.5 shrink-0 ${className}`} style={{ backgroundColor: color }} />
}
