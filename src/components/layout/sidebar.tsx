import { NavLink } from 'react-router-dom'
import { FileText, LayoutDashboard, Users, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaims } from '@/context/ClaimContext'

const navItems = [
  { to: '/claims', label: 'Claims', icon: FileText, showBadge: false },
  { to: '/inbox', label: 'Inbox', icon: Inbox, showBadge: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, showBadge: false },
  { to: '/contacts', label: 'Contacts', icon: Users, showBadge: false },
]

export function Sidebar() {
  const { getUnmatchedCount } = useClaims()
  const unmatchedCount = getUnmatchedCount()

  return (
    <div className="flex w-[220px] flex-col shrink-0 border-r border-sidebar-border bg-sidebar">
      <nav className="flex flex-col gap-1 px-3 pt-3 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
          const showBadge = item.showBadge && unmatchedCount > 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="inline-flex items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary-foreground text-[10px] font-semibold px-1.5 min-w-[20px] h-5">
                  {unmatchedCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            v1.0
          </span>
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  )
}
