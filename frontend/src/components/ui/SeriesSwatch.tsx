interface SeriesSwatchProps {
  color: string
  size?: 'sm' | 'md'
  className?: string
}

const SIZES = { sm: 'size-2.5', md: 'size-3.5' } as const

/** Small square in a series' color, tying a label to its line on the chart. */
export function SeriesSwatch({ color, size = 'md', className = '' }: SeriesSwatchProps) {
  return (
    <span aria-hidden="true" className={`inline-block shrink-0 ${SIZES[size]} ${className}`} style={{ backgroundColor: color }} />
  )
}
