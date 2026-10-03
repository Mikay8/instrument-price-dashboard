import type { ReactNode } from 'react'
import { formatPercent } from '../../lib/format'
import { toneClass } from '../../lib/tone'
import type { InstrumentStats } from '../../types/api'
import { StatTile, StatTileSkeleton } from './StatTile'

const GRID = 'grid grid-cols-1 divide-y divide-hairline border border-hairline bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0'

const TILES: readonly {
  id: string
  label: ReactNode
  caption: string
  value: (s: InstrumentStats) => string
  tone: (s: InstrumentStats) => string
}[] = [
  {
    id: 'return',
    label: 'Total return',
    caption: '(last ÷ first − 1) × 100',
    value: (s: InstrumentStats) => formatPercent(s.totalReturnPercent, { signed: true }),
    tone: (s: InstrumentStats) => toneClass(s.totalReturnPercent),
  },
  {
    id: 'volatility',
    // Lowercase σ would be uppercased to Σ by label-caps.
    label: (
      <>
        Daily vol <span className="normal-case">σ</span>
      </>
    ),
    caption: 'Stdev of daily returns',
    value: (s: InstrumentStats) => formatPercent(s.dailyVolatilityPercent),
    tone: () => 'text-ink',
  },
  {
    id: 'drawdown',
    label: 'Max drawdown',
    caption: 'Peak → trough',
    value: (s: InstrumentStats) => formatPercent(s.maxDrawdownPercent, { signed: true }),
    tone: (s: InstrumentStats) => toneClass(s.maxDrawdownPercent),
  },
]

export function StatsGrid({ stats }: { stats: InstrumentStats }) {
  return (
    <section aria-label={`${stats.ticker} statistics`} className={GRID}>
      {TILES.map((tile) => (
        <StatTile
          key={tile.id}
          label={tile.label}
          value={tile.value(stats)}
          caption={tile.caption}
          valueClassName={tile.tone(stats)}
        />
      ))}
    </section>
  )
}

export function StatsGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading statistics" className={GRID}>
      {TILES.map((tile) => (
        <StatTileSkeleton key={tile.id} label={tile.label} />
      ))}
    </div>
  )
}
