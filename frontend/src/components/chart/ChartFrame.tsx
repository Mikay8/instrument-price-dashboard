import type { ReactNode } from 'react'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/Skeleton'

/**
 * Plot height including the x-axis band, so the frame never scrolls internally.
 * Scales with the viewport between 240px and 380px so chart + stats fit on shorter screens.
 */
const CHART_HEIGHT = 'clamp(240px, 42vh, 380px)'

export function ChartFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <Panel className="p-4">
      {caption && <p className="label-caps mb-3">{caption}</p>}
      <div style={{ height: CHART_HEIGHT }}>{children}</div>
    </Panel>
  )
}

export function ChartSkeleton() {
  return (
    <ChartFrame>
      <div aria-busy="true" aria-label="Loading chart" className="flex h-full flex-col gap-4">
        <div className="flex min-h-0 flex-1 gap-4">
          <Skeleton className="h-full flex-1" />
          <div className="flex w-14 flex-col justify-between py-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
        <div className="mr-18 flex justify-between">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-3 w-12" />
          ))}
        </div>
      </div>
    </ChartFrame>
  )
}
