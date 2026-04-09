# Dashboard Historical Trends Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add realistic RTU-shaped historical data and a "Portfolio Trends" section with 1W/1M/1Y time switcher controlling 6 trend charts to the ClaimPilot dashboard.

**Architecture:** A new `HistoricalClaim` type and ~400 seed records in `src/data/seed-historical-claims.ts`, filtered and aggregated by utility functions in `src/lib/trend-utils.ts`. The dashboard page gets a new Zone 2 section with a button-based period toggle and 6 Recharts trend charts. Live operations (Zone 1) are unchanged.

**Tech Stack:** React 19, TypeScript, Recharts 3.8, Tailwind CSS v4, shadcn/ui Card, date-fns

**Spec:** `docs/superpowers/specs/2026-04-09-dashboard-historical-trends-design.md`

---

### Task 1: Add HistoricalClaim Type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add types to the end of the types file**

Add before the `ClaimAction` type at line 252:

```ts
// ── Historical Claim (for trend charts) ─────────────────────
export type HistoricalClaimStatus = 'settled' | 'rejected' | 'not_taken_up' | 'within_excess' | 'no_cover' | 'open'

export type TimePeriod = '1W' | '1M' | '1Y'

export interface HistoricalClaim {
  id: string
  type: ClaimType
  createdAt: string
  closedAt: string | null
  daysToClose: number | null
  settlementAmount: number
  handler: string
  province: string
  status: HistoricalClaimStatus
  slaCompliant: boolean
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add HistoricalClaim and TimePeriod types"
```

---

### Task 2: Generate Historical Seed Data

**Files:**
- Create: `src/data/seed-historical-claims.ts`

This file generates ~400 `HistoricalClaim` records procedurally at module load using distribution tables from the real RTU SQL dump. Records are spread across the past 12 months from the current date.

- [ ] **Step 1: Create the seed data generator**

Create `src/data/seed-historical-claims.ts`:

```ts
import type { ClaimType, HistoricalClaim, HistoricalClaimStatus } from '@/types'

// ── Distribution tables (from RTU SQL dump of 1,000 claims) ──

const TYPE_WEIGHTS: { type: ClaimType; weight: number }[] = [
  { type: 'glass', weight: 0.52 },
  { type: 'accident', weight: 0.47 },
  { type: 'theft', weight: 0.01 },
]

const HANDLER_WEIGHTS = [
  { name: 'Nombuso Ncube', weight: 0.40 },
  { name: 'Shanaaz Smith', weight: 0.20 },
  { name: 'Nikki Pearmain', weight: 0.14 },
  { name: 'Gizela Dlodlo', weight: 0.12 },
  { name: 'Saira Quinn', weight: 0.06 },
  { name: 'S Naidoo', weight: 0.04 },
  { name: 'S M Zulu', weight: 0.04 },
]

const PROVINCE_WEIGHTS = [
  { name: 'KwaZulu-Natal', weight: 0.45 },
  { name: 'Gauteng', weight: 0.20 },
  { name: 'Western Cape', weight: 0.20 },
  { name: 'Eastern Cape', weight: 0.15 },
]

const STATUS_WEIGHTS: { status: HistoricalClaimStatus; weight: number }[] = [
  { status: 'settled', weight: 0.90 },
  { status: 'not_taken_up', weight: 0.05 },
  { status: 'rejected', weight: 0.02 },
  { status: 'within_excess', weight: 0.01 },
  { status: 'no_cover', weight: 0.01 },
  { status: 'open', weight: 0.01 },
]

// Average settlement by type (ZAR)
const AVG_SETTLEMENT: Record<ClaimType, number> = {
  accident: 55000,
  glass: 1500,
  theft: 40000,
}

// Average days to close by type
const AVG_DAYS_TO_CLOSE: Record<ClaimType, number> = {
  accident: 21,
  glass: 5,
  theft: 35,
}

// ── Seeded pseudo-random (deterministic output) ──────────────

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function weightedPick<T>(items: { weight: number }[] & T[], rand: () => number): T {
  const r = rand()
  let cumulative = 0
  for (const item of items) {
    cumulative += item.weight
    if (r <= cumulative) return item
  }
  return items[items.length - 1]
}

function gaussianRandom(rand: () => number, mean: number, stddev: number): number {
  const u1 = rand()
  const u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2)
  return Math.max(0, mean + z * stddev)
}

// ── Generator ────────────────────────────────────────────────

function generateHistoricalClaims(): HistoricalClaim[] {
  const rand = seededRandom(42)
  const now = new Date()
  const claims: HistoricalClaim[] = []
  const TOTAL_MONTHS = 12
  const BASE_MONTHLY_VOLUME = 90

  for (let monthOffset = TOTAL_MONTHS - 1; monthOffset >= 0; monthOffset--) {
    // Vary volume: 80-100 per month
    const monthVolume = Math.round(BASE_MONTHLY_VOLUME + (rand() - 0.5) * 40)

    for (let i = 0; i < monthVolume; i++) {
      const { type } = weightedPick(TYPE_WEIGHTS, rand)
      const { name: handler } = weightedPick(HANDLER_WEIGHTS, rand)
      const { name: province } = weightedPick(PROVINCE_WEIGHTS, rand)
      const { status } = weightedPick(STATUS_WEIGHTS, rand)

      // Random day within the month
      const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0)
      const dayRange = monthEnd.getDate()
      const day = Math.min(Math.floor(rand() * dayRange) + 1, dayRange)
      const createdAt = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)

      // Days to close (gaussian around type average)
      const isClosed = status !== 'open'
      const daysToClose = isClosed
        ? Math.round(gaussianRandom(rand, AVG_DAYS_TO_CLOSE[type], AVG_DAYS_TO_CLOSE[type] * 0.4))
        : null

      // Closed date
      const closedAt = isClosed && daysToClose !== null
        ? new Date(createdAt.getTime() + daysToClose * 24 * 60 * 60 * 1000)
        : null

      // Settlement amount (gaussian around type average, 0 for non-settled)
      const hasPayout = status === 'settled'
      const settlementAmount = hasPayout
        ? Math.round(gaussianRandom(rand, AVG_SETTLEMENT[type], AVG_SETTLEMENT[type] * 0.3))
        : 0

      // SLA compliance (~80% compliant)
      const slaCompliant = isClosed ? rand() < 0.80 : false

      claims.push({
        id: `HC-${String(claims.length + 1).padStart(4, '0')}`,
        type,
        createdAt: createdAt.toISOString(),
        closedAt: closedAt?.toISOString() ?? null,
        daysToClose,
        settlementAmount,
        handler,
        province,
        status,
        slaCompliant,
      })
    }
  }

  return claims
}

export const historicalClaims: HistoricalClaim[] = generateHistoricalClaims()
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/seed-historical-claims.ts
git commit -m "feat: add ~400 RTU-shaped historical seed claims"
```

