/** Case-insensitive substring match. Returns the input array unchanged for an empty query. */
export function filterTickers(tickers: readonly string[], query: string): readonly string[] {
  const needle = query.trim().toUpperCase()
  if (!needle) return tickers
  return tickers.filter((ticker) => ticker.toUpperCase().includes(needle))
}
