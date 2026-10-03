// Loaded with React.lazy: Recharts is the largest dependency, so it stays out of the initial bundle.
import { useId, useMemo } from 'react'
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  usePlotArea,
  useYAxisScale,
} from 'recharts'
import { buildChartRows, chartModeFor, type ChartMode, type ChartRow, type ChartSeries } from '../../lib/chartData'
import { formatPercent, formatPrice, formatShortDate } from '../../lib/format'
import { chartTheme } from '../../styles/theme'

const TICK_STYLE = { fill: chartTheme.axisText, fontSize: chartTheme.fontSize, fontFamily: chartTheme.fontFamily }
const Y_AXIS_WIDTH = 72
const TAG_HEIGHT = 20

const formatValue = (mode: ChartMode, value: number, digits = 2) =>
  mode === 'price' ? formatPrice(value) : formatPercent(value, { signed: true, digits })

export default function PriceChart({ series }: { series: readonly ChartSeries[] }) {
  const mode = chartModeFor(series.length)
  // Only recomputed when the selected series change, not on unrelated re-renders.
  const rows = useMemo(() => buildChartRows(series, mode), [series, mode])
  const fillId = `fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const endValues = series.flatMap(({ ticker, color }) => {
    const last = rows.findLast((row) => row.values[ticker] !== undefined)
    return last ? [{ ticker, color, value: last.values[ticker] }] : []
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={rows} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={series[0]?.color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={series[0]?.color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartTheme.grid} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={{ stroke: chartTheme.grid }}
          tickMargin={10}
          minTickGap={48}
        />
        <YAxis
          orientation="right"
          domain={['auto', 'auto']}
          tickFormatter={(value: number) => formatValue(mode, value, 1)}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          tickCount={5}
          width={Y_AXIS_WIDTH}
        />
        {mode === 'change' && <ReferenceLine y={0} stroke={chartTheme.crosshair} strokeDasharray="4 4" />}
        <Tooltip
          cursor={{ stroke: chartTheme.crosshair, strokeDasharray: '3 3' }}
          isAnimationActive={false}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as ChartRow | undefined
            if (!active || !row) return null
            return <ChartTooltip row={row} series={series} mode={mode} />
          }}
        />
        {series.map(({ ticker, color }) =>
          // One series: soft area fill. Comparing: plain lines, since stacked fills would muddy each other.
          mode === 'price' ? (
            <Area
              key={ticker}
              type="linear"
              dataKey={(row: ChartRow) => row.values[ticker]}
              name={ticker}
              stroke={color}
              strokeWidth={chartTheme.lineWidth}
              fill={`url(#${fillId})`}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: color, stroke: chartTheme.tooltipBackground, strokeWidth: 2 }}
            />
          ) : (
            <Line
              key={ticker}
              type="linear"
              dataKey={(row: ChartRow) => row.values[ticker]}
              name={ticker}
              stroke={color}
              strokeWidth={chartTheme.lineWidth}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: color, stroke: chartTheme.tooltipBackground, strokeWidth: 2 }}
            />
          ),
        )}
        <EndTags tags={endValues} mode={mode} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function ChartTooltip({ row, series, mode }: { row: ChartRow; series: readonly ChartSeries[]; mode: ChartMode }) {
  return (
    <div className="flex flex-col gap-1.5 border border-hairline-strong bg-surface px-3 py-2 text-xs">
      <p className="label-caps">{formatShortDate(row.date)}</p>
      {series.map(({ ticker, color }) =>
        row.values[ticker] === undefined ? null : (
          <p key={ticker} className="flex items-center gap-2 tabular-nums">
            <span aria-hidden="true" className="size-2" style={{ backgroundColor: color }} />
            {series.length > 1 && <span className="w-20 font-bold">{ticker}</span>}
            <span className="text-sm text-ink">{formatPrice(row.prices[ticker])}</span>
            {mode === 'change' && <span className="text-ink-muted">{formatValue(mode, row.values[ticker])}</span>}
          </p>
        ),
      )}
    </div>
  )
}

/**
 * Each series' latest value as a colored tag on the y-axis, labelling the line directly.
 * Tags that would overlap are nudged apart vertically.
 */
function EndTags({ tags, mode }: { tags: { ticker: string; color: string; value: number }[]; mode: ChartMode }) {
  const yScale = useYAxisScale()
  const plot = usePlotArea()
  if (!yScale || !plot) return null

  const placed = tags
    .map((tag) => ({ ...tag, y: yScale(tag.value) ?? 0 }))
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < placed.length; i++) {
    placed[i].y = Math.max(placed[i].y, placed[i - 1].y + TAG_HEIGHT + 2)
  }

  const x = plot.x + plot.width + 4
  return (
    <g aria-hidden="true">
      {placed.map(({ ticker, color, value, y }) => (
        <g key={ticker}>
          <rect x={x} y={y - TAG_HEIGHT / 2} width={Y_AXIS_WIDTH - 8} height={TAG_HEIGHT} fill={color} />
          <text
            x={x + 6}
            y={y}
            dominantBaseline="central"
            fontSize={chartTheme.fontSize}
            fontFamily={chartTheme.fontFamily}
            fontWeight={700}
            fill={chartTheme.priceTagText}
          >
            {formatValue(mode, value)}
          </text>
        </g>
      ))}
    </g>
  )
}
