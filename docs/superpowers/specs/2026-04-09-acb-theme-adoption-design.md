# ACB Theme System Adoption for ClaimPilot

**Date:** 2026-04-09
**Status:** Draft
**Goal:** Make ClaimPilot visually consistent with the True Aim product family by adopting the Agentic Context Builder's theming system, layout scaffolding, and design tokens.

## Scope

Visual consistency only — no code reuse or shared package extraction. ClaimPilot adapts to the ACB design system; the themes are not adapted to fit ClaimPilot's existing UI.

## 1. Theme System

### Source

Themes are exported directly from [tweakcn](https://tweakcn.com/editor/theme) in Tailwind v4 format. Each export provides native oklch() CSS variables and a `@theme inline` bridge block — no translation from HSL needed.

### Theme Set

6 themes total. Supabase is the default:

| Theme | Default font | Source |
|-------|-------------|--------|
| Supabase (default) | Outfit | tweakcn export (provided) |
| Clean Slate | Inter | tweakcn export (provided) |
| TBD theme 3 | TBD | tweakcn export |
| TBD theme 4 | TBD | tweakcn export |
| TBD theme 5 | TBD | tweakcn export |
| TBD theme 6 | TBD | tweakcn export |

Remaining 4 themes will be selected from tweakcn for visual diversity.

### CSS Structure

Each theme is scoped under `.theme-{name}` on `:root`, with dark mode in `.theme-{name} .dark`:

```css
/* Bare :root = Supabase (default fallback) */
:root {
  --background: oklch(0.9911 0 0);
  --foreground: oklch(0.2046 0 0);
  /* ... all Supabase light tokens ... */
}
.dark {
  --background: oklch(0.1822 0 0);
  /* ... all Supabase dark tokens ... */
}

/* Named theme class for explicit selection */
.theme-supabase { /* same as :root */ }
.theme-supabase .dark { /* same as .dark */ }

.theme-clean-slate {
  --background: oklch(0.9842 0.0034 247.8575);
  /* ... all Clean Slate light tokens ... */
}
.theme-clean-slate .dark {
  --background: oklch(0.2077 0.0398 265.7549);
  /* ... all Clean Slate dark tokens ... */
}
```

### Token Set (per theme, from tweakcn)

Core surface/text tokens:
- `background`, `foreground`
- `card`, `card-foreground`
- `popover`, `popover-foreground`
- `muted`, `muted-foreground`

Interactive tokens:
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`

Form/chrome tokens:
- `border`, `input`, `ring`

Sidebar tokens:
- `sidebar`, `sidebar-foreground`
- `sidebar-primary`, `sidebar-primary-foreground`
- `sidebar-accent`, `sidebar-accent-foreground`
- `sidebar-border`, `sidebar-ring`

Chart tokens:
- `chart-1` through `chart-5`

Design tokens:
- `--radius`, `--spacing`, `--tracking-normal`
- `--font-sans`, `--font-serif`, `--font-mono`
- `--shadow-2xs` through `--shadow-2xl`

### No Custom Variables

No new CSS variables are invented beyond what tweakcn provides. If tweakcn doesn't define it, ClaimPilot doesn't use it.

### @theme inline Block

The Tailwind v4 bridge block maps CSS vars to Tailwind utilities. It is theme-agnostic (identical for all themes) and stays in `index.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... all token mappings ... */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --shadow-2xs: var(--shadow-2xs);
  /* ... all shadow mappings ... */
  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}
```

### What Gets Removed from index.css

- The `@theme` block with hardcoded hex color palette (`primary-50` through `primary-950`, `success-*`, `warning-*`, `danger-*`, `surface-*`, `text-*`, `border-strong`)
- The hardcoded gradient on `body`
- The bare `:root` / `.dark` blocks (replaced by theme-scoped equivalents)
- The `@fontsource-variable/geist` import (replaced by per-theme fonts)
- The `step-pulse` keyframe's hardcoded rgba color (uses theme variable instead)

### Fonts

Each theme declares its own `--font-sans` / `--font-mono` / `--font-serif`. Fonts are self-hosted via `@fontsource` packages:

- `@fontsource/outfit` (Supabase)
- `@fontsource/inter` (Clean Slate)
- Additional fonts as needed for the 4 remaining themes

## 2. Layout

### Current

```
TopNav (sticky horizontal, max-w-1400px)
  └─ Centered content (max-w-1400px, px-6 py-6)
