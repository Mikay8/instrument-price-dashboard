import type { ReactNode } from 'react'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

/**
 * Sidebar + main area. On desktop the shell fills the viewport and the sidebar list scrolls
 * on its own; on small screens the sidebar stacks above the main area.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:h-screen md:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex max-h-[50vh] min-h-0 flex-col border-b border-hairline md:max-h-none md:border-r md:border-b-0">
        {sidebar}
      </aside>
      <main className="flex min-w-0 flex-col gap-6 p-4 md:overflow-y-auto md:p-8">{children}</main>
    </div>
  )
}
