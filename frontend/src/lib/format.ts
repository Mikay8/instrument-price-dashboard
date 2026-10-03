const MINUS = '−'

const percentFormats = new Map<string, Intl.NumberFormat>()
function percentFormat(digits: number, signed: boolean): Intl.NumberFormat {
  const key = `${digits}:${signed}`
  let format = percentFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      signDisplay: signed ? 'exceptZero' : 'auto',
    })
    percentFormats.set(key, format)
  }
  return format
}
const priceFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

/** Typographic minus so negative numbers line up with positive ones. */
const withMinus = (text: string) => text.replace('-', MINUS)

/** 9.4321 -> "+9.43%", -4.6 -> "−4.60%". Unsigned: 2.28 -> "2.28%". */
export function formatPercent(value: number, { signed = false, digits = 2 } = {}): string {
  return withMinus(percentFormat(digits, signed).format(value)) + '%'
}

export function formatPrice(value: number): string {
  return withMinus(priceFormat.format(value))
}

/** "2026-08-17" -> "Aug 17". Parsed as UTC so the day never shifts with the viewer's time zone. */
export function formatShortDate(isoDate: string): string {
  return shortDateFormat.format(new Date(`${isoDate}T00:00:00Z`))
}
