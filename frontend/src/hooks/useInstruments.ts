import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { InstrumentSummary } from '../types/api'

interface Result {
  attempt: number
  instruments?: InstrumentSummary[]
  error?: Error
}

/** Fetches every instrument's summary once (and again on retry). Search filters it client-side. */
export function useInstruments() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    api.getInstruments(controller.signal).then(
      (instruments) => setResult({ attempt, instruments }),
      (error: Error) => {
        if (!controller.signal.aborted) setResult({ attempt, error })
      },
    )
    return () => controller.abort()
  }, [attempt])

  // A result from an earlier attempt means the retry is still loading.
  const current = result?.attempt === attempt ? result : null

  return {
    instruments: current?.instruments,
    error: current?.error,
    isLoading: current === null,
    retry: () => setAttempt((n) => n + 1),
  }
}