---

### Task 3: Create Trend Utility Functions

**Files:**
- Create: `src/lib/trend-utils.ts`

Filtering, bucketing, and per-chart aggregation helpers.

- [ ] **Step 1: Create the utilities file**

Create `src/lib/trend-utils.ts`:

```ts
import { subDays, subMonths, format, startOfDay, startOfMonth, isAfter } from 'date-fns'
import type { ClaimType, HistoricalClaim, TimePeriod } from '@/types'

// ── Filtering ────────────────────────────────────────────────

export function filterByPeriod(
  claims: HistoricalClaim[],
  period: TimePeriod,
  dateField: 'createdAt' | 'closedAt' = 'createdAt',
): HistoricalClaim[] {
  const now = new Date()
  const cutoff =
    period === '1W' ? subDays(now, 7) :
    period === '1M' ? subMonths(now, 1) :
    subMonths(now, 12)

  return claims.filter(c => {
    const val = c[dateField]
    if (!val) return false
    return isAfter(new Date(val), cutoff)
  })
}

// ── Bucketing ────────────────────────────────────────────────

export type BucketLabel = string

function getBucketKey(date: Date, period: TimePeriod): BucketLabel {
  if (period === '1Y') return format(startOfMonth(date), 'MMM yyyy')
  return format(startOfDay(date), 'dd MMM')
}

function generateBucketKeys(period: TimePeriod): BucketLabel[] {
  const now = new Date()
  const keys: BucketLabel[] = []

  if (period === '1Y') {
    for (let i = 11; i >= 0; i--) {
      keys.push(format(subMonths(now, i), 'MMM yyyy'))
    }
  } else {
    const days = period === '1W' ? 7 : 30
    for (let i = days - 1; i >= 0; i--) {
      keys.push(format(subDays(now, i), 'dd MMM'))
    }
  }
  return keys
}

// ── Chart aggregators ────────────────────────────────────────

/** Chart 1: Claims volume per bucket */
export function aggregateVolume(claims: HistoricalClaim[], period: TimePeriod) {
  const buckets = Object.fromEntries(generateBucketKeys(period).map(k => [k, 0]))
  claims.forEach(c => {
    const key = getBucketKey(new Date(c.createdAt), period)
    if (key in buckets) buckets[key]++
  })
  return Object.entries(buckets).map(([label, count]) => ({ label, count }))
}

/** Chart 2: Claims by type per bucket (stacked) */
export function aggregateByType(claims: HistoricalClaim[], period: TimePeriod) {
  const keys = generateBucketKeys(period)
  const buckets: Record<string, Record<ClaimType, number>> = {}
  keys.forEach(k => { buckets[k] = { accident: 0, theft: 0, glass: 0 } })

  claims.forEach(c => {
    const key = getBucketKey(new Date(c.createdAt), period)
    if (key in buckets) buckets[key][c.type]++
  })

  return keys.map(label => ({ label, ...buckets[label] }))
}

/** Chart 3: Average days to close per bucket, per type */
export function aggregateAvgClose(claims: HistoricalClaim[], period: TimePeriod) {
  const keys = generateBucketKeys(period)
  const buckets: Record<string, Record<ClaimType, number[]>> = {}
  keys.forEach(k => { buckets[k] = { accident: [], theft: [], glass: [] } })

  claims.forEach(c => {
    if (!c.closedAt || c.daysToClose === null) return
    const key = getBucketKey(new Date(c.closedAt), period)
    if (key in buckets) buckets[key][c.type].push(c.daysToClose)
  })

  return keys.map(label => {
    const b = buckets[label]
    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, v) => a + v, 0) / arr.length * 10) / 10 : null
    return { label, accident: avg(b.accident), theft: avg(b.theft), glass: avg(b.glass) }
  })
}

/** Chart 4: Total settlement amounts per bucket */
export function aggregateSettlements(claims: HistoricalClaim[], period: TimePeriod) {
  const keys = generateBucketKeys(period)
  const buckets = Object.fromEntries(keys.map(k => [k, 0]))

  claims.forEach(c => {
    if (!c.closedAt) return
    const key = getBucketKey(new Date(c.closedAt), period)
    if (key in buckets) buckets[key] += c.settlementAmount
  })

  return keys.map(label => ({ label, amount: buckets[label] }))
}

/** Chart 5: SLA compliance rate per bucket (%) */
export function aggregateSlaCompliance(claims: HistoricalClaim[], period: TimePeriod) {
  const keys = generateBucketKeys(period)
  const buckets: Record<string, { compliant: number; total: number }> = {}
  keys.forEach(k => { buckets[k] = { compliant: 0, total: 0 } })

  claims.forEach(c => {
    if (!c.closedAt) return
    const key = getBucketKey(new Date(c.closedAt), period)
    if (key in buckets) {
      buckets[key].total++
      if (c.slaCompliant) buckets[key].compliant++
    }
  })

  return keys.map(label => {
    const b = buckets[label]
    return { label, rate: b.total > 0 ? Math.round(b.compliant / b.total * 100) : null }
  })
}

/** Chart 6: Handler workload per bucket (stacked) */
export function aggregateHandlerWorkload(claims: HistoricalClaim[], period: TimePeriod) {
  const keys = generateBucketKeys(period)

  // Collect unique handlers
  const handlerSet = new Set<string>()
  claims.forEach(c => handlerSet.add(c.handler))
  const handlers = Array.from(handlerSet).sort()

  const buckets: Record<string, Record<string, number>> = {}
  keys.forEach(k => {
    buckets[k] = Object.fromEntries(handlers.map(h => [h, 0]))
  })

  claims.forEach(c => {
    const key = getBucketKey(new Date(c.createdAt), period)
    if (key in buckets) buckets[key][c.handler]++
  })

  return {
    handlers,
    data: keys.map(label => ({ label, ...buckets[label] })),
  }
}

/** Format ZAR amounts for axis labels */
export function formatZAR(value: number): string {
  if (value >= 1_000_000) return `R ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R ${Math.round(value / 1_000)}k`
  return `R ${value}`
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/trend-utils.ts
git commit -m "feat: add trend filtering and aggregation utilities"
```

