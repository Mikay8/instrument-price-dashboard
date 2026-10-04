import { Skeleton } from '../ui/Skeleton'
import { TICKER_ROW_COLUMNS, TICKER_ROW_HEIGHT } from './TickerRow'

export function TickerListSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading instruments">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ height: TICKER_ROW_HEIGHT }} className={`${TICKER_ROW_COLUMNS} border-l-2 border-l-transparent`}>
          <Skeleton className="mx-auto h-3 w-5" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-12" />
          <span />
        </div>
      ))}
    </div>
  )
}
