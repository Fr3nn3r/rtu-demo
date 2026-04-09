# ACB Theme Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate ClaimPilot from its custom color palette to the ACB theme system — tweakcn-sourced themes, sidebar layout, TopBar, dark mode, and semantic tokens throughout.

**Architecture:** Replace the entire CSS variable system with tweakcn v4 theme exports scoped by `.theme-{name}` classes. Swap the top-nav layout for a sidebar + TopBar shell. Restyle every component to use only the semantic tokens that tweakcn provides (`bg-primary`, `text-muted-foreground`, `bg-destructive/10`, etc.). A lightweight ThemeContext manages theme/mode switching and persistence.

**Tech Stack:** React 19, Tailwind CSS v4, Vite 8, shadcn/ui (base-nova), @fontsource for self-hosted fonts, no external theme library.

**Spec:** `docs/superpowers/specs/2026-04-09-acb-theme-adoption-design.md`

---

## Token Migration Reference

Use this table for all restyling tasks. Every old class maps to exactly one new class:

### Surface / Text / Border

| Old | New |
|-----|-----|
| `bg-white` | `bg-card` |
| `bg-white/80` | `bg-card/80` |
| `bg-surface-secondary` | `bg-muted` |
| `text-text-primary` | `text-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-muted` | `text-muted-foreground` |
| `border-border-strong` | `border-border` |
| `hover:bg-surface-secondary` | `hover:bg-muted` |
| `hover:bg-surface-secondary/50` | `hover:bg-muted/50` |
| `hover:text-text-primary` | `hover:text-foreground` |

### Primary Shades

| Old | New |
|-----|-----|
| `bg-primary-50` | `bg-primary/10` |
| `bg-primary-50/50` | `bg-primary/5` |
| `bg-primary-50/30` | `bg-primary/5` |
| `bg-primary-100` | `bg-primary/15` |
| `border-primary-100` | `border-primary/15` |
| `border-primary-200` | `border-primary/20` |
| `border-primary-400` | `border-primary/50` |
| `border-primary-500` | `border-primary` |
| `text-primary-500` | `text-primary` |
| `text-primary-600` | `text-primary` |
| `text-primary-700` | `text-primary` |
| `bg-primary-500` | `bg-primary` |
| `ring-primary-400` | `ring-primary/50` |
| `hover:bg-primary-50` | `hover:bg-primary/10` |
| `hover:text-primary-600` | `hover:text-primary` |
| `hover:border-primary-400` | `hover:border-primary/50` |
| `hover:bg-primary-50/50` | `hover:bg-primary/5` |
| `hover:border-border-strong` | `hover:border-border` |

### SLA / Status Colors (mapped per spec)

**Within SLA / Completed / Success → primary:**

| Old | New |
|-----|-----|
| `bg-success-50` | `bg-primary/10` |
| `bg-success-50/50` | `bg-primary/5` |
| `bg-success-500` | `bg-primary` |
| `text-success-600` | `text-primary` |
| `text-success-700` | `text-primary` |
| `text-success-500` | `text-primary` |
| `border-success-500` | `border-primary` |
| `border-success-500/30` | `border-primary/30` |
| `border-success-200` | `border-primary/20` |
| `text-white` (on success bg) | `text-primary-foreground` |

**Approaching / Warning / Caution → accent:**

| Old | New |
|-----|-----|
| `bg-warning-50` | `bg-accent` |
| `bg-warning-50/50` | `bg-accent/50` |
| `bg-warning-50/40` | `bg-accent/40` |
| `bg-warning-500` | `bg-accent-foreground` |
| `text-warning-500` | `text-accent-foreground` |
| `text-warning-600` | `text-accent-foreground` |
| `text-warning-700` | `text-accent-foreground` |
| `border-warning-200` | `border-accent-foreground/20` |
| `border-warning-300` | `border-accent-foreground/30` |
| `border-warning-400` | `border-accent-foreground/50` |
| `border-warning-500/30` | `border-accent-foreground/30` |
| `text-white` (on warning bg) | `text-accent` |

**Breached / Danger / Error → destructive:**

| Old | New |
|-----|-----|
| `bg-danger-50` | `bg-destructive/10` |
| `bg-danger-50/40` | `bg-destructive/5` |
| `bg-danger-50/30` | `bg-destructive/5` |
| `bg-danger-500` | `bg-destructive` |
| `text-danger-600` | `text-destructive` |
| `text-danger-700` | `text-destructive` |
| `border-danger-200` | `border-destructive/20` |
| `border-danger-500/60` | `border-destructive/60` |
| `border-danger-500/30` | `border-destructive/30` |
| `text-white` (on danger bg) | `text-destructive-foreground` |

### Recharts