---

### Task 4: Add Portfolio Trends Section to Dashboard

**Files:**
- Modify: `src/pages/dashboard-page.tsx`

Add Zone 2 below the existing dashboard content: a "Portfolio Trends" header with time period toggle, and 6 trend chart cards in a 2-column grid.

- [ ] **Step 1: Add imports**

At the top of `src/pages/dashboard-page.tsx`, add to the existing Recharts import and add new imports:

Replace the existing recharts import:
```ts
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
```

With:
```ts
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, LineChart, Line, ReferenceLine,
} from 'recharts'
```

Add these new imports below the existing ones:
```ts
import { useState, useMemo } from 'react'
import { historicalClaims } from '@/data/seed-historical-claims'
import {
  filterByPeriod,
  aggregateVolume,
  aggregateByType,
  aggregateAvgClose,
  aggregateSettlements,
  aggregateSlaCompliance,
  aggregateHandlerWorkload,
  formatZAR,
} from '@/lib/trend-utils'
import type { TimePeriod } from '@/types'
```

Also update the existing React import — change `import { useMemo } from 'react'` to remove it (since we moved it to the combined import above).

- [ ] **Step 2: Add time period state and trend data computations**

Inside the `DashboardPage` function, after the existing `timeToClose` useMemo block (around line 116), add:

