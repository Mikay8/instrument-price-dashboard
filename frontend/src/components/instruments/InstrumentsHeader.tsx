import { SearchInput } from '../ui/SearchInput'
import { TICKER_ROW_COLUMNS } from './TickerRow'

interface InstrumentsHeaderProps {
  total: number | null
  compareCount: number
  maxCompare: number
  query: string
  onQueryChange: (query: string) => void
}

export function InstrumentsHeader({ total, compareCount, maxCompare, query, onQueryChange }: InstrumentsHeaderProps) {
  return (
    <div className="border-b border-hairline">
      <div className="flex flex-col gap-3 p-4">
        <SearchInput label="Search tickers" placeholder="Search ticker" value={query} onChange={onQueryChange} />
        <div className="label-caps flex justify-between">
          <span>{total === null ? '— instruments' : `${total} instruments`}</span>
          <span title="Tick or shift-click a ticker to compare">
            Cmp {compareCount}/{maxCompare}
          </span>
        </div>
      </div>
      <div aria-hidden="true" className={`${TICKER_ROW_COLUMNS} label-caps border-t border-hairline border-l-2 border-l-transparent py-2`}>
        <span />
        <span>Sym</span>
        <span className="text-right">Last</span>
        <span className="text-right">30D</span>
      </div>
    </div>
  )
}
