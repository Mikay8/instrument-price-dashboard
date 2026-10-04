import { buildChartRows, chartModeFor } from './chartData'

const A = { ticker: 'AAA', color: 'red', prices: [{ date: '2026-06-23', price: 100 }, { date: '2026-06-24', price: 110 }] }
const B = { ticker: 'BBB', color: 'blue', prices: [{ date: '2026-06-24', price: 45 }, { date: '2026-06-23', price: 50 }] }

describe('buildChartRows', () => {
  it('plots raw prices in price mode', () => {
    expect(buildChartRows([A], 'price')).toEqual([
      { date: '2026-06-23', values: { AAA: 100 }, prices: { AAA: 100 } },
      { date: '2026-06-24', values: { AAA: 110 }, prices: { AAA: 110 } },
    ])
  })

  it('plots % change since each series’ first point in change mode, keeping raw prices', () => {
    const rows = buildChartRows([A, B], 'change') // B's points arrive newest first
    expect(rows[0]).toEqual({ date: '2026-06-23', values: { AAA: 0, BBB: 0 }, prices: { AAA: 100, BBB: 50 } })
    expect(rows[1].values.AAA).toBeCloseTo(10)
    expect(rows[1].values.BBB).toBeCloseTo(-10)
    expect(rows[1].prices).toEqual({ AAA: 110, BBB: 45 })
  })

  it('merges series by date and sorts rows oldest first', () => {
    const rows = buildChartRows([A, B], 'price')
    expect(rows.map((r) => r.date)).toEqual(['2026-06-23', '2026-06-24'])
    expect(rows[0].prices).toEqual({ AAA: 100, BBB: 50 })
  })

  it('handles tickers containing dots', () => {
    const rows = buildChartRows([{ ...A, ticker: 'BRK.B' }], 'price')
    expect(rows[0].values['BRK.B']).toBe(100)
  })
})

describe('chartModeFor', () => {
  it('uses price for one series and % change when comparing', () => {
    expect(chartModeFor(1)).toBe('price')
    expect(chartModeFor(2)).toBe('change')
  })
})