| Old | New |
|-----|-----|
| `fill="#0ea5e9"` | `fill="hsl(var(--chart-1))"` |
| `'#0ea5e9'` (PIE_COLORS[0]) | `'hsl(var(--chart-1))'` |
| `'#ef4444'` (PIE_COLORS[1]) | `'hsl(var(--chart-2))'` |
| `'#f59e0b'` (PIE_COLORS[2]) | `'hsl(var(--chart-3))'` |
| `'#22c55e'` (SLA within) | `'hsl(var(--chart-1))'` |
| `'#f59e0b'` (SLA approaching) | `'hsl(var(--chart-3))'` |
| `'#ef4444'` (SLA breached) | `'hsl(var(--chart-2))'` |

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/context/ThemeContext.tsx` | Theme + dark mode provider, `useTheme` hook |
| `src/components/layout/sidebar.tsx` | Always-expanded sidebar with 3 nav items |
| `src/components/layout/top-bar.tsx` | TopBar: logo, theme picker, dark mode toggle, user menu |

### Modified Files

| File | Change |
|------|--------|
| `index.html` | Remove Google Fonts CDN, add flash prevention script |
| `src/index.css` | Full rewrite: font imports, 6 theme definitions, @theme inline block, base layer |
| `src/main.tsx` | Wrap app in ThemeProvider |
| `src/App.tsx` | No changes (layout is in AppShell) |
| `src/components/layout/app-shell.tsx` | Rewrite: sidebar + TopBar + content layout |
| `src/components/claims/sla-banner.tsx` | Token migration |
| `src/components/claims/sla-indicator.tsx` | Token migration |
| `src/components/claims/status-badge.tsx` | Token migration |
| `src/components/claims/workflow-stepper.tsx` | Token migration |
| `src/components/claims/claim-type-badge.tsx` | Token migration |
| `src/components/claims/claim-header.tsx` | Token migration |
| `src/components/claims/bridge-step-banner.tsx` | Token migration |
| `src/components/claims/action-panel.tsx` | Token migration |
| `src/components/claims/mini-workflow-bar.tsx` | Token migration |
| `src/components/claims/draft-communication-modal.tsx` | Token migration |
| `src/components/claims/copyable-field.tsx` | Token migration |
| `src/components/claims/actions/appoint-contact.tsx` | Token migration |
| `src/components/claims/actions/assessment-received.tsx` | Token migration |
| `src/components/claims/actions/internal-approval.tsx` | Token migration |
| `src/components/claims/actions/closed.tsx` | Token migration |
| `src/components/claims/actions/inspection-costing.tsx` | Token migration |
| `src/components/claims/actions/investigation-received.tsx` | Token migration |
| `src/components/claims/actions/new-claim-review.tsx` | Token migration |
| `src/components/claims/actions/progress-status.tsx` | Token migration |
| `src/components/claims/actions/qa-decision.tsx` | Token migration |
| `src/components/claims/actions/radx-benchmark.tsx` | Token migration |
| `src/components/claims/actions/route-type.tsx` | Token migration |
| `src/components/claims/actions/within-excess.tsx` | Token migration |
| `src/components/claims/actions/aol-generated.tsx` | Token migration |
| `src/components/claims/panels/claim-details-panel.tsx` | Token migration |
| `src/components/claims/panels/audit-trail-panel.tsx` | Token migration |
| `src/components/claims/panels/communications-panel.tsx` | Token migration |
| `src/components/claims/panels/documents-panel.tsx` | Token migration |
| `src/pages/dashboard-page.tsx` | Token migration + Recharts colors |
| `src/pages/claims-list-page.tsx` | Token migration |
| `src/pages/claim-detail-page.tsx` | Token migration |
| `src/pages/contacts-page.tsx` | Token migration |

### Deleted Files

| File | Reason |
|------|--------|
| `src/components/layout/top-nav.tsx` | Replaced by sidebar.tsx + top-bar.tsx |

### Assets to Copy

| Source (ACB) | Destination (RTU) |
|-------------|-------------------|
| `AgenticContextBuilder/ui/public/trueaim-logo.png` | `rtu-demo/public/trueaim-logo.png` |
| `AgenticContextBuilder/ui/public/trueaim-wordmark.png` | `rtu-demo/public/trueaim-wordmark.png` |

---

## Task 1: Install Dependencies & Copy Assets

**Files:**
- Modify: `package.json`
- Copy: `public/trueaim-logo.png`, `public/trueaim-wordmark.png`

- [ ] **Step 1: Install font packages**

```bash
cd C:/Users/fbrun/Documents/GitHub/rtu-demo
npm install @fontsource/outfit @fontsource/inter
```

- [ ] **Step 2: Remove unused packages**

```bash
npm uninstall @fontsource-variable/geist next-themes
```

`next-themes` is replaced by our custom ThemeContext. `@fontsource-variable/geist` is replaced by `@fontsource/outfit` and `@fontsource/inter`.

- [ ] **Step 3: Copy logo assets from ACB**

```bash
cp C:/Users/fbrun/Documents/GitHub/AgenticContextBuilder/ui/public/trueaim-logo.png public/
cp C:/Users/fbrun/Documents/GitHub/AgenticContextBuilder/ui/public/trueaim-wordmark.png public/
```

- [ ] **Step 4: Verify assets exist**

```bash
ls -la public/trueaim-logo.png public/trueaim-wordmark.png
```

Expected: both files present.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json public/trueaim-logo.png public/trueaim-wordmark.png
git commit -m "chore: install theme fonts and copy True Aim logo assets"
```

---

## Task 2: Rewrite index.css with Theme System

**Files:**
- Rewrite: `src/index.css`

