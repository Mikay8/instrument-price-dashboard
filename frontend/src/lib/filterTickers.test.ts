import { filterTickers } from './filterTickers'

const TICKERS = ['TICK0001', 'TICK0010', 'TICK0100', 'BRK.B'].map((ticker) => ({ ticker }))
const tickersOf = (items: readonly { ticker: string }[]) => items.map((item) => item.ticker)

describe('filterTickers', () => {
  it('returns every ticker for an empty or blank query', () => {
    expect(filterTickers(TICKERS, '')).toBe(TICKERS)
    expect(filterTickers(TICKERS, '   ')).toBe(TICKERS)
  })

  it('matches substrings anywhere in the ticker', () => {
    expect(tickersOf(filterTickers(TICKERS, '010'))).toEqual(['TICK0010', 'TICK0100'])
  })

  it('ignores case and surrounding whitespace', () => {
    expect(tickersOf(filterTickers(TICKERS, '  brk '))).toEqual(['BRK.B'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTickers(TICKERS, 'ZZZ')).toEqual([])
  })
})
