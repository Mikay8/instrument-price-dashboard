import { List, type RowComponentProps } from 'react-window'
import type { Selection } from '../../lib/selection'
import type { InstrumentSummary } from '../../types/api'
import { TICKER_ROW_HEIGHT, TickerRow } from './TickerRow'

interface RowProps {
  instruments: readonly InstrumentSummary[]
  selection: Selection
  colors: readonly string[]
  compareDisabled: boolean
  onView: (ticker: string) => void
  onToggleCompare: (ticker: string) => void
}

function Row({ index, style, ariaAttributes, instruments, selection, colors, ...handlers }: RowComponentProps<RowProps>) {
  const { ticker, lastPrice, totalReturnPercent } = instruments[index]
  const selected = selection.find((s) => s.ticker === ticker)

  return (
    <TickerRow
      style={style}
      ariaAttributes={ariaAttributes}
      ticker={ticker}
      selected={selected !== undefined}
      color={selected ? colors[selected.slot] : undefined}
      lastPrice={lastPrice}
      changePercent={totalReturnPercent}
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
      rowCount={props.instruments.length}
      rowHeight={TICKER_ROW_HEIGHT}
      rowProps={props}
      overscanCount={8}
    />
  )
}
