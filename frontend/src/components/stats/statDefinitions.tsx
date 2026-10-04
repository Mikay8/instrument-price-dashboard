import type { ReactNode } from 'react'
import { formatPercent } from '../../lib/format'
import { toneClass } from '../../lib/tone'
import type { InstrumentStats } from '../../types/api'

export interface StatDefinition {
  id: string
  label: ReactNode
  /** Used where space is tight (the comparison table on phones). */
  shortLabel: ReactNode
  caption: string
  value: (stats: InstrumentStats) => string
  /** Text color class for the value. */
  tone: (stats: InstrumentStats) => string
}

/** The three stats, shared by the single-ticker tiles and the comparison table. */
export const STATS: readonly StatDefinition[] = [
  {
    id: 'return',
    label: 'Total return',
    shortLabel: 'Return',
    caption: '(last ÷ first − 1) × 100',
    value: (s) => formatPercent(s.totalReturnPercent, { signed: true }),
    tone: (s) => toneClass(s.totalReturnPercent),
  },
  {
    id: 'volatility',
    // Lowercase σ would be uppercased to Σ by label-caps.
    label: (
      <>
        Daily vol <span className="normal-case">σ</span>
      </>
    ),
    shortLabel: (
      <>
        Vol <span className="normal-case">σ</span>
      </>
    ),
    caption: 'Stdev of daily returns',
    value: (s) => formatPercent(s.dailyVolatilityPercent),
    tone: () => 'text-ink',
  },
  {
    id: 'drawdown',
    label: 'Max drawdown',
    shortLabel: 'Max DD',
    caption: 'Peak → trough',
    value: (s) => formatPercent(s.maxDrawdownPercent, { signed: true }),
    tone: (s) => toneClass(s.maxDrawdownPercent),
  },
]
