// JS access to the tokens in theme.css, for places that can't use Tailwind classes (Recharts props, inline styles).
// Values are CSS variable references, so theme.css stays the only place a color is defined.

const token = (name: string) => `var(--${name})`

/** Line colors in fixed slot order. A ticker keeps its slot while it stays on the chart. */
export const SERIES_COLORS = [token('color-series-1'), token('color-series-2'), token('color-series-3')] as const

export const chartTheme = {
  grid: token('color-hairline'),
  axisText: token('color-ink-muted'),
  crosshair: token('color-hairline-strong'),
  tooltipBackground: token('color-surface'),
  tooltipBorder: token('color-hairline-strong'),
  priceTagText: token('color-accent-ink'),
  fontFamily: token('font-mono'),
  fontSize: 11,
  lineWidth: 2,
} as const
