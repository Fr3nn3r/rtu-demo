import { Outlet } from 'react-router-dom'
import { TopNav } from './top-nav'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
