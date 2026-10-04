import { lazy, Suspense, useMemo, useState } from 'react'
import { ApiError } from './api/client'
import { ChartFrame, ChartSkeleton } from './components/chart/ChartFrame'
import { ChartHeader } from './components/chart/ChartHeader'
import { InstrumentList } from './components/instruments/InstrumentList'
import { InstrumentsHeader } from './components/instruments/InstrumentsHeader'
import { TickerListSkeleton } from './components/instruments/TickerListSkeleton'
import { AppShell } from './components/layout/AppShell'
import { StatsComparison } from './components/stats/StatsComparison'
import { StatsGrid, StatsGridSkeleton } from './components/stats/StatsGrid'
import { EmptyState } from './components/ui/EmptyState'
import { ErrorState } from './components/ui/ErrorState'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useInstruments } from './hooks/useInstruments'
import { useTickersData } from './hooks/useTickersData'
import { chartModeFor, type ChartSeries } from './lib/chartData'
import { MAX_COMPARE } from './lib/compare'
import { filterTickers } from './lib/filterTickers'
import { formatShortDate } from './lib/format'
import { remove, toggleCompare, viewOnly, type Selection } from './lib/selection'
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
  const [selection, setSelection] = useState<Selection>([])

  const instruments = useInstruments()
  const tickers = useMemo(() => selection.map((s) => s.ticker), [selection])
  const { cache, failures, retry } = useTickersData(tickers)

  const visibleInstruments = useMemo(
    () => filterTickers(instruments.instruments ?? [], debouncedQuery),
    [instruments.instruments, debouncedQuery],
  )

  // Stable between unrelated renders, so the chart only rebuilds its rows when this changes.
  const chartSeries = useMemo<ChartSeries[]>(
    () =>
      selection.flatMap(({ ticker, slot }) =>
        cache[ticker] ? [{ ticker, color: SERIES_COLORS[slot], prices: cache[ticker].series.prices }] : [],
      ),
    [selection, cache],
  )

  const isPending = (ticker: string) => !cache[ticker] && !failures[ticker]
  const anyPending = selection.some((s) => isPending(s.ticker))

  const sidebar = (
    <>
      <InstrumentsHeader
        total={instruments.instruments?.length ?? null}
        compareCount={selection.length}
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
      ) : visibleInstruments.length === 0 ? (
        <EmptyState title="No matches" hint={`No ticker contains “${debouncedQuery.trim()}”.`} />
      ) : (
        <InstrumentList
          instruments={visibleInstruments}
          selection={selection}
          colors={SERIES_COLORS}
          compareDisabled={selection.length >= MAX_COMPARE}
          onView={(ticker) => setSelection(viewOnly(ticker))}
          onToggleCompare={(ticker) => setSelection((current) => toggleCompare(current, ticker, MAX_COMPARE))}
        />
      )}
    </>
  )

  const single = selection.length === 1 ? cache[selection[0].ticker] : undefined
  const firstDate = chartSeries[0]?.prices[0]?.date

  return (
    <AppShell sidebar={sidebar}>
      {selection.length === 0 ? (
        <EmptyState
          className="flex-1"
          title="No instrument selected"
          hint="Click a ticker to view its 30-day chart and stats. Tick or shift-click up to 3 to compare."
        />
      ) : (
        <>
          <ChartHeader
            series={selection.map(({ ticker, slot }) => {
              const prices = cache[ticker]?.series.prices
              const first = prices?.[0]?.price
              const last = prices?.at(-1)?.price
              return {
                ticker,
                color: SERIES_COLORS[slot],
                lastPrice: last,
                change: first !== undefined && last !== undefined ? last - first : undefined,
                changePercent: cache[ticker]?.stats.totalReturnPercent,
                isLoading: isPending(ticker),
              }
            })}
            onRemove={(ticker) => setSelection((current) => remove(current, ticker))}
          />

          {selection
            .filter(({ ticker }) => failures[ticker])
            .map(({ ticker }) => {
              const { title, message } = describeError(failures[ticker])
              return <ErrorState key={ticker} title={`${ticker} · ${title}`} message={message} onRetry={() => retry(ticker)} />
            })}

          {chartSeries.length > 0 ? (
            <Suspense fallback={<ChartSkeleton />}>
              <ChartFrame
                caption={
                  chartModeFor(chartSeries.length) === 'change' && firstDate
                    ? `% change since ${formatShortDate(firstDate)}`
                    : undefined
                }
              >
                <PriceChart series={chartSeries} />
              </ChartFrame>
            </Suspense>
          ) : (
            anyPending && <ChartSkeleton />
          )}

          {selection.length === 1 ? (
            single ? (
              <StatsGrid stats={single.stats} />
            ) : (
              anyPending && <StatsGridSkeleton />
            )
          ) : (
            <StatsComparison
              rows={selection.map(({ ticker, slot }) => ({
                ticker,
                color: SERIES_COLORS[slot],
                stats: cache[ticker]?.stats,
                isLoading: isPending(ticker),
              }))}
            />
          )}
        </>
      )}
    </AppShell>
  )
}

export default App
