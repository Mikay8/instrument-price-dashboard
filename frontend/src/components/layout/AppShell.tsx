import type { ReactNode } from 'react'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

/**
 * Sidebar + main area. From lg (1024px) the shell fills the viewport and the sidebar list
 * scrolls on its own; below that (phones, portrait tablets) the sidebar stacks above the
 * main area so the chart gets the full width.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex max-h-[50vh] min-h-0 flex-col border-b border-hairline lg:max-h-none lg:border-r lg:border-b-0">
        {sidebar}
      </aside>
      <main className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:overflow-y-auto lg:p-8">{children}</main>
    </div>
  )
}
