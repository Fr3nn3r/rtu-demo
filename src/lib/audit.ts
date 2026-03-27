import type { AuditActionType, AuditEntry } from '@/types'

let auditCounter = 0

export function createAuditEntry(
  user: string,
  actionType: AuditActionType,
  description: string,
  oldValue?: string,
  newValue?: string,
): AuditEntry {
  auditCounter++
  return {
    id: `AUD-${String(auditCounter).padStart(5, '0')}`,
    timestamp: new Date().toISOString(),
    user,
    actionType,
    description,
    oldValue,
    newValue,
  }
}
