import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contacts', icon: Users },
]

export function TopNav() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary-700 font-semibold text-lg">
          <Shield className="size-5" />
          <span>ClaimPilot</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            VP
          </div>
          <span className="text-sm text-text-secondary">Vincent Pillay</span>
        </div>
      </div>
    </header>
  )
}
