# Dashboard Historical Trends & Realistic Data — Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Overview

Update the ClaimPilot dashboard with realistic demo data shaped by RTU's real historical portfolio (1,000 claims from SQL dump), and add a "Portfolio Trends" section with a 1W/1M/1Y time switcher controlling 6 trend charts.

## Goals

- Make the dashboard demo feel grounded in RTU's real claim distributions, handler structure, and settlement values
- Add time-based trend visibility aligned with the Phase 0 operational metrics (claim volume, SLA compliance, avg handling time, payout values, handler workload)
- Keep it frontend-only — all data is in-memory seed data, no backend

## Dashboard Layout

The page has two zones:

### Zone 1 — Live Operations (unchanged)

Existing widgets that reflect the current in-memory claim state in real time:

- **4 KPI stat cards**: Active Claims, Breached SLAs, New This Month, Avg Days to Close
- **3 chart cards** (row of 3):
  1. Active Claims by Status — horizontal bar chart
  2. Claims by Type — pie chart
  3. SLA Performance — donut chart (within/approaching/breached)
- **2 tables** (row of 2): Operator Workload, Assessor/Investigator Performance
- **2 tables** (row of 2): Average Time to Close, Breached SLAs (conditional)

### Zone 2 — Portfolio Trends (new)

A section header "Portfolio Trends" with a time period toggle, followed by a 2-column grid of 6 trend charts. All charts filter from the same historical dataset based on the selected time period.

## Time Switcher

- Toggle group with three options: `1W` | `1M` | `1Y`
- Default selection: **1M**
- State: `useState<'1W' | '1M' | '1Y'>('1M')` in the dashboard page
- Filtering: `filterByPeriod(claims, period, dateField)` filters `HistoricalClaim[]` relative to current date
  - Intake charts (Claims Volume, Claims by Type, Handler Workload) filter by `createdAt`
  - Outcome charts (Avg Days to Close, Settlement Amounts, SLA Compliance) filter by `closedAt`
- Aggregation granularity adapts to the period:
  - **1W**: daily buckets (7 data points)
  - **1M**: daily buckets (~30 data points)
  - **1Y**: monthly buckets (12 data points)
- No animations on switch — immediate re-render

## Historical Data Model

New file: `src/data/seed-historical-claims.ts`

~400 simplified claim records shaped by real RTU distributions. Uses a lighter type than `Claim` since these only feed trend charts, not the workflow engine.

```ts
type HistoricalClaim = {
  id: string
  type: 'accident' | 'theft' | 'glass'
  createdAt: string         // ISO date string
  closedAt: string | null   // ISO date string, null if still open
  daysToClose: number | null
  settlementAmount: number  // ZAR, 0 if no payout
  handler: string
  province: string
  status: 'settled' | 'rejected' | 'not_taken_up' | 'within_excess' | 'no_cover' | 'open'
  slaCompliant: boolean     // was the claim resolved within SLA?
}
```

### Distribution Targets (from real RTU data)

| Dimension | Distribution |
|---|---|
| Type split | 52% glass, 47% accident, 1% theft |
| Handlers | Nombuso Ncube (~40%), Shanaaz Smith (~20%), Nikki Pearmain (~14%), Gizela Dlodlo (~12%), Saira Quinn (~6%), others (~8%) |
| Province | KZN dominant (~45%), Gauteng (~20%), Western Cape (~20%), Eastern Cape (~15%) |
| Status | ~90% settled, ~5% not taken up, ~2% rejected, ~1% within excess, ~1% no cover, ~1% open |
| Avg settlement | Overall ~R35k; accident ~R55k, glass ~R1.5k, theft ~R40k |
| Monthly volume | ~80-100 claims with realistic variation |
| Date range | Past 12 months from current date |
| SLA compliance | ~75-85% compliant (no baseline exists — this is a plausible starting point) |

## Chart Specifications

All 6 charts use Recharts, wrapped in `Card` components matching the existing chart styling. Height: 240px each. Layout: `grid grid-cols-1 lg:grid-cols-2 gap-4`.

### 1. Claims Volume — `BarChart`

- X-axis: time bucket (day or month label)
- Y-axis: count of new claims in the period
- Single bar series, colored `--chart-1`

### 2. Claims by Type — `AreaChart` (stacked)

- X-axis: time bucket
- Y-axis: count per claim type, stacked
- 3 area series: accident (`--chart-1`), glass (`--chart-2`), theft (`--chart-3`)

### 3. Avg Days to Close — `LineChart`

- X-axis: time bucket
- Y-axis: average days to close for claims closed in that period
- 3 lines, one per claim type (same color mapping)
- Only renders data points for buckets where at least 1 claim closed

### 4. Settlement Amounts — `BarChart`

- X-axis: time bucket
- Y-axis: total settlement amount (ZAR) for claims closed in period
- Single bar series, colored `--chart-3`
- Y-axis formatted as "R 50k", "R 100k" etc.

### 5. SLA Compliance Rate — `LineChart`

- X-axis: time bucket
- Y-axis: percentage (0-100%) of closed claims that were `slaCompliant: true`
- Single line, colored `--chart-1`
- Dashed reference line at 80% target threshold

### 6. Handler Workload — `BarChart` (stacked)

- X-axis: time bucket
- Y-axis: new claims assigned per handler, stacked
- One bar segment per handler, using `--chart-1` through `--chart-5`

## File Changes

| File | Change |
|---|---|
| `src/data/seed-historical-claims.ts` | New — ~400 historical claim records + `HistoricalClaim` type |
| `src/lib/trend-utils.ts` | New — `filterByPeriod()`, `aggregateByBucket()`, and per-chart aggregation helpers |
| `src/pages/dashboard-page.tsx` | Add Zone 2: time switcher state, import historical data, 6 trend chart cards |
| `src/types/index.ts` | Add `HistoricalClaim` type and `TimePeriod` type |

## Out of Scope

- No backend or API — this remains a frontend-only prototype
- No drill-down from trend charts to individual claims
- No export/download of trend data
- Fraud detection metrics (pending dataset per Phase 0)
- Claims leakage analysis (pending operational data from Vassen)
