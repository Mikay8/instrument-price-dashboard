import type { InstrumentStats } from '../../types/api'
import { StatTile, StatTileSkeleton } from './StatTile'
import { STATS } from './statDefinitions'

const GRID = 'grid grid-cols-1 divide-y divide-hairline border border-hairline bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0'

/** Single ticker: one large tile per stat. */
export function StatsGrid({ stats }: { stats: InstrumentStats }) {
  return (
    <section aria-label={`${stats.ticker} statistics`} className={GRID}>
      {STATS.map((stat) => (
        <StatTile key={stat.id} label={stat.label} value={stat.value(stats)} caption={stat.caption} valueClassName={stat.tone(stats)} />
      ))}
    </section>
  )
}

export function StatsGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading statistics" className={GRID}>
      {STATS.map((stat) => (
        <StatTileSkeleton key={stat.id} label={stat.label} />
      ))}
    </div>
  )
}
