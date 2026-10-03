import type { ReactNode } from 'react'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/Skeleton'

/** Fixed height includes the x-axis band, so the frame never scrolls internally. */
export const CHART_HEIGHT = 380

export function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <Panel className="p-4">
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
