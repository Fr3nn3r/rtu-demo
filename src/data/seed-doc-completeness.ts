import type { DailyDocCompletenessSnapshot } from '@/types'

/**
 * 30 days of seeded "claims with incomplete document packs" data.
 * Shows a general downward trend (14 → 5) with realistic noise.
 */
function generateSnapshots(): DailyDocCompletenessSnapshot[] {
  const today = new Date()
  const snapshots: DailyDocCompletenessSnapshot[] = []

  // Day-by-day values for 30 days (index 0 = 30 days ago, index 29 = today)
  const values = [
    14, 13, 14, 15, 14, 13, 12, 13, 12, 11,
    12, 11, 10, 11, 10,  9, 10,  9,  8,  9,
     8,  8,  7,  8,  7,  6,  7,  7,  6,  5,
  ]

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - (29 - i))
    snapshots.push({
      date: date.toISOString().split('T')[0],
      claimsWithIncomplete: values[i],
    })
  }

  return snapshots
}

export const seedDocCompleteness: DailyDocCompletenessSnapshot[] = generateSnapshots()
