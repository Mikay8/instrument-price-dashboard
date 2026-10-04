import type { InstrumentStats, InstrumentSummary, PriceSeries, ProblemDetails } from '../types/api'
import { API_BASE_URL } from './config'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { signal })
  } catch (error) {
    // Let callers distinguish "user moved on" from "server unreachable".
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Could not reach the price server. Is the backend running?')
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails
    throw new ApiError(response.status, problem.detail ?? problem.title ?? `Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export const api = {
  getInstruments: (signal?: AbortSignal) => getJson<InstrumentSummary[]>('/api/instruments', signal),
  getPrices: (ticker: string, signal?: AbortSignal) =>
    getJson<PriceSeries>(`/api/prices/${encodeURIComponent(ticker)}`, signal),
  getStats: (ticker: string, signal?: AbortSignal) =>
    getJson<InstrumentStats>(`/api/prices/${encodeURIComponent(ticker)}/stats`, signal),
}