This is the foundation — all 6 themes defined here with light/dark variants, plus the shared @theme inline block and base layer.

- [ ] **Step 1: Rewrite index.css**

Replace the entire file with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* Self-hosted fonts */
@import "@fontsource/outfit/400.css";
@import "@fontsource/outfit/500.css";
@import "@fontsource/outfit/600.css";
@import "@fontsource/outfit/700.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";

@custom-variant dark (&:is(.dark *));

/* ═══════════════════════════════════════════════════════════
   THEME: Supabase (default)
   ═══════════════════════════════════════════════════════════ */
:root,
.theme-supabase {
  --background: oklch(0.9911 0 0);
  --foreground: oklch(0.2046 0 0);
  --card: oklch(0.9911 0 0);
  --card-foreground: oklch(0.2046 0 0);
  --popover: oklch(0.9911 0 0);
  --popover-foreground: oklch(0.4386 0 0);
  --primary: oklch(0.8348 0.1302 160.9080);
  --primary-foreground: oklch(0.2626 0.0147 166.4589);
  --secondary: oklch(0.9940 0 0);
  --secondary-foreground: oklch(0.2046 0 0);
  --muted: oklch(0.9461 0 0);
  --muted-foreground: oklch(0.2435 0 0);
  --accent: oklch(0.9461 0 0);
  --accent-foreground: oklch(0.2435 0 0);
  --destructive: oklch(0.5523 0.1927 32.7272);
  --destructive-foreground: oklch(0.9934 0.0032 17.2118);
  --border: oklch(0.9037 0 0);
  --input: oklch(0.9731 0 0);
  --ring: oklch(0.8348 0.1302 160.9080);
  --chart-1: oklch(0.8348 0.1302 160.9080);
  --chart-2: oklch(0.6231 0.1880 259.8145);
  --chart-3: oklch(0.6056 0.2189 292.7172);
  --chart-4: oklch(0.7686 0.1647 70.0804);
  --chart-5: oklch(0.6959 0.1491 162.4796);
  --sidebar: oklch(0.9911 0 0);
  --sidebar-foreground: oklch(0.5452 0 0);
  --sidebar-primary: oklch(0.8348 0.1302 160.9080);
  --sidebar-primary-foreground: oklch(0.2626 0.0147 166.4589);
  --sidebar-accent: oklch(0.9461 0 0);
  --sidebar-accent-foreground: oklch(0.2435 0 0);
  --sidebar-border: oklch(0.9037 0 0);
  --sidebar-ring: oklch(0.8348 0.1302 160.9080);
  --font-sans: Outfit, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
  --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
  --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
  --shadow-md: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 2px 4px -1px hsl(0 0% 0% / 0.17);
  --shadow-lg: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17);
  --shadow-xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17);
  --shadow-2xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.43);
  --tracking-normal: 0.025em;
  --spacing: 0.25rem;
}

.dark,
.theme-supabase .dark {
  --background: oklch(0.1822 0 0);
  --foreground: oklch(0.9288 0.0126 255.5078);
  --card: oklch(0.2046 0 0);
  --card-foreground: oklch(0.9288 0.0126 255.5078);
  --popover: oklch(0.2603 0 0);
  --popover-foreground: oklch(0.7348 0 0);
  --primary: oklch(0.4365 0.1044 156.7556);
  --primary-foreground: oklch(0.9213 0.0135 167.1556);
  --secondary: oklch(0.2603 0 0);
  --secondary-foreground: oklch(0.9851 0 0);
  --muted: oklch(0.2393 0 0);
  --muted-foreground: oklch(0.7122 0 0);
  --accent: oklch(0.3132 0 0);
  --accent-foreground: oklch(0.9851 0 0);
  --destructive: oklch(0.3123 0.0852 29.7877);
  --destructive-foreground: oklch(0.9368 0.0045 34.3092);
  --border: oklch(0.2809 0 0);
  --input: oklch(0.2603 0 0);
  --ring: oklch(0.8003 0.1821 151.7110);
  --chart-1: oklch(0.8003 0.1821 151.7110);
  --chart-2: oklch(0.7137 0.1434 254.6240);
  --chart-3: oklch(0.7090 0.1592 293.5412);
  --chart-4: oklch(0.8369 0.1644 84.4286);
  --chart-5: oklch(0.7845 0.1325 181.9120);
  --sidebar: oklch(0.1822 0 0);
  --sidebar-foreground: oklch(0.6301 0 0);
  --sidebar-primary: oklch(0.4365 0.1044 156.7556);
  --sidebar-primary-foreground: oklch(0.9213 0.0135 167.1556);
  --sidebar-accent: oklch(0.3132 0 0);
  --sidebar-accent-foreground: oklch(0.9851 0 0);
  --sidebar-border: oklch(0.2809 0 0);
  --sidebar-ring: oklch(0.8003 0.1821 151.7110);
}

/* ═══════════════════════════════════════════════════════════
   THEME: Clean Slate
   ═══════════════════════════════════════════════════════════ */
