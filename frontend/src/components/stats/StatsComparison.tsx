import type { InstrumentStats } from '../../types/api'
import { SeriesSwatch } from '../ui/SeriesSwatch'
import { Skeleton } from '../ui/Skeleton'
import { STATS } from './statDefinitions'

export interface ComparisonRow {
  ticker: string
  color: string
  /** Undefined while loading or after an error. */
  stats?: InstrumentStats
  isLoading: boolean
}

/** Comparing 2–3 tickers: one row per ticker, one column per stat. */
export function StatsComparison({ rows }: { rows: readonly ComparisonRow[] }) {
  return (
    <section aria-label="Statistics comparison" className="overflow-x-auto border border-hairline bg-surface">
      <table className="w-full min-w-[32rem] text-left">
        <thead>
          <tr className="border-b border-hairline">
            <th scope="col" className="label-caps px-4 py-2 align-top">
              Sym
            </th>
            {STATS.map((stat) => (
              <th key={stat.id} scope="col" className="px-4 py-2 text-right align-top">
                <span className="label-caps block">{stat.label}</span>
                <span className="mt-0.5 block text-[0.6rem] font-normal tracking-wider text-ink-muted uppercase">{stat.caption}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ ticker, color, stats, isLoading }) => (
            <tr key={ticker} className="border-b border-hairline last:border-b-0">
              <th scope="row" className="px-4 py-2">
                <span className="flex items-center gap-2.5 text-sm font-bold tracking-wide">
                  <SeriesSwatch color={color} size="sm" />
                  {ticker}
                </span>
              </th>
              {STATS.map((stat) => (
                <td key={stat.id} className="px-4 py-2 text-right">
                  {stats ? (
                    <span className={`text-base font-bold tabular-nums ${stat.tone(stats)}`}>{stat.value(stats)}</span>
                  ) : isLoading ? (
                    <Skeleton className="ml-auto h-4 w-16" />
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
