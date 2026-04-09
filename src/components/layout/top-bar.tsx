import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Palette, Check, ChevronDown, LogOut } from 'lucide-react'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

function DarkModeToggle() {
  const { mode, setMode } = useTheme()

  const modes: { id: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light mode' },
    { id: 'dark', icon: Moon, label: 'Dark mode' },
    { id: 'system', icon: Monitor, label: 'System mode' },
  ]

  return (
    <div className="flex items-center rounded-md p-0.5 bg-muted">
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={cn(
            'p-1 rounded transition-all',
            mode === id
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          title={label}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}

function ThemePicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { colorTheme, setColorTheme } = useTheme()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors',
          open ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
        title="Color theme"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg z-50 py-1 overflow-hidden">
          <div className="px-2.5 py-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Theme</p>
          </div>
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => { setColorTheme(theme.id); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors',
                colorTheme === theme.id
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <span className="flex-1 text-left">{theme.name}</span>
              {colorTheme === theme.id && <Check className="w-3 h-3 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-1 h-7 px-1.5 rounded-md transition-colors',
          open ? 'bg-accent' : 'hover:bg-muted',
        )}
        title="Signed in as Vincent Pillay"
      >
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0">
          V
        </div>
        <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover shadow-lg z-50 py-1 overflow-hidden">
          <div className="px-2.5 py-1.5 border-b border-border">
            <p className="text-xs font-medium text-foreground">Vincent Pillay</p>
            <p className="text-[10px] text-muted-foreground capitalize">Claims Operator</p>
          </div>
          <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  return (
    <div className="h-10 bg-card border-b border-border px-3 pt-px flex items-center justify-between z-20 shrink-0">
      <div className="inline-flex items-center gap-1.5 h-7 px-1.5">
        <img src="/trueaim-logo.png" alt="True Aim" className="h-5 w-5 object-contain shrink-0" />
        <img src="/trueaim-wordmark.png" alt="True Aim" className="h-[11px] object-contain shrink-0 dark:brightness-0 dark:invert opacity-80" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <DarkModeToggle />
        <ThemePicker />
        <div className="w-px h-4 bg-border" />
        <UserMenu />
      </div>
    </div>
  )
}