.theme-clean-slate {
  --background: oklch(0.9842 0.0034 247.8575);
  --foreground: oklch(0.2795 0.0368 260.0310);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.2795 0.0368 260.0310);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.2795 0.0368 260.0310);
  --primary: oklch(0.5854 0.2041 277.1173);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9276 0.0058 264.5313);
  --secondary-foreground: oklch(0.3729 0.0306 259.7328);
  --muted: oklch(0.9670 0.0029 264.5419);
  --muted-foreground: oklch(0.5510 0.0234 264.3637);
  --accent: oklch(0.9299 0.0334 272.7879);
  --accent-foreground: oklch(0.3729 0.0306 259.7328);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.8717 0.0093 258.3382);
  --input: oklch(0.8717 0.0093 258.3382);
  --ring: oklch(0.5854 0.2041 277.1173);
  --chart-1: oklch(0.5854 0.2041 277.1173);
  --chart-2: oklch(0.5106 0.2301 276.9656);
  --chart-3: oklch(0.4568 0.2146 277.0229);
  --chart-4: oklch(0.3984 0.1773 277.3662);
  --chart-5: oklch(0.3588 0.1354 278.6973);
  --sidebar: oklch(0.9670 0.0029 264.5419);
  --sidebar-foreground: oklch(0.2795 0.0368 260.0310);
  --sidebar-primary: oklch(0.5854 0.2041 277.1173);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.9299 0.0334 272.7879);
  --sidebar-accent-foreground: oklch(0.3729 0.0306 259.7328);
  --sidebar-border: oklch(0.8717 0.0093 258.3382);
  --sidebar-ring: oklch(0.5854 0.2041 277.1173);
  --font-sans: Inter, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.theme-clean-slate .dark {
  --background: oklch(0.2077 0.0398 265.7549);
  --foreground: oklch(0.9288 0.0126 255.5078);
  --card: oklch(0.2795 0.0368 260.0310);
  --card-foreground: oklch(0.9288 0.0126 255.5078);
  --popover: oklch(0.2795 0.0368 260.0310);
  --popover-foreground: oklch(0.9288 0.0126 255.5078);
  --primary: oklch(0.6801 0.1583 276.9349);
  --primary-foreground: oklch(0.2077 0.0398 265.7549);
  --secondary: oklch(0.3351 0.0331 260.9120);
  --secondary-foreground: oklch(0.8717 0.0093 258.3382);
  --muted: oklch(0.2427 0.0381 259.9437);
  --muted-foreground: oklch(0.7137 0.0192 261.3246);
  --accent: oklch(0.3729 0.0306 259.7328);
  --accent-foreground: oklch(0.8717 0.0093 258.3382);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(0.2077 0.0398 265.7549);
  --border: oklch(0.4461 0.0263 256.8018);
  --input: oklch(0.4461 0.0263 256.8018);
  --ring: oklch(0.6801 0.1583 276.9349);
  --chart-1: oklch(0.6801 0.1583 276.9349);
  --chart-2: oklch(0.5854 0.2041 277.1173);
  --chart-3: oklch(0.5106 0.2301 276.9656);
  --chart-4: oklch(0.4568 0.2146 277.0229);
  --chart-5: oklch(0.3984 0.1773 277.3662);
  --sidebar: oklch(0.2795 0.0368 260.0310);
  --sidebar-foreground: oklch(0.9288 0.0126 255.5078);
  --sidebar-primary: oklch(0.6801 0.1583 276.9349);
  --sidebar-primary-foreground: oklch(0.2077 0.0398 265.7549);
  --sidebar-accent: oklch(0.3729 0.0306 259.7328);
  --sidebar-accent-foreground: oklch(0.8717 0.0093 258.3382);
  --sidebar-border: oklch(0.4461 0.0263 256.8018);
  --sidebar-ring: oklch(0.6801 0.1583 276.9349);
}

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER: 4 more themes
   Grab from https://tweakcn.com/editor/theme in Tailwind v4 format
   and paste here using the same .theme-{name} / .theme-{name} .dark
   pattern. Add font imports at top of file if needed.
   ═══════════════════════════════════════════════════════════ */

