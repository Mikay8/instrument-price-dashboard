import type { PricePoint } from '../types/api'

export interface ChartSeries {
  ticker: string
  color: string
  prices: readonly PricePoint[]
}

/** Single ticker: plot price. Comparing: plot % change since the first day, so different price levels share one axis. */
export type ChartMode = 'price' | 'change'

export interface ChartRow {
  date: string
  /** Plotted value per ticker (price or % change, depending on mode). */
  values: Record<string, number>
  /** Raw price per ticker, for the tooltip. */
  prices: Record<string, number>
}

export const chartModeFor = (seriesCount: number): ChartMode => (seriesCount > 1 ? 'change' : 'price')

/** One row per date across all series, oldest first. A ticker missing a date is simply absent from that row. */
export function buildChartRows(series: readonly ChartSeries[], mode: ChartMode): ChartRow[] {
  const rows = new Map<string, ChartRow>()

  for (const { ticker, prices } of series) {
    // % change is measured from the earliest date, whatever order the points arrive in.
    const base = prices.reduce((earliest, p) => (p.date < earliest.date ? p : earliest), prices[0])?.price
    for (const { date, price } of prices) {
      let row = rows.get(date)
      if (!row) {
        row = { date, values: {}, prices: {} }
        rows.set(date, row)
      }
      row.prices[ticker] = price
      row.values[ticker] = mode === 'price' ? price : (price / base - 1) * 100
    }
  }

  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date))
}
