import { vi } from 'vitest'
import type { InstrumentStats, InstrumentSummary, PriceSeries } from '../types/api'

/** Deterministic fake data for a ticker: 3 days, rising by 10% then falling. */
export function fakeTicker(ticker: string, base: number) {
  const prices = [base, base * 1.1, base * 1.05].map((price, i) => ({ date: `2026-06-2${3 + i}`, price }))
  const series: PriceSeries = { ticker, prices }
  const stats: InstrumentStats = {
    ticker,
    startDate: prices[0].date,
    endDate: prices[2].date,
    totalReturnPercent: 5,
    dailyVolatilityPercent: 1.25,
    maxDrawdownPercent: -4.55,
  }
  const summary: InstrumentSummary = { ticker, lastPrice: prices[2].price, totalReturnPercent: 5 }
  return { series, stats, summary }
}

type Handler = (signal: AbortSignal | undefined) => Promise<Response>

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

/**
 * Stubs global fetch with a tiny router over /api/instruments and /api/prices/*.
 * Individual routes can be overridden (to fail, or to hang until released) via `override`.
 * Aborted requests reject with an AbortError, like real fetch.
 */
export function mockApi(tickers: string[]) {
  const data = Object.fromEntries(tickers.map((t, i) => [t, fakeTicker(t, 100 * (i + 1))]))
  const overrides = new Map<string, Handler>()
  const requests: { path: string; signal?: AbortSignal }[] = []

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    const signal = init?.signal ?? undefined
    requests.push({ path, signal })

    const respond = (): Promise<Response> => {
      const override = overrides.get(path)
      if (override) return override(signal)
      if (path === '/api/instruments') return json(Object.values(data).map((d) => d.summary))
      const match = path.match(/^\/api\/prices\/([^/]+)(\/stats)?$/)
      const entry = match && data[decodeURIComponent(match[1])]
      if (!entry) return json({ title: 'Unknown ticker', detail: `No price data for ticker '${match?.[1]}'.` }, 404)
      return json(match[2] ? entry.stats : entry.series)
    }

    return new Promise<Response>((resolve, reject) => {
      if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      respond().then(resolve, reject)
    })
  })
  vi.stubGlobal('fetch', fetchMock)

  return {
    data,
    requests,
    /** Make a route fail as if the server were down. */
    failNetwork(path: string) {
      overrides.set(path, () => Promise.reject(new TypeError('Failed to fetch')))
    },
    /** Hold a route's response until the returned function is called. */
    hold(path: string) {
      let release!: () => void
      const gate = new Promise<void>((resolve) => (release = resolve))
      const original = data[decodeURIComponent(path.split('/')[3])]
      overrides.set(path, async () => {
        await gate
        return json(path.endsWith('/stats') ? original.stats : original.series)
      })
      return release
    },
    restore(path: string) {
      overrides.delete(path)
    },
  }
}
