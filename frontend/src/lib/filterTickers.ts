/** Case-insensitive substring match on `ticker`. Returns the input array unchanged for an empty query. */
export function filterTickers<T extends { ticker: string }>(items: readonly T[], query: string): readonly T[] {
  const needle = query.trim().toUpperCase()
  if (!needle) return items
  return items.filter((item) => item.ticker.toUpperCase().includes(needle))
}
