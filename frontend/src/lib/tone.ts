/** Text color for a signed value. Always shown alongside its +/− sign. */
export function toneClass(value: number | undefined): string {
  if (value === undefined || value === 0) return 'text-ink'
  return value > 0 ? 'text-positive' : 'text-negative'
}
