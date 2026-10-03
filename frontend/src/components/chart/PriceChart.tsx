// Loaded with React.lazy: Recharts is the largest dependency, so it stays out of the initial bundle.
import { useId, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPrice, formatShortDate } from '../../lib/format'
import { chartTheme } from '../../styles/theme'
import type { PriceSeries } from '../../types/api'

interface PriceChartProps {
  series: PriceSeries
  color: string
}

const TICK_STYLE = { fill: chartTheme.axisText, fontSize: chartTheme.fontSize, fontFamily: chartTheme.fontFamily }
const Y_AXIS_WIDTH = 72

export default function PriceChart({ series, color }: PriceChartProps) {
  // Recharts wants plain row objects. Cached series keep their identity, so this only reruns for new data.
  const data = useMemo(() => series.prices.map(({ date, price }) => ({ date, price })), [series])
  const lastPrice = data.at(-1)?.price
  const gradientId = `fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
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
          tickFormatter={formatPrice}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          tickCount={5}
          width={Y_AXIS_WIDTH}
        />
        <Tooltip
          cursor={{ stroke: chartTheme.crosshair, strokeDasharray: '3 3' }}
          isAnimationActive={false}
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as { date: string; price: number } | undefined
            if (!active || !point) return null
            return (
              <div className="border border-hairline-strong bg-surface px-3 py-2 text-xs">
                <p className="label-caps">{formatShortDate(point.date)}</p>
                <p className="mt-1 text-sm text-ink tabular-nums">{formatPrice(point.price)}</p>
              </div>
            )
          }}
        />
        <Area
          type="linear"
          dataKey="price"
          name={series.ticker}
          stroke={color}
          strokeWidth={chartTheme.lineWidth}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          activeDot={{ r: 4, fill: color, stroke: chartTheme.tooltipBackground, strokeWidth: 2 }}
        />
        {lastPrice !== undefined && (
          <ReferenceLine
            y={lastPrice}
            stroke="none"
            label={(props: { viewBox?: { x?: number; y?: number; width?: number } }) => (
              <LastPriceTag viewBox={props.viewBox} value={lastPrice} color={color} />
            )}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Highlighted last price on the y-axis, like a trading terminal's price tag. */
function LastPriceTag({ viewBox, value, color }: { viewBox?: { x?: number; y?: number; width?: number }; value: number; color: string }) {
  if (viewBox?.x === undefined || viewBox.y === undefined || viewBox.width === undefined) return null
  const x = viewBox.x + viewBox.width + 4
  const height = 20
  return (
    <g>
      <rect x={x} y={viewBox.y - height / 2} width={Y_AXIS_WIDTH - 8} height={height} fill={color} />
      <text
        x={x + 6}
        y={viewBox.y}
        dominantBaseline="central"
        fontSize={chartTheme.fontSize}
        fontFamily={chartTheme.fontFamily}
        fontWeight={700}
        fill={chartTheme.priceTagText}
      >
        {formatPrice(value)}
      </text>
    </g>
  )
}
