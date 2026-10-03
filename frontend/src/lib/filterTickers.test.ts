import { filterTickers } from './filterTickers'

const TICKERS = ['TICK0001', 'TICK0010', 'TICK0100', 'BRK.B']

describe('filterTickers', () => {
  it('returns every ticker for an empty or blank query', () => {
    expect(filterTickers(TICKERS, '')).toBe(TICKERS)
    expect(filterTickers(TICKERS, '   ')).toBe(TICKERS)
  })

  it('matches substrings anywhere in the ticker', () => {
    expect(filterTickers(TICKERS, '010')).toEqual(['TICK0010', 'TICK0100'])
  })

  it('ignores case and surrounding whitespace', () => {
    expect(filterTickers(TICKERS, '  brk ')).toEqual(['BRK.B'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTickers(TICKERS, 'ZZZ')).toEqual([])
  })
})
