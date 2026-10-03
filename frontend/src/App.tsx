import { lazy, Suspense, useMemo, useState } from 'react'
import { ApiError } from './api/client'
import { ChartFrame, ChartSkeleton } from './components/chart/ChartFrame'
import { ChartHeader } from './components/chart/ChartHeader'
import { InstrumentList } from './components/instruments/InstrumentList'
import { InstrumentsHeader } from './components/instruments/InstrumentsHeader'
import { TickerListSkeleton } from './components/instruments/TickerListSkeleton'
import { AppShell } from './components/layout/AppShell'
import { StatsGrid, StatsGridSkeleton } from './components/stats/StatsGrid'
import { EmptyState } from './components/ui/EmptyState'
import { ErrorState } from './components/ui/ErrorState'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useInstruments } from './hooks/useInstruments'
import { useTickerData } from './hooks/useTickerData'
import { MAX_COMPARE } from './lib/compare'
import { filterTickers } from './lib/filterTickers'
import { SERIES_COLORS } from './styles/theme'

const PriceChart = lazy(() => import('./components/chart/PriceChart'))

const SEARCH_DEBOUNCE_MS = 150

function describeError(error: Error): { title: string; message: string } {
  if (error instanceof ApiError && error.status === 404) return { title: 'Unknown ticker', message: error.message }
  if (error instanceof ApiError && error.status === 0) return { title: 'Server unreachable', message: error.message }
  return { title: "Couldn't load prices", message: error.message }
}

function App() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const instruments = useInstruments()
  const tickerData = useTickerData(selectedTicker)

  const visibleTickers = useMemo(
    () => filterTickers(instruments.tickers ?? [], debouncedQuery),
    [instruments.tickers, debouncedQuery],
  )
  const selectedTickers = useMemo(() => (selectedTicker ? [selectedTicker] : []), [selectedTicker])

  // Multi-select compare comes in the next step; for now ticking a box views that ticker.
  const toggleTicker = (ticker: string) => setSelectedTicker((current) => (current === ticker ? null : ticker))

  const sidebar = (
    <>
      <InstrumentsHeader
        total={instruments.tickers?.length ?? null}
        compareCount={selectedTickers.length}
        maxCompare={MAX_COMPARE}
        query={query}
        onQueryChange={setQuery}
      />
      {instruments.isLoading ? (
        <TickerListSkeleton />
      ) : instruments.error ? (
        <ErrorState
          className="m-4"
          title="Couldn't load instruments"
          message={instruments.error.message}
          onRetry={instruments.retry}
        />
      ) : visibleTickers.length === 0 ? (
        <EmptyState title="No matches" hint={`No ticker contains “${debouncedQuery.trim()}”.`} />
      ) : (
        <InstrumentList
          tickers={visibleTickers}
          selectedTickers={selectedTickers}
          colors={SERIES_COLORS}
          loaded={tickerData.cache}
          compareDisabled={false}
          onView={setSelectedTicker}
          onToggleCompare={toggleTicker}
        />
      )}
    </>
  )

  const { data } = tickerData
  const first = data?.series.prices[0]?.price
  const last = data?.series.prices.at(-1)?.price

  return (
    <AppShell sidebar={sidebar}>
      {selectedTicker === null ? (
        <EmptyState
          className="flex-1"
          title="No instrument selected"
          hint="Pick a ticker from the list to see its 30-day price chart and stats."
        />
      ) : (
        <>
          <ChartHeader
            series={[
              {
                ticker: data?.series.ticker ?? selectedTicker,
                color: SERIES_COLORS[0],
                lastPrice: last,
                change: first !== undefined && last !== undefined ? last - first : undefined,
                changePercent: data?.stats.totalReturnPercent,
              },
            ]}
            onRemove={() => setSelectedTicker(null)}
          />
          {tickerData.error ? (
            <ErrorState {...describeError(tickerData.error)} onRetry={tickerData.retry} />
          ) : data ? (
            <>
              <Suspense fallback={<ChartSkeleton />}>
                <ChartFrame>
                  <PriceChart series={data.series} color={SERIES_COLORS[0]} />
                </ChartFrame>
              </Suspense>
              <StatsGrid stats={data.stats} />
            </>
          ) : (
            <>
              <ChartSkeleton />
              <StatsGridSkeleton />
            </>
          )}
        </>
      )}
    </AppShell>
  )
}

export default App
