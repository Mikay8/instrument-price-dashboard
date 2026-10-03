/**
 * Which tickers are on the chart, and which color slot each one owns.
 * A ticker keeps its slot until it is removed, so removing one never repaints the others.
 */
export interface SelectedTicker {
  ticker: string
  slot: number
}

export type Selection = readonly SelectedTicker[]

/** Click: show just this ticker. */
export function viewOnly(ticker: string): Selection {
  return [{ ticker, slot: 0 }]
}

/** Tick / shift-click: add to the comparison, or remove if already there. No-op when full. */
export function toggleCompare(selection: Selection, ticker: string, max: number): Selection {
  if (selection.some((s) => s.ticker === ticker)) return remove(selection, ticker)
  if (selection.length >= max) return selection

  const used = new Set(selection.map((s) => s.slot))
  let slot = 0
  while (used.has(slot)) slot++
  return [...selection, { ticker, slot }]
}

export function remove(selection: Selection, ticker: string): Selection {
  return selection.filter((s) => s.ticker !== ticker)
}
