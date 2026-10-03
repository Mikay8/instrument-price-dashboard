import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Result {
  attempt: number
  tickers?: string[]
  error?: Error
}

/** Fetches the full ticker list once (and again on retry). Search filters it client-side. */
export function useInstruments() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    api.getInstruments(controller.signal).then(
      (tickers) => setResult({ attempt, tickers }),
      (error: Error) => {
        if (!controller.signal.aborted) setResult({ attempt, error })
      },
    )
    return () => controller.abort()
  }, [attempt])

  // A result from an earlier attempt means the retry is still loading.
  const current = result?.attempt === attempt ? result : null

  return {
    tickers: current?.tickers,
    error: current?.error,
    isLoading: current === null,
    retry: () => setAttempt((n) => n + 1),
  }
}
