// TEMPORARY design preview of the component library with sample data.
// Replaced by the real data-driven app in the next Phase 2 step.
// Add ?state=loading or ?state=error to the URL to preview those states.
import { useState } from 'react'
import { ChartFrame, ChartSkeleton } from './components/chart/ChartFrame'
import { ChartHeader } from './components/chart/ChartHeader'
import { InstrumentsHeader } from './components/instruments/InstrumentsHeader'
import { TickerListSkeleton } from './components/instruments/TickerListSkeleton'
import { TickerRow } from './components/instruments/TickerRow'
import { AppShell } from './components/layout/AppShell'
import { StatsGrid, StatsGridSkeleton } from './components/stats/StatsGrid'
import { EmptyState } from './components/ui/EmptyState'
import { ErrorState } from './components/ui/ErrorState'
import { MAX_COMPARE } from './lib/compare'
import { SERIES_COLORS } from './styles/theme'
import type { InstrumentStats } from './types/api'

const SAMPLE_TICKERS = Array.from({ length: 30 }, (_, i) => `TICK${String(i + 1).padStart(4, '0')}`)

// Real values from the backend for the tickers that "have been loaded".
const SAMPLE_QUOTES: Record<string, { last: number; change: number; changePercent: number }> = {
  TICK0001: { last: 172.89, change: -17.45, changePercent: -9.1678 },
  TICK0003: { last: 391.12, change: 18.94, changePercent: 5.0889 },
  TICK0007: { last: 88.4, change: -2.51, changePercent: -2.7609 },
}

const SAMPLE_STATS: InstrumentStats = {
  ticker: 'TICK0001',
  startDate: '2026-06-23',
  endDate: '2026-08-03',
  totalReturnPercent: -9.1678,
  dailyVolatilityPercent: 1.5232,
  maxDrawdownPercent: -13.3849,
}

const previewState = new URLSearchParams(window.location.search).get('state')

function App() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(['TICK0001'])

  const toggle = (ticker: string) =>
    setSelected((current) =>
      current.includes(ticker)
        ? current.filter((t) => t !== ticker)
        : current.length < MAX_COMPARE
          ? [...current, ticker]
          : current,
    )

  const visibleTickers = SAMPLE_TICKERS.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase()))

  const sidebar = (
    <>
      <InstrumentsHeader
        total={200}
        compareCount={selected.length}
        maxCompare={MAX_COMPARE}
        query={query}
        onQueryChange={setQuery}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {previewState === 'loading' ? (
          <TickerListSkeleton />
        ) : visibleTickers.length === 0 ? (
          <EmptyState title="No matches" hint={`No ticker contains “${query}”.`} />
        ) : (
          visibleTickers.map((ticker) => {
            const slot = selected.indexOf(ticker)
            const quote = SAMPLE_QUOTES[ticker]
            return (
              <TickerRow
                key={ticker}
                ticker={ticker}
                selected={slot !== -1}
                color={slot !== -1 ? SERIES_COLORS[slot] : undefined}
                lastPrice={quote?.last}
                changePercent={quote?.changePercent}
                compareDisabled={selected.length >= MAX_COMPARE}
                onView={(t) => setSelected([t])}
                onToggleCompare={toggle}
              />
            )
          })
        )}
      </div>
    </>
  )

  return (
    <AppShell sidebar={sidebar}>
      {previewState === 'error' ? (
        <ErrorState
          title="Couldn't load prices"
          message="Could not reach the price server. Is the backend running?"
          onRetry={() => {}}
        />
      ) : selected.length === 0 ? (
        <EmptyState title="No instrument selected" hint="Pick a ticker from the list to see its 30-day price chart." />
      ) : (
        <>
          <ChartHeader
            series={selected.map((ticker, i) => ({
              ticker,
              color: SERIES_COLORS[i],
              lastPrice: SAMPLE_QUOTES[ticker]?.last,
              change: SAMPLE_QUOTES[ticker]?.change,
              changePercent: SAMPLE_QUOTES[ticker]?.changePercent,
            }))}
            onRemove={(t) => setSelected((current) => current.filter((x) => x !== t))}
          />
          {previewState === 'loading' ? (
            <>
              <ChartSkeleton />
              <StatsGridSkeleton />
            </>
          ) : (
            <>
              <ChartFrame>
                <EmptyState className="h-full" title="Chart goes here" hint="Recharts line chart is the next step." />
              </ChartFrame>
              <StatsGrid stats={SAMPLE_STATS} />
            </>
          )}
        </>
      )}
    </AppShell>
  )
}

export default App
