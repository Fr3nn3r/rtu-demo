import type { Claim, DocumentType, WorkflowState } from '@/types'
import { REQUIRED_DOCUMENTS } from '@/data/document-requirements'

export interface DocumentCompleteness {
  received: number
  required: number
  missing: DocumentType[]
}

export function getDocumentCompleteness(claim: Claim): DocumentCompleteness {
  const requiredTypes = REQUIRED_DOCUMENTS[claim.type]
  const receivedTypes = new Set(
    claim.documents
      .filter(d => d.status === 'received')
      .map(d => d.type),
  )

  const missing = requiredTypes.filter(t => !receivedTypes.has(t))

  return {
    received: requiredTypes.length - missing.length,
    required: requiredTypes.length,
    missing,
  }
}

export function isSettlementGated(claim: Claim): boolean {
  return getDocumentCompleteness(claim).missing.length > 0
}

/**
 * Transitions where the document-completeness gate fires.
 * These are the points where RTU releases payment — settlement
 * confirmation and claim closure after repair.
 *
 * Non-payment closures (WITHIN_EXCESS, REJECTED, INVALID → CLOSED)
 * are handled by separate action components and are NOT gated.
 */
const GATED_TRANSITIONS = new Set([
  'TOTAL_LOSS->SETTLEMENT_CONFIRMED',
  'REPAIR_IN_PROGRESS->CLOSED',
  'REPAIR_COMPLETE->CLOSED',
])

export function isGatedTransition(from: WorkflowState, to: WorkflowState): boolean {
  return GATED_TRANSITIONS.has(`${from}->${to}`)
}
