const MINUS = '−'

const percentFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const signedPercentFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})
const priceFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

/** Typographic minus so negative numbers line up with positive ones. */
const withMinus = (text: string) => text.replace('-', MINUS)

/** 9.4321 -> "+9.43%", -4.6 -> "−4.60%". Unsigned: 2.28 -> "2.28%". */
export function formatPercent(value: number, { signed = false } = {}): string {
  return withMinus((signed ? signedPercentFormat : percentFormat).format(value)) + '%'
}

export function formatPrice(value: number): string {
  return withMinus(priceFormat.format(value))
}

/** "2026-08-17" -> "Aug 17". Parsed as UTC so the day never shifts with the viewer's time zone. */
export function formatShortDate(isoDate: string): string {
  return shortDateFormat.format(new Date(`${isoDate}T00:00:00Z`))
}
