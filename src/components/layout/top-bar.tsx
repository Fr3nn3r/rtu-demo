import { Sun, Moon, Monitor, Palette, ChevronDown, LogOut } from 'lucide-react'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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
  const { colorTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <Palette className="w-3.5 h-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={colorTheme} onValueChange={setColorTheme}>
          {THEMES.map(theme => (
            <DropdownMenuRadioItem key={theme.id} value={theme.id}>
              {theme.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 h-7 px-1.5 rounded-md hover:bg-muted transition-colors">
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0">
          V
        </div>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>
          <div>
            <p className="text-xs font-medium text-foreground">Vincent Pillay</p>
            <p className="text-[10px] text-muted-foreground capitalize font-normal">Claims Operator</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
