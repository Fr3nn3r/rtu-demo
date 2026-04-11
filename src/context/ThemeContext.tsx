import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Mode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  colorTheme: string
  setColorTheme: (theme: string) => void
  mode: Mode
  setMode: (mode: Mode) => void
  resolvedMode: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const THEMES = [
  { id: 'supabase', name: 'Supabase' },
  { id: 'clean-slate', name: 'Clean Slate' },
  { id: 'starry-night', name: 'Starry Night' },
  { id: 'northern-lights', name: 'Northern Lights' },
] as const

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState(
    () => localStorage.getItem('color-theme') || 'supabase'
  )
  const [mode, setModeState] = useState<Mode>(
    () => (localStorage.getItem('theme-mode') as Mode) || 'light'
  )
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return mode === 'dark' ? 'dark' : 'light'
  })

  const setColorTheme = useCallback((theme: string) => {
    setColorThemeState(theme)
    localStorage.setItem('color-theme', theme)
  }, [])

  const setMode = useCallback((m: Mode) => {
    setModeState(m)
    localStorage.setItem('theme-mode', m)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.className = html.className.replace(/theme-\S+/g, '').trim()
    html.classList.add(`theme-${colorTheme}`)
  }, [colorTheme])

  useEffect(() => {
    const html = document.documentElement

    function applyDark(dark: boolean) {
      if (dark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      setResolvedMode(dark ? 'dark' : 'light')
    }

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyDark(mq.matches)
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyDark(mode === 'dark')
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme, mode, setMode, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
