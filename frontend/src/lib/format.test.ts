import { formatPercent, formatPrice, formatShortDate } from './format'

describe('formatPercent', () => {
  it('shows two decimals without a sign by default', () => {
    expect(formatPercent(2.2834)).toBe('2.28%')
  })

  it('adds a plus sign to positive values when signed', () => {
    expect(formatPercent(9.4321, { signed: true })).toBe('+9.43%')
  })

  it('uses a typographic minus for negative values', () => {
    expect(formatPercent(-4.6, { signed: true })).toBe('−4.60%')
  })

  it('shows zero without a sign', () => {
    expect(formatPercent(0, { signed: true })).toBe('0.00%')
  })
})

describe('formatPrice', () => {
  it('shows two decimals with thousands separators', () => {
    expect(formatPrice(1234.5)).toBe('1,234.50')
  })
})

describe('formatShortDate', () => {
  it('formats an ISO date without shifting the day', () => {
    expect(formatShortDate('2026-08-01')).toBe('Aug 1')
  })
})
