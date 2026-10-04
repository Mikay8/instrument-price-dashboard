import type { ReactNode } from 'react'
import { Skeleton } from '../ui/Skeleton'

interface StatTileProps {
  label: ReactNode
  value: string
  caption: string
  /** Text color class for the value, e.g. from toneClass(). */
  valueClassName?: string
}

/** One cell of the stats row; StatsGrid provides the border and dividers. */
export function StatTile({ label, value, caption, valueClassName = 'text-ink' }: StatTileProps) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <h3 className="label-caps">{label}</h3>
      <p className={`text-3xl leading-none font-bold tracking-tight @xl:text-4xl @4xl:text-5xl ${valueClassName}`}>{value}</p>
      <p className="label-caps">{caption}</p>
    </div>
  )
}

export function StatTileSkeleton({ label }: { label: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <h3 className="label-caps">{label}</h3>
      <Skeleton className="h-9 w-32 @4xl:h-12 @4xl:w-40" />
      <Skeleton className="h-3 w-48" />
    </div>
  )
}
