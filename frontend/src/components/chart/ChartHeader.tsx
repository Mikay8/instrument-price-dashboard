import type { ReactNode } from 'react'
import { formatPercent, formatPrice } from '../../lib/format'
import { toneClass } from '../../lib/tone'
import { SeriesSwatch } from '../ui/SeriesSwatch'

export interface ChartSeriesSummary {
  ticker: string
  color: string
  lastPrice?: number
  /** Last − first, in price units. */
  change?: number
  changePercent?: number
}

interface ChartHeaderProps {
  series: ChartSeriesSummary[]
  onRemove: (ticker: string) => void
  actions?: ReactNode
}

/** Doubles as the chart legend: each entry pairs a series color with its ticker. */
export function ChartHeader({ series, onRemove, actions }: ChartHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <ul aria-label="Tickers on chart" className="flex flex-wrap items-center gap-x-10 gap-y-3">
        {series.map(({ ticker, color, lastPrice, change, changePercent }) => (
          <li key={ticker} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <SeriesSwatch color={color} className="self-center" />
            <span className="text-4xl leading-none font-bold tracking-wide">{ticker}</span>
            {lastPrice !== undefined && <span className="text-3xl leading-none text-ink-secondary">{formatPrice(lastPrice)}</span>}
            {change !== undefined && changePercent !== undefined && (
              <span className={`text-base ${toneClass(change)}`}>
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
