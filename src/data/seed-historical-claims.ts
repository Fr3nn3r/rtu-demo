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

function weightedPick<T extends { weight: number }>(items: T[], rand: () => number): T {
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
      const closedAt =
        isClosed && daysToClose !== null
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