```ts
  // ── Portfolio Trends ───────────────────────────────────────
  const [period, setPeriod] = useState<TimePeriod>('1M')

  const volumeData = useMemo(
    () => aggregateVolume(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )
  const typeOverTimeData = useMemo(
    () => aggregateByType(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )
  const avgCloseData = useMemo(
    () => aggregateAvgClose(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const settlementData = useMemo(
    () => aggregateSettlements(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const slaComplianceData = useMemo(
    () => aggregateSlaCompliance(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const handlerWorkloadData = useMemo(
    () => aggregateHandlerWorkload(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )
```

- [ ] **Step 3: Add the Portfolio Trends JSX**

In the return statement, after the closing `</div>` of the last grid (the Time to Close + Breached SLAs section, around line 307), add:

```tsx
      {/* ── Portfolio Trends ────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-semibold">Portfolio Trends</h2>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['1W', '1M', '1Y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Claims Volume */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Claims Volume</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 2: Claims by Type */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Claims by Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={typeOverTimeData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="accident" stackId="1" fill="var(--chart-1)" stroke="var(--chart-1)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="glass" stackId="1" fill="var(--chart-2)" stroke="var(--chart-2)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="theft" stackId="1" fill="var(--chart-3)" stroke="var(--chart-3)" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 3: Avg Days to Close */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Avg Days to Close</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={avgCloseData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} unit="d" />
              <RechartsTooltip />
              <Line type="monotone" dataKey="accident" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="glass" stroke="var(--chart-2)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="theft" stroke="var(--chart-3)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 4: Settlement Amounts */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Settlement Amounts</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={settlementData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatZAR} />
              <RechartsTooltip formatter={(value: number) => formatZAR(value)} />
              <Bar dataKey="amount" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 5: SLA Compliance Rate */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">SLA Compliance Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={slaComplianceData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <RechartsTooltip formatter={(value: number | null) => value !== null ? `${value}%` : '—'} />
              <ReferenceLine y={80} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="rate" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 6: Handler Workload */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Handler Workload</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={handlerWorkloadData.data}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              {handlerWorkloadData.handlers.map((handler, i) => (
                <Bar
                  key={handler}
                  dataKey={handler}
                  stackId="handlers"
                  fill={`var(--chart-${(i % 5) + 1})`}
                  radius={i === handlerWorkloadData.handlers.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
```

- [ ] **Step 4: Verify build and dev server**

Run: `npm run build`
Expected: Clean build, no errors.

Run: `npm run dev`
Expected: Dashboard loads, scroll down to see Portfolio Trends section with 6 charts. Toggle 1W/1M/1Y and verify charts update.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard-page.tsx
git commit -m "feat: add Portfolio Trends section with 6 time-switchable charts"
```

---

### Task 5: Visual QA and Polish

**Files:**
- Modify: `src/pages/dashboard-page.tsx` (if needed)
- Modify: `src/lib/trend-utils.ts` (if needed)
- Modify: `src/data/seed-historical-claims.ts` (if needed)

- [ ] **Step 1: Run the dev server and visually check all 6 charts**

Run: `npm run dev`

Check each chart in all 3 time periods (1W, 1M, 1Y):
- Claims Volume: bars should show daily/monthly counts, ~3 claims/day or ~90/month
- Claims by Type: stacked areas, glass should be visually larger than accident
- Avg Days to Close: 3 lines — glass low (~5d), accident mid (~21d), theft high (~35d)
- Settlement Amounts: bars with ZAR-formatted axis (R 50k, R 100k, etc.)
- SLA Compliance: line hovering around 75-85%, dashed reference at 80%
- Handler Workload: stacked bars with 7 handler segments

- [ ] **Step 2: Fix any visual issues found**

Common issues to check:
- X-axis labels overlapping → adjust `interval` or `angle` props
- Empty data points on 1W (theft has <1% frequency) → acceptable, theft line may be sparse
- Chart tooltips readable and formatted correctly
- Colors distinguishable in both light and dark mode

- [ ] **Step 3: Final build check**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 4: Commit any polish changes**

```bash
git add -A
git commit -m "fix: polish trend chart display and formatting"
```
