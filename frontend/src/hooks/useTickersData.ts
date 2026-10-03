import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { InstrumentStats, PriceSeries } from '../types/api'

export interface TickerData {
  series: PriceSeries
  stats: InstrumentStats
}

/**
 * Loads prices + stats for every selected ticker and caches them by ticker, so re-selecting a
 * ticker is instant and makes no requests.
 *
 * Each ticker has its own AbortController. Deselecting a ticker (including by clicking a different
 * one) aborts its in-flight request, so a slow response can never land after the user has moved on.
 */
export function useTickersData(tickers: readonly string[]) {
  const [cache, setCache] = useState<Record<string, TickerData>>({})
  const [failures, setFailures] = useState<Record<string, Error>>({})
  const inFlight = useRef(new Map<string, AbortController>())

  // Forget errors for deselected tickers so re-adding one tries again. Adjusting state while
  // rendering (rather than in an effect) is React's recommended way to react to a prop change.
  const [prevTickers, setPrevTickers] = useState(tickers)
  if (tickers !== prevTickers) {
    setPrevTickers(tickers)
    if (Object.keys(failures).some((ticker) => !tickers.includes(ticker))) {
      setFailures(Object.fromEntries(Object.entries(failures).filter(([ticker]) => tickers.includes(ticker))))
    }
  }

  useEffect(() => {
    const wanted = new Set(tickers)

    for (const [ticker, controller] of inFlight.current) {
      if (!wanted.has(ticker)) {
        controller.abort()
        inFlight.current.delete(ticker)
      }
    }

    for (const ticker of tickers) {
      if (cache[ticker] || failures[ticker] || inFlight.current.has(ticker)) continue

      const controller = new AbortController()
      inFlight.current.set(ticker, controller)
      Promise.all([api.getPrices(ticker, controller.signal), api.getStats(ticker, controller.signal)])
        .then(
          ([series, stats]) => setCache((current) => ({ ...current, [ticker]: { series, stats } })),
          (error: Error) => {
            if (controller.signal.aborted) return
            controller.abort() // cancel whichever of the pair is still running
            setFailures((current) => ({ ...current, [ticker]: error }))
          },
        )
        .finally(() => {
          if (inFlight.current.get(ticker) === controller) inFlight.current.delete(ticker)
        })
    }
  }, [tickers, cache, failures])

  // Abort everything on unmount.
  useEffect(() => {
    const requests = inFlight.current
    return () => {
      for (const controller of requests.values()) controller.abort()
      requests.clear()
    }
  }, [])

  const retry = useCallback((ticker: string) => {
    setFailures((current) => {
      const { [ticker]: _, ...rest } = current
      return rest
    })
  }, [])

  return { cache, failures, retry }
}
