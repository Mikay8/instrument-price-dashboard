import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { InstrumentStats, PriceSeries } from '../types/api'

export interface TickerData {
  series: PriceSeries
  stats: InstrumentStats
}

interface Failure {
  ticker: string
  attempt: number
  error: Error
}

/**
 * Loads prices + stats for the selected ticker and caches them by ticker, so switching back is
 * instant and the sidebar can show LAST / 30D for every ticker viewed so far.
 *
 * Changing the ticker aborts the in-flight request, so a slow response for an old ticker can
 * never overwrite the one the user picked last.
 */
export function useTickerData(ticker: string | null) {
  const [cache, setCache] = useState<Record<string, TickerData>>({})
  const [failure, setFailure] = useState<Failure | null>(null)
  const [attempt, setAttempt] = useState(0)

  const cached = ticker ? cache[ticker] : undefined

  useEffect(() => {
    if (!ticker || cached) return

    const controller = new AbortController()
    Promise.all([api.getPrices(ticker, controller.signal), api.getStats(ticker, controller.signal)]).then(
      ([series, stats]) => setCache((current) => ({ ...current, [ticker]: { series, stats } })),
      (error: Error) => {
        if (controller.signal.aborted) return
        controller.abort() // cancel whichever of the pair is still running
        setFailure({ ticker, attempt, error })
      },
    )
    return () => controller.abort()
  }, [ticker, cached, attempt])

  const error = failure && failure.ticker === ticker && failure.attempt === attempt ? failure.error : undefined

  return {
    data: cached,
    error,
    isLoading: ticker !== null && !cached && !error,
    /** Everything loaded so far, keyed by ticker. */
    cache,
    retry: () => setAttempt((n) => n + 1),
  }
}
