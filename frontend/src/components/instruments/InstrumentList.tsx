import { List, type RowComponentProps } from 'react-window'
import type { TickerData } from '../../hooks/useTickerData'
import { TICKER_ROW_HEIGHT, TickerRow } from './TickerRow'

interface RowProps {
  tickers: readonly string[]
  selectedTickers: readonly string[]
  colors: readonly string[]
  loaded: Record<string, TickerData>
  compareDisabled: boolean
  onView: (ticker: string) => void
  onToggleCompare: (ticker: string) => void
}

function Row({ index, style, ariaAttributes, tickers, selectedTickers, colors, loaded, ...handlers }: RowComponentProps<RowProps>) {
  const ticker = tickers[index]
  const slot = selectedTickers.indexOf(ticker)
  const data = loaded[ticker]

  return (
    <TickerRow
      style={style}
      ariaAttributes={ariaAttributes}
      ticker={ticker}
      selected={slot !== -1}
      color={slot !== -1 ? colors[slot] : undefined}
      lastPrice={data?.series.prices.at(-1)?.price}
      changePercent={data?.stats.totalReturnPercent}
      {...handlers}
    />
  )
}

/** Virtualized: only the rows in view (plus a small overscan) are mounted. */
export function InstrumentList(props: RowProps) {
  return (
    <List
      aria-label="Instruments"
      className="min-h-0 flex-1"
      rowComponent={Row}
      rowCount={props.tickers.length}
      rowHeight={TICKER_ROW_HEIGHT}
      rowProps={props}
      overscanCount={8}
    />
  )
}
