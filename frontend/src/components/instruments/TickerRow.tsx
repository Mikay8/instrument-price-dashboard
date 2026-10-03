import type { CSSProperties } from 'react'
import { formatPercent, formatPrice } from '../../lib/format'
import { toneClass } from '../../lib/tone'

/** Fixed row height so the list can be virtualized. */
export const TICKER_ROW_HEIGHT = 44

/** Column layout shared by the rows and the SYM / LAST / 30D header. The first column holds the checkbox. */
export const TICKER_ROW_COLUMNS = 'grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 pr-4'

interface TickerRowProps {
  ticker: string
  /** On the chart (viewed or compared). */
  selected: boolean
  /** Series color when the ticker is on the chart. */
  color?: string
  /** Shown once the ticker's prices have been loaded; "—" until then. */
  lastPrice?: number
  changePercent?: number
  /** Disable ticking more when the compare limit is reached. */
  compareDisabled: boolean
  onView: (ticker: string) => void
  onToggleCompare: (ticker: string) => void
  /** Positioning from the virtualized list. */
  style?: CSSProperties
}

export function TickerRow({
  ticker,
  selected,
  color,
  lastPrice,
  changePercent,
  compareDisabled,
  onView,
  onToggleCompare,
  style,
}: TickerRowProps) {
  const disabled = !selected && compareDisabled

  return (
    <div
      style={{ ...style, height: TICKER_ROW_HEIGHT }}
      className={`${TICKER_ROW_COLUMNS} border-l-2 ${
        selected ? 'border-l-accent bg-accent-soft' : 'border-l-transparent hover:bg-raised'
      }`}
    >
      <label className={`flex h-full items-center justify-center ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={() => onToggleCompare(ticker)}
          aria-label={`Compare ${ticker}`}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="text-ink-muted peer-focus-visible:outline-2 peer-focus-visible:outline-accent"
        >
          [<span className="inline-block w-[1ch] text-center" style={{ color }}>{selected ? 'x' : ' '}</span>]
        </span>
      </label>
      <button
        type="button"
        onClick={(event) => (event.shiftKey ? onToggleCompare(ticker) : onView(ticker))}
        aria-current={selected ? 'true' : undefined}
        className="focus-ring col-span-3 grid h-full grid-cols-subgrid items-center text-left"
      >
        <span className="truncate font-bold tracking-wide">{ticker}</span>
        <span className="text-right text-ink-secondary tabular-nums">
          {lastPrice === undefined ? '—' : formatPrice(lastPrice)}
        </span>
        <span className={`text-right text-sm tabular-nums ${toneClass(changePercent)}`}>
          {changePercent === undefined ? '' : formatPercent(changePercent, { signed: true })}
        </span>
      </button>
    </div>
  )
}
