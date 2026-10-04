import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { ChartSeries } from './lib/chartData'
import { SERIES_COLORS } from './styles/theme'
import { mockApi } from './test/mockApi'

// jsdom has no layout, so the virtualized list can't measure which rows are visible.
// Render every row instead; virtualization itself is react-window's job.
vi.mock('react-window', () => ({
  List: ({ rowComponent: Row, rowCount, rowProps, ...rest }: {
    rowComponent: (props: Record<string, unknown>) => ReactElement
    rowCount: number
    rowProps: Record<string, unknown>
    'aria-label'?: string
  }) => (
    <div role="list" aria-label={rest['aria-label']}>
      {Array.from({ length: rowCount }, (_, index) => (
        <Row key={index} index={index} style={{}} ariaAttributes={{ role: 'listitem' }} {...rowProps} />
      ))}
    </div>
  ),
}))

// Recharts can't size itself in jsdom. Swap in a stand-in that exposes exactly what the app
// passes to the chart (which tickers, in which colors); the row-building math has its own tests.
vi.mock('./components/chart/PriceChart', () => ({
  default: ({ series }: { series: readonly ChartSeries[] }) => (
    <ul aria-label="Chart series">
      {series.map((s) => (
        <li key={s.ticker} data-color={s.color}>
          {s.ticker}
        </li>
      ))}
    </ul>
  ),
}))

const TICKERS = ['AAA', 'BBB', 'CCC', 'DDD']

const row = (ticker: string) => screen.getByRole('button', { name: new RegExp(`^${ticker}`) })
const checkbox = (ticker: string) => screen.getByRole('checkbox', { name: `Compare ${ticker}` })
const chartSeries = async () => {
  const chart = await screen.findByRole('list', { name: 'Chart series' })
  return within(chart)
    .getAllByRole('listitem')
    .map((li) => `${li.textContent} ${li.dataset.color}`)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows skeletons while loading, then every instrument with last price and 30D change', async () => {
    mockApi(TICKERS)
    render(<App />)

    expect(screen.getByLabelText('Loading instruments')).toBeInTheDocument()

    expect(await screen.findByRole('button', { name: /^AAA/ })).toHaveTextContent('AAA105.00+5.00%')
    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    expect(screen.getByText('4 instruments')).toBeInTheDocument()
  })

  it('overlays up to 3 tickers, keeps each ticker’s color when another is removed, and disables a 4th', async () => {
    const user = userEvent.setup()
    mockApi(TICKERS)
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /^AAA/ }))
    expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`])
    expect(await screen.findByText('Total return')).toBeInTheDocument() // single-ticker tiles

    await user.click(checkbox('BBB'))
    await user.click(checkbox('CCC'))
    await waitFor(async () =>
      expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`, `BBB ${SERIES_COLORS[1]}`, `CCC ${SERIES_COLORS[2]}`]),
    )
    expect(screen.getByText(/% change since/i)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Statistics comparison' })).toBeInTheDocument()
    expect(checkbox('DDD')).toBeDisabled()

    // Remove the middle one: the survivors keep their colors.
    await user.click(screen.getByRole('button', { name: 'Remove BBB from chart' }))
    expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`, `CCC ${SERIES_COLORS[2]}`])
    expect(checkbox('DDD')).toBeEnabled()

    // A newcomer takes the freed color rather than repainting anyone.
    await user.keyboard('{Shift>}')
    await user.click(row('DDD'))
    await user.keyboard('{/Shift}')
    await waitFor(async () =>
      expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`, `CCC ${SERIES_COLORS[2]}`, `DDD ${SERIES_COLORS[1]}`]),
    )

    // A plain click goes back to viewing just that ticker.
    await user.click(row('BBB'))
    expect(await chartSeries()).toEqual([`BBB ${SERIES_COLORS[0]}`])
  })

  it('ignores a slow response for a ticker the user has already moved away from', async () => {
    const user = userEvent.setup()
    const api = mockApi(TICKERS)
    const releaseAAA = api.hold('/api/prices/AAA')
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /^AAA/ }))
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument()
    await user.click(row('BBB'))
    expect(await chartSeries()).toEqual([`BBB ${SERIES_COLORS[0]}`])

    const aaaRequest = api.requests.find((r) => r.path === '/api/prices/AAA')
    expect(aaaRequest?.signal?.aborted).toBe(true)

    releaseAAA()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(await chartSeries()).toEqual([`BBB ${SERIES_COLORS[0]}`])
    expect(screen.getByRole('list', { name: 'Tickers on chart' })).not.toHaveTextContent('AAA')
  })

  it('shows a per-ticker error with retry while the other compared tickers still chart', async () => {
    const user = userEvent.setup()
    const api = mockApi(TICKERS)
    api.failNetwork('/api/prices/BBB')
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /^AAA/ }))
    await user.click(checkbox('BBB'))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/BBB · Server unreachable/i)
    expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`])

    api.restore('/api/prices/BBB')
    await user.click(within(alert).getByRole('button', { name: 'Retry' }))

    await waitFor(async () => expect(await chartSeries()).toEqual([`AAA ${SERIES_COLORS[0]}`, `BBB ${SERIES_COLORS[1]}`]))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('recovers from a failed instrument list via retry', async () => {
    const user = userEvent.setup()
    const api = mockApi(TICKERS)
    api.failNetwork('/api/instruments')
    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Couldn't load instruments/i)

    api.restore('/api/instruments')
    await user.click(within(alert).getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('button', { name: /^AAA/ })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
