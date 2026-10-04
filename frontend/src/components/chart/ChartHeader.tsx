import type { ReactNode } from 'react'
import { formatPercent, formatPrice } from '../../lib/format'
import { toneClass } from '../../lib/tone'
import { SeriesSwatch } from '../ui/SeriesSwatch'
import { Skeleton } from '../ui/Skeleton'

export interface ChartSeriesSummary {
  ticker: string
  color: string
  lastPrice?: number
  /** Last − first, in price units. */
  change?: number
  changePercent?: number
  isLoading?: boolean
}

interface ChartHeaderProps {
  series: ChartSeriesSummary[]
  onRemove: (ticker: string) => void
  actions?: ReactNode
}

/** Doubles as the chart legend: each entry pairs a series color with its ticker. */
export function ChartHeader({ series, onRemove, actions }: ChartHeaderProps) {
  // Smaller type when comparing so 2–3 entries fit on one line.
  const compact = series.length > 1
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <ul aria-label="Tickers on chart" className="flex flex-wrap items-center gap-x-8 gap-y-2">
        {series.map(({ ticker, color, lastPrice, change, changePercent, isLoading }) => (
          <li key={ticker} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <SeriesSwatch color={color} size={compact ? 'sm' : 'md'} className="self-center" />
            <span className={`${compact ? 'text-lg' : 'text-3xl'} leading-none font-bold tracking-wide`}>{ticker}</span>
            {lastPrice !== undefined && (
              <span className={`${compact ? 'text-base' : 'text-2xl'} leading-none text-ink-secondary`}>{formatPrice(lastPrice)}</span>
            )}
            {isLoading && <Skeleton className={`${compact ? 'h-4' : 'h-6'} w-20 self-center`} />}
            {change !== undefined && changePercent !== undefined && (
              <span className={`${compact ? 'text-xs' : 'text-sm'} ${toneClass(change)}`}>
                {change > 0 ? '+' : ''}
                {formatPrice(change)} ({formatPercent(changePercent, { signed: true })})
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(ticker)}
              aria-label={`Remove ${ticker} from chart`}
              className="focus-ring self-center px-1 text-lg leading-none text-ink-muted hover:text-ink"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {actions}
    </div>
  )
}