/* @theme inline: maps CSS vars → Tailwind utilities (theme-agnostic) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: var(--tracking-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  html {
    @apply font-sans;
  }
}

@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, oklch(var(--primary)) 30%, transparent); }
  50% { box-shadow: 0 0 0 6px transparent; }
}
```

Note: The `step-pulse` keyframe uses `color-mix`. If this doesn't compile (because `var(--primary)` contains a bare oklch value, not a color), replace the keyframe with:

```css
@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.8348 0.1302 160.908 / 0.3); }
  50% { box-shadow: 0 0 0 6px transparent; }
}
```

This hardcodes the Supabase primary as a fallback for the animation only. It won't change per theme but is acceptable for a pulse effect.

- [ ] **Step 2: Verify Tailwind compiles**

```bash
npm run build
```

Expected: build succeeds (components will have broken classes that Tailwind will ignore — that's fine, we'll fix them in later tasks).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: rewrite index.css with tweakcn theme system (supabase + clean-slate)"
```

---

## Task 3: Clean Up index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove Google Fonts CDN and add flash prevention script**

Replace the full `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClaimPilot - RTU Insurance Services</title>
    <script>
      (function() {
        var theme = localStorage.getItem('color-theme') || 'supabase';
        var mode = localStorage.getItem('theme-mode') || 'light';
        var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.add('theme-' + theme);
        if (dark) document.documentElement.classList.add('dark');
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "fix: remove Google Fonts CDN, add theme flash prevention script"
```

---

## Task 4: Create ThemeContext

**Files:**
- Create: `src/context/ThemeContext.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create ThemeContext.tsx**

```tsx
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

export const THEMES = [
  { id: 'supabase', name: 'Supabase' },
  { id: 'clean-slate', name: 'Clean Slate' },
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

  // Apply classes to <html>
  useEffect(() => {
    const html = document.documentElement
    // Remove old theme classes
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

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

- [ ] **Step 2: Update main.tsx to wrap with ThemeProvider**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/context/ThemeContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/context/ThemeContext.tsx src/main.tsx
git commit -m "feat: add ThemeContext with color theme + dark mode switching"
```

---

## Task 5: Create Sidebar Component

**Files:**
- Create: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Create sidebar.tsx**

```tsx
import { NavLink } from 'react-router-dom'
import { FileText, LayoutDashboard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contacts', icon: Users },
]

export function Sidebar() {
  return (
    <div className="flex w-[220px] flex-col shrink-0 border-r border-sidebar-border bg-sidebar">
      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3 pt-3 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
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
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add sidebar component with nav items and footer"
```

---

## Task 6: Create TopBar Component

**Files:**
- Create: `src/components/layout/top-bar.tsx`

- [ ] **Step 1: Create top-bar.tsx**

```tsx
import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Palette, Check, ChevronDown, LogOut } from 'lucide-react'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

/* ── Dark mode toggle ─────────────────────────────────────── */

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

/* ── Theme picker ─────────────────────────────────────────── */

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

/* ── User menu ────────────────────────────────────────────── */

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

/* ── TopBar ───────────────────────────────────────────────── */

export function TopBar() {
  return (
    <div className="h-10 bg-card border-b border-border px-3 pt-px flex items-center justify-between z-20 shrink-0">
      {/* Left: logo */}
      <div className="inline-flex items-center gap-1.5 h-7 px-1.5">
        <img src="/trueaim-logo.png" alt="True Aim" className="h-5 w-5 object-contain shrink-0" />
        <img src="/trueaim-wordmark.png" alt="True Aim" className="h-[11px] object-contain shrink-0 dark:brightness-0 dark:invert opacity-80" />
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">
        <DarkModeToggle />
        <ThemePicker />
        <div className="w-px h-4 bg-border" />
        <UserMenu />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/top-bar.tsx
git commit -m "feat: add TopBar with theme picker, dark mode toggle, user menu"
```

---

## Task 7: Rewrite AppShell & Delete TopNav

**Files:**
- Rewrite: `src/components/layout/app-shell.tsx`
- Delete: `src/components/layout/top-nav.tsx`

- [ ] **Step 1: Rewrite app-shell.tsx**

```tsx
import { Outlet } from 'react-router-dom'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete top-nav.tsx**

```bash
rm src/components/layout/top-nav.tsx
```

- [ ] **Step 3: Verify dev server renders**

```bash
npm run dev
```

Open `http://localhost:5173` — verify sidebar and TopBar render. Content pages will have broken colors (expected — fixed in next tasks).

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/app-shell.tsx
git rm src/components/layout/top-nav.tsx
git commit -m "feat: replace top-nav with sidebar + TopBar layout"
```

---

## Task 8: Restyle Shared Claim Components

**Files:**
- Modify: `src/components/claims/sla-banner.tsx`
- Modify: `src/components/claims/sla-indicator.tsx`
- Modify: `src/components/claims/status-badge.tsx`
- Modify: `src/components/claims/workflow-stepper.tsx`
- Modify: `src/components/claims/claim-type-badge.tsx`
- Modify: `src/components/claims/claim-header.tsx`
- Modify: `src/components/claims/bridge-step-banner.tsx`
- Modify: `src/components/claims/action-panel.tsx`
- Modify: `src/components/claims/mini-workflow-bar.tsx`
- Modify: `src/components/claims/draft-communication-modal.tsx`
- Modify: `src/components/claims/copyable-field.tsx`

Apply the Token Migration Reference table. Every change is a class name swap — no structural changes.

- [ ] **Step 1: Restyle sla-banner.tsx**

Full replacement:

```tsx
import type { Claim } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'

export function SlaBanner({ claim }: { claim: Claim }) {
  const sla = getClaimSLAStatus(claim)

  if (!sla || !sla.isActive) return null

  if (sla.status === 'breached') {
    return (
      <div className="animate-pulse rounded-lg border-2 border-destructive/60 bg-destructive/10 px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-destructive uppercase tracking-wide">SLA Breached</div>
          <p className="text-sm text-destructive">{sla.timeRemaining} — immediate action required</p>
        </div>
      </div>
    )
  }

  if (sla.status === 'approaching') {
    return (
      <div className="rounded-lg border border-accent-foreground/30 bg-accent px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-accent-foreground text-accent">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-accent-foreground">SLA Approaching</div>
          <p className="text-sm text-accent-foreground">{sla.timeRemaining} remaining — act now</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex items-center gap-3">
      <Clock className="size-4 text-primary" />
      <span className="text-sm text-primary">SLA: {sla.timeRemaining} remaining</span>
    </div>
  )
}
```

- [ ] **Step 2: Restyle sla-indicator.tsx**

```tsx
import type { Claim } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'

const statusStyles = {
  within: 'bg-primary/10 text-primary border-primary/30',
  approaching: 'bg-accent text-accent-foreground border-accent-foreground/30',
  breached: 'bg-destructive/10 text-destructive border-destructive/30',
}

const statusIcons = {
  within: Clock,
  approaching: AlertTriangle,
  breached: AlertCircle,
}

export function SlaIndicator({ claim, className }: { claim: Claim; className?: string }) {
  const sla = getClaimSLAStatus(claim)

  if (!sla || !sla.isActive) return null

  const Icon = statusIcons[sla.status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
      statusStyles[sla.status],
      sla.status === 'breached' && 'animate-pulse font-bold',
      className,
    )}>
      <Icon className="size-3" />
      {sla.timeRemaining}
    </span>
  )
}
```

- [ ] **Step 3: Restyle status-badge.tsx**

```tsx
import type { WorkflowState } from '@/types'
import { stateLabels } from '@/data/workflow-definitions'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className }: { status: WorkflowState; className?: string }) {
  const isClosed = status === 'CLOSED'
  const isRejected = status === 'REJECTED' || status === 'INVALID'

  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      isClosed && 'bg-primary/10 text-primary border-primary/30',
      isRejected && 'bg-destructive/10 text-destructive border-destructive/30',
      !isClosed && !isRejected && 'bg-muted text-muted-foreground border-border',
      className,
    )}>
      {stateLabels[status]}
    </span>
  )
}
```

- [ ] **Step 4: Restyle workflow-stepper.tsx**

```tsx
import { Fragment } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import type { Claim } from '@/types'
import { getStepperSteps, type StepperStep } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'

