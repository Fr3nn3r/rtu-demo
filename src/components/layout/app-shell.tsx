import { Outlet } from 'react-router-dom'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { ErrorBoundary } from './error-boundary'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