```

### New

```
┌──────────────────────────────────────────────────┐
│ TopBar (h-10, full width, bg-card)               │
│ [Logo/Wordmark]            [Theme][Mode][User]   │
├────────────┬─────────────────────────────────────┤
│ Sidebar    │ Main content                        │
│ w-[220px]  │ flex-1, overflow-auto, p-6          │
│ bg-sidebar │ bg-background                       │
│            │                                     │
│ Claims     │                                     │
│ Dashboard  │                                     │
│ Contacts   │                                     │
│            │                                     │
│ ────────── │                                     │
│ v1.0  ●    │                                     │
└────────────┴─────────────────────────────────────┘
```

### AppShell (rewritten)

```tsx
<div className="flex flex-col h-screen">
  <TopBar />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-auto p-6 bg-background">
      <Outlet />
    </main>
  </div>
</div>
```

### Sidebar

Always-expanded single column. No collapse toggle.

- Width: `w-[220px]`
- Background: `bg-sidebar`
- Border: `border-r border-sidebar-border`
- Nav items: 3 (Claims, Dashboard, Contacts) with Lucide icons (FileText, LayoutDashboard, Users)
- Active state: `bg-sidebar-primary text-sidebar-primary-foreground font-medium`
- Hover state: `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`
- Inactive: `text-sidebar-foreground`
- Footer: version label (`text-[10px] font-bold uppercase tracking-widest text-muted-foreground`) + green pulse dot

### TopBar

Modeled after ACB's TopBar. Height `h-10`, `bg-card`, `border-b border-border`.

**Left side:**
- True Aim logo (`/trueaim-logo.png`) + wordmark (`/trueaim-wordmark.png`)
- Static display, no dropdown (single app — not an app switcher)

**Right side:**
- Dark mode toggle: 3 buttons (light/dark/system) in a `bg-muted` pill
- Theme picker: palette icon dropdown with 6 theme options
- Divider
- User menu: avatar circle + dropdown with name/role/sign-out

### Content Area

- No `max-w-[1400px]` constraint — content fills available width
- `flex-1 overflow-auto p-6`
- `bg-background` (solid color from theme, no gradient)

### Files

| File | Action |
|------|--------|
| `src/components/layout/app-shell.tsx` | Rewrite with new layout structure |
| `src/components/layout/top-nav.tsx` | Delete |
| `src/components/layout/sidebar.tsx` | New |
| `src/components/layout/top-bar.tsx` | New |
| `public/trueaim-logo.png` | Add (copy from ACB or provide) |
| `public/trueaim-wordmark.png` | Add (copy from ACB or provide) |

## 3. Component Restyling

All components migrate from hardcoded colors to semantic tokens. Zero functional changes — same props, same business logic, same state management.

### Color Token Migration

| Current (hardcoded) | New (semantic) |
|---|---|
| `bg-primary-50`, `bg-primary-100` | `bg-primary/10`, `bg-primary/20` |
| `text-primary-700`, `text-primary-600` | `text-primary` |
| `bg-white`, `bg-white/80` | `bg-card`, `bg-card/80` |
| `text-text-primary` | `text-foreground` |
| `text-text-secondary`, `text-text-muted` | `text-muted-foreground` |
| `bg-surface-secondary` | `bg-muted` |
| `border-border-strong` | `border-border` |
| Hardcoded hex in Recharts | `hsl(var(--chart-N))` |

### SLA Status Mapping

No custom `warning`/`success`/`info` tokens. Map to existing semantic tokens:

| SLA Status | Condition | Token pattern |
|---|---|---|
| Within SLA | <75% elapsed | `bg-primary/10 text-primary border-primary/30` |
| Approaching | 75–99% elapsed | `bg-accent text-accent-foreground` |
| Breached | >=100% elapsed | `bg-destructive/10 text-destructive border-destructive/30` |

### Step-Pulse Animation

Current keyframe uses hardcoded `rgba(14, 165, 233, 0.3)`. Replace with theme-aware color using `color-mix()` for broad browser support:

```css
@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--primary) 30%, transparent); }
  50% { box-shadow: 0 0 0 6px color-mix(in oklch, var(--primary) 0%, transparent); }
}
```

Note: `var(--primary)` contains raw oklch values. If `color-mix()` doesn't resolve correctly with the raw variable, fall back to applying the animation via a Tailwind `animate-pulse` utility on a wrapper element styled with `shadow-primary/30` instead.

### Recharts (Dashboard)

- `fill` / `stroke` props: `hsl(var(--chart-1))` through `hsl(var(--chart-5))`
- CartesianGrid: `stroke="hsl(var(--border))"`
- Axis ticks: `fill="hsl(var(--muted-foreground))"`
- Tooltip background: `hsl(var(--card))`
- Area chart gradients use `linearGradient` defs with `hsl(var(--chart-N))` stop colors

### Typography

- Font family handled by theme's `--font-sans` — no per-component font changes needed
- Font sizes and weights stay as-is
- Letter spacing inherits `var(--tracking-normal)` from body rule

### Component Areas Affected

1. **SLA indicators** — stepper, badges, status pills (most pervasive change)
2. **Claim detail page** — cards, tabs, sidebar panels
3. **Dashboard** — KPI cards, all Recharts components
4. **Claims list** — table rows, status badges, filter controls
5. **Action panels** — all workflow step components in `src/components/claims/actions/`
6. **Communication modals** — email draft display
7. **Contacts page** — contact cards

### What Stays Unchanged

- Component structure, props, business logic
- Workflow engine (`src/lib/workflow-engine.ts`)
- SLA computation logic
- State management (ClaimContext, ContactContext)
- Routing structure
- Seed data

## 4. Theme Provider & Dark Mode

### No External Library

Lightweight React context. No `next-themes`, no `@space-man/react-theme-animation`.

### Context API

```ts
interface ThemeContextValue {
  colorTheme: string                           // e.g. "supabase"
  setColorTheme: (theme: string) => void
  mode: 'light' | 'dark' | 'system'
  setMode: (mode: 'light' | 'dark' | 'system') => void
  resolvedMode: 'light' | 'dark'              // actual computed value
}
```

### Behavior

**Color theme:**
- Applies `.theme-{name}` class on `<html>`
- Persists to `localStorage` key `color-theme`
- Default: `supabase`

**Dark mode:**
- Applies/removes `.dark` class on `<html>`
- Persists to `localStorage` key `theme-mode`
- Default: `light`
- System mode: listens to `window.matchMedia('(prefers-color-scheme: dark)')` change events

### Flash Prevention

Inline `<script>` in `index.html`, runs before React hydrates:

```js
(function() {
  var theme = localStorage.getItem('color-theme') || 'supabase';
  var mode = localStorage.getItem('theme-mode') || 'light';
  var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.add('theme-' + theme);
  if (dark) document.documentElement.classList.add('dark');
})();
```

### Files

| File | Action |
|------|--------|
| `src/context/ThemeContext.tsx` | New — provider + `useTheme` hook |
| `src/main.tsx` | Wrap app with `ThemeProvider` |
| `index.html` | Add flash prevention script |

## 5. Assets

### Logo Files

Copy from ACB `public/` directory:
- `trueaim-logo.png`
- `trueaim-wordmark.png`

The wordmark needs `dark:brightness-0 dark:invert` treatment for dark mode visibility (same pattern as ACB).

### Font Packages

Install via npm:
- `@fontsource/outfit`
- `@fontsource/inter`
- Additional packages for 4 remaining themes

Import in `index.css`:
```css
@import '@fontsource/outfit/400.css';
@import '@fontsource/outfit/500.css';
@import '@fontsource/outfit/600.css';
@import '@fontsource/outfit/700.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
```