export function WorkflowStepper({ claim }: { claim: Claim }) {
  const steps = getStepperSteps(claim)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start min-w-max">
        {steps.map((step, i) => (
          <Fragment key={step.definition.state}>
            <StepNode step={step} />
            {i < steps.length - 1 && (
              <div className={cn(
                'mt-4 h-0.5 min-w-[24px] flex-1',
                step.status === 'completed' ? 'bg-primary' : 'bg-border',
              )} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function StepNode({ step }: { step: StepperStep }) {
  const { definition, status, stepNumber } = step
  const isBridge = definition.isBridgeStep

  return (
    <div className="flex flex-col items-center" style={{ minWidth: 72 }}>
      {/* Circle */}
      <div className="relative">
        <div className={cn(
          'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
          status === 'completed' && 'border-primary bg-primary text-primary-foreground',
          status === 'current' && 'border-primary bg-primary text-primary-foreground animate-[step-pulse_2s_infinite]',
          status === 'upcoming' && 'border-border bg-card text-muted-foreground',
        )}>
          {status === 'completed' ? (
            <Check className="size-4" />
          ) : (
            stepNumber
          )}
        </div>
        {isBridge && status !== 'completed' && (
          <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ExternalLink className="size-2.5" />
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        'mt-1.5 max-w-[72px] text-center text-[11px] leading-tight',
        status === 'current' ? 'font-semibold text-primary' : 'text-muted-foreground',
      )}>
        {definition.shortLabel}
      </span>
    </div>
  )
}
```

- [ ] **Step 5: Restyle claim-type-badge.tsx**

```tsx
import type { ClaimType } from '@/types'
import { cn } from '@/lib/utils'

const typeStyles: Record<ClaimType, string> = {
  accident: 'bg-primary/10 text-primary border-primary/20',
  theft: 'bg-destructive/10 text-destructive border-destructive/20',
  glass: 'bg-accent text-accent-foreground border-accent-foreground/20',
}

const typeLabels: Record<ClaimType, string> = {
  accident: 'Accident',
  theft: 'Theft',
  glass: 'Glass',
}

export function ClaimTypeBadge({ type, className }: { type: ClaimType; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      typeStyles[type],
      className,
    )}>
      {typeLabels[type]}
    </span>
  )
}
```

- [ ] **Step 6: Restyle claim-header.tsx**

```tsx
import { Link } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import type { Claim } from '@/types'
import { ClaimTypeBadge } from './claim-type-badge'
import { StatusBadge } from './status-badge'
import { SlaIndicator } from './sla-indicator'
import { format } from 'date-fns'

export function ClaimHeader({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-2">
      <Link
        to="/claims"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Claims
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold">
                {claim.workflow.spmClaimNumber || claim.id}
              </h1>
              {claim.workflow.spmClaimNumber && (
                <span className="text-xs text-muted-foreground">{claim.id}</span>
              )}
            </div>
            <ClaimTypeBadge type={claim.type} />
            <StatusBadge status={claim.status} />
            <SlaIndicator claim={claim} />
          </div>
          <p className="text-sm text-muted-foreground">
            {claim.insured.name} — {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model} ({claim.vehicle.registration})
          </p>
        </div>

        <div className="text-right text-sm text-muted-foreground space-y-0.5">
          <div className="flex items-center justify-end gap-1.5">
            <User className="size-3.5" />
            <span>{claim.assignedTo}</span>
          </div>
          <div>Created: {format(new Date(claim.createdAt), 'dd MMM yyyy, HH:mm')}</div>
          <div>Updated: {format(new Date(claim.updatedAt), 'dd MMM yyyy, HH:mm')}</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Restyle bridge-step-banner.tsx**

```tsx
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BridgeStepBannerProps {
  system: 'nimbis' | 'roc'
  instruction: string
  className?: string
}

const systemNames = {
  nimbis: 'Nimbis',
  roc: 'ROC',
}

export function BridgeStepBanner({ system, instruction, className }: BridgeStepBannerProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border-l-4 border-l-primary/50 bg-primary/5 px-4 py-3',
      className,
    )}>
      <ExternalLink className="mt-0.5 size-4 flex-shrink-0 text-primary" />
      <div>
        <div className="text-xs font-semibold text-primary uppercase tracking-wide">
          Bridge Step — {systemNames[system]}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{instruction}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Restyle action-panel.tsx**

Replace only the class strings — keep all imports and logic identical:

- Line 38: `bg-white` → `bg-card`
- Line 43: `text-text-muted` → `text-muted-foreground`
- Line 47: `text-text-muted hover:text-text-primary` → `text-muted-foreground hover:text-foreground`
- Line 139: `text-text-muted` → `text-muted-foreground`

- [ ] **Step 9: Restyle mini-workflow-bar.tsx**

- Line 21: `bg-success-500` → `bg-primary`
- Line 22: `bg-primary-500` → `bg-primary`
- Line 23: `bg-border-strong` → `bg-border`

- [ ] **Step 10: Restyle draft-communication-modal.tsx**

- Line 47: `bg-success-50` → `bg-primary/10`, `text-success-700` → `text-primary`
- Line 57: `bg-surface-secondary` → `bg-muted`
- Line 59: `text-text-muted` → `text-muted-foreground`
- Line 66: `text-text-muted` → `text-muted-foreground`
- Line 74: `text-text-muted` → `text-muted-foreground`
- Line 78: `text-success-600` → `text-primary`
- Line 86: `bg-white` → `bg-card`
- Line 87: `text-text-primary` → `text-foreground`
- Line 95: `text-text-muted` → `text-muted-foreground`

- [ ] **Step 11: Restyle copyable-field.tsx**

- Line 23: `bg-surface-secondary` → `bg-muted`
- Line 25: `text-text-muted` → `text-muted-foreground`
- Line 26: `text-text-primary` → `text-foreground`
- Line 31: `text-text-muted hover:bg-primary-50 hover:text-primary-600` → `text-muted-foreground hover:bg-primary/10 hover:text-primary`
- Line 34: `text-success-600` → `text-primary`

- [ ] **Step 12: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 13: Commit**

```bash
git add src/components/claims/
git commit -m "refactor: restyle shared claim components with semantic tokens"
```

---

## Task 9: Restyle Action Components

**Files:** All 15 files in `src/components/claims/actions/`

Apply Token Migration Reference to every file. Each file is small (20-75 lines). The changes are purely class name swaps.

- [ ] **Step 1: Restyle all action components**

Apply these substitutions across all files in `src/components/claims/actions/`:

| Find | Replace |
|------|---------|
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-muted` | `text-muted-foreground` |
| `text-text-primary` | `text-foreground` |
| `bg-surface-secondary` | `bg-muted` |
| `hover:bg-surface-secondary` | `hover:bg-muted` |
| `border-primary-200` | `border-primary/20` |
| `border-primary-100` | `border-primary/15` |
| `border-primary-400` | `border-primary/50` |
| `bg-primary-50/50` | `bg-primary/5` |
| `bg-primary-50/30` | `bg-primary/5` |
| `bg-primary-50` | `bg-primary/10` |
| `bg-primary-100` | `bg-primary/15` |
| `text-primary-500` | `text-primary` |
| `text-primary-600` | `text-primary` |
| `text-primary-700` | `text-primary` |
| `ring-primary-400` | `ring-primary/50` |
| `border-success-500/30` | `border-primary/30` |
| `border-success-200` | `border-primary/20` |
| `bg-success-50` | `bg-primary/10` |
| `bg-success-50/50` | `bg-primary/5` |
| `text-success-600` | `text-primary` |
| `text-success-700` | `text-primary` |
| `text-success-500` | `text-primary` |
| `text-danger-700` | `text-destructive` |
| `text-danger-600` | `text-destructive` |
| `text-warning-500` | `text-accent-foreground` |
| `text-warning-600` | `text-accent-foreground` |
| `border-warning-400` | `border-accent-foreground/50` |
| `bg-warning-50/50` | `bg-accent/50` |
| `hover:border-primary-400` | `hover:border-primary/50` |
| `hover:bg-primary-50/50` | `hover:bg-primary/5` |
| `hover:border-border-strong` | `hover:border-border` |
| `border-border-strong` | `border-border` |

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/actions/
git commit -m "refactor: restyle action components with semantic tokens"
```

---

## Task 10: Restyle Panel Components

**Files:**
- Modify: `src/components/claims/panels/claim-details-panel.tsx`
- Modify: `src/components/claims/panels/audit-trail-panel.tsx`
- Modify: `src/components/claims/panels/communications-panel.tsx`
- Modify: `src/components/claims/panels/documents-panel.tsx`

- [ ] **Step 1: Apply token migration to all 4 panel files**

Same substitution table as Task 9. Key patterns in panels:

| Find | Replace |
|------|---------|
| `text-text-muted` | `text-muted-foreground` |
| `text-text-primary` | `text-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `hover:text-text-primary` | `hover:text-foreground` |
| `bg-surface-secondary` | `bg-muted` |
| `hover:bg-surface-secondary` | `hover:bg-muted` |
| `text-success-600` | `text-primary` |
| `text-warning-600` | `text-accent-foreground` |

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/claims/panels/
git commit -m "refactor: restyle panel components with semantic tokens"
```

---

## Task 11: Restyle Pages

**Files:**
- Modify: `src/pages/dashboard-page.tsx`
- Modify: `src/pages/claims-list-page.tsx`
- Modify: `src/pages/claim-detail-page.tsx`
- Modify: `src/pages/contacts-page.tsx`

- [ ] **Step 1: Restyle dashboard-page.tsx**

Replace hex color constants at lines 17-18:

```tsx
const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']
const SLA_COLORS: Record<SLAStatus, string> = {
  within: 'hsl(var(--chart-1))',
  approaching: 'hsl(var(--chart-3))',
  breached: 'hsl(var(--chart-2))',
}
```

Replace the Bar fill at line 132:

```tsx
<Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
```

Replace the StatCard `colorMap` (lines 303-308):

```tsx
const colorMap = {
  primary: 'bg-primary/10 text-primary',
  danger: 'bg-destructive/10 text-destructive',
  success: 'bg-primary/10 text-primary',
  warning: 'bg-accent text-accent-foreground',
}
```

Apply standard substitutions throughout the file:

| Find | Replace |
|------|---------|
| `bg-white` | `bg-card` |
| `bg-surface-secondary` | `bg-muted` |
| `text-text-muted` | `text-muted-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-primary` | `text-foreground` |
| `bg-danger-50` | `bg-destructive/10` |
| `bg-danger-50/30` | `bg-destructive/5` |
| `text-danger-600` | `text-destructive` |
| `text-danger-700` | `text-destructive` |
| `border-danger-200` | `border-destructive/20` |
| `bg-danger-500` | `bg-destructive` |
| `text-primary-600` | `text-primary` |
| `text-primary-700` | `text-primary` |

- [ ] **Step 2: Restyle claims-list-page.tsx**

Apply standard substitutions:

| Find | Replace |
|------|---------|
| `bg-white` | `bg-card` |
| `bg-surface-secondary` | `bg-muted` |
| `hover:bg-surface-secondary/50` | `hover:bg-muted/50` |
| `text-text-muted` | `text-muted-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-primary` | `text-foreground` |
| `hover:text-text-primary` | `hover:text-foreground` |
| `border-primary-500` | `border-primary` |
| `text-primary-700` | `text-primary` |
| `text-primary-600` | `text-primary` |
| `bg-danger-50/40` | `bg-destructive/5` |
| `bg-warning-50/40` | `bg-accent/40` |

- [ ] **Step 3: Restyle claim-detail-page.tsx**

| Find | Replace |
|------|---------|
| `bg-white` | `bg-card` |
| `bg-warning-500` | `bg-accent-foreground` |
| `bg-primary-500` | `bg-primary` |

- [ ] **Step 4: Restyle contacts-page.tsx**

| Find | Replace |
|------|---------|
| `bg-white` | `bg-card` |
| `text-text-muted` | `text-muted-foreground` |
| `bg-primary-50` | `bg-primary/10` |
| `text-primary-600` | `text-primary` |

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds with zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/
git commit -m "refactor: restyle all pages with semantic tokens and chart colors"
```

---

## Task 12: Final Verification & Cleanup

- [ ] **Step 1: Search for any remaining old tokens**

```bash
cd C:/Users/fbrun/Documents/GitHub/rtu-demo
grep -rn "primary-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -rn "success-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -rn "warning-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -rn "danger-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -rn "surface-" src/ --include="*.tsx" --include="*.ts"
grep -rn "text-text-" src/ --include="*.tsx" --include="*.ts"
grep -rn "border-strong" src/ --include="*.tsx" --include="*.ts"
```

Expected: zero matches. If any remain, fix them using the Token Migration Reference.

- [ ] **Step 2: Search for remaining hardcoded hex colors**

```bash
grep -rn "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx" --include="*.ts"
```

Expected: zero matches.

- [ ] **Step 3: Full build check**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 4: Visual smoke test**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Sidebar renders with 3 nav items, active highlighting works
- TopBar shows True Aim logo, theme picker, dark mode toggle, user menu
- Switch to Clean Slate theme — colors change
- Toggle dark mode — all surfaces invert
- Claims list page renders with proper colors
- Click into a claim — stepper, SLA banner, action panel all themed
- Dashboard charts use theme-aware colors
- Contacts page renders properly

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: clean up remaining hardcoded colors after theme migration"
```
