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
