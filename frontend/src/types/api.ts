// Mirrors the backend response shapes (backend/InstrumentPrices.Api/Models/Responses.cs).

/** One row of GET /api/instruments. */
export interface InstrumentSummary {
  ticker: string
  lastPrice: number
  totalReturnPercent: number
}

export interface PricePoint {
  /** ISO date, "yyyy-MM-dd". */
  date: string
  price: number
}

export interface PriceSeries {
  ticker: string
  prices: PricePoint[]
}

export interface InstrumentStats {
  ticker: string
  startDate: string
  endDate: string
  totalReturnPercent: number
  dailyVolatilityPercent: number
  /** Zero or negative, e.g. -12.5 is a 12.5% peak-to-trough fall. */
  maxDrawdownPercent: number
}

/** RFC 7807 error body returned by the API for 400/404. */
export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
}
