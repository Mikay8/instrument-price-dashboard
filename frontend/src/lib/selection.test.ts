import { remove, toggleCompare, viewOnly } from './selection'

describe('selection', () => {
  it('viewOnly replaces the selection with one ticker in slot 0', () => {
    expect(viewOnly('AAA')).toEqual([{ ticker: 'AAA', slot: 0 }])
  })

  it('toggleCompare adds tickers into the next free slots', () => {
    let s = viewOnly('AAA')
    s = toggleCompare(s, 'BBB', 3)
    s = toggleCompare(s, 'CCC', 3)
    expect(s).toEqual([
      { ticker: 'AAA', slot: 0 },
      { ticker: 'BBB', slot: 1 },
      { ticker: 'CCC', slot: 2 },
    ])
  })

  it('toggleCompare removes a ticker that is already selected', () => {
    const s = toggleCompare(toggleCompare(viewOnly('AAA'), 'BBB', 3), 'AAA', 3)
    expect(s).toEqual([{ ticker: 'BBB', slot: 1 }])
  })

  it('keeps survivors in their slots when one is removed, and reuses the freed slot', () => {
    let s = toggleCompare(toggleCompare(viewOnly('AAA'), 'BBB', 3), 'CCC', 3)
    s = remove(s, 'BBB')
    expect(s).toEqual([
      { ticker: 'AAA', slot: 0 },
      { ticker: 'CCC', slot: 2 },
    ])
    s = toggleCompare(s, 'DDD', 3)
    expect(s.find((x) => x.ticker === 'DDD')?.slot).toBe(1)
  })

  it('ignores additions past the limit', () => {
    const full = toggleCompare(toggleCompare(viewOnly('AAA'), 'BBB', 3), 'CCC', 3)
    expect(toggleCompare(full, 'DDD', 3)).toBe(full)
  })

  it('can start a comparison from an empty selection', () => {
    expect(toggleCompare([], 'AAA', 3)).toEqual([{ ticker: 'AAA', slot: 0 }])
  })
})
