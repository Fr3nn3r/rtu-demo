import type { Claim, MessageAttachment, MessageRole, WorkflowState } from '@/types'

export type ReplyTemplate = {
  subjectPrefix: string
  body: (claim: Claim) => string
  attachments?: (claim: Claim) => MessageAttachment[]
}

type RoleStateKey = string // `${MessageRole}:${WorkflowState | '*'}`

let attachmentCounter = 5000
function nextAttachmentId(): string {
  attachmentCounter++
  return `ATT-${attachmentCounter}`
}

function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return 'R0.00'
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
}

export const replyTemplates: Record<RoleStateKey, ReplyTemplate> = {
  // ── Assessor replies ────────────────────────────────────────
  'assessor:ASSESSOR_APPOINTED': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Thanks. I will attend the vehicle at ${claim.incident.location} within 24 hours and revert with the assessment report.\n\nRegards,\nAssigned Assessor`,
  },
  'assessor:ASSESSMENT_RECEIVED': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Report and photos attached. Recommend settlement at ${formatAmount(claim.workflow.assessedAmount)}.\n\nRegards,\nAssigned Assessor`,
    attachments: () => [{ id: nextAttachmentId(), name: 'assessment_report.pdf' }],
  },
  'assessor:*': {
    subjectPrefix: 'Re: ',
    body: (claim) => `Noted on claim ${claim.id}. Will action shortly.\n\nRegards,\nAssigned Assessor`,
  },

  // ── Investigator replies ────────────────────────────────────
  'investigator:INVESTIGATOR_APPOINTED': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Acknowledged. Beginning investigation of the theft of ${claim.vehicle.registration}. Expect a report within 14 days.\n\nRegards,\nAssigned Investigator`,
  },
  'investigator:INVESTIGATION_RECEIVED': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Investigation report attached. No fraud indicators identified. Recommend proceeding with claim ${claim.id}.\n\nRegards,\nAssigned Investigator`,
    attachments: () => [{ id: nextAttachmentId(), name: 'investigation_report.pdf' }],
  },
  'investigator:*': {
    subjectPrefix: 'Re: ',
    body: (claim) => `Noted on claim ${claim.id}.\n\nRegards,\nAssigned Investigator`,
  },

  // ── Insured replies ─────────────────────────────────────────
  'insured:*': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Thank you for the update on claim ${claim.id}. Please keep me informed.\n\nKind regards,\n${claim.insured.name}`,
  },

  // ── Broker replies ──────────────────────────────────────────
  'broker:*': {
    subjectPrefix: 'FW: ',
    body: (claim) =>
      `Noted. Will escalate internally if needed — ref ${claim.id}.\n\nKind regards,\n${claim.broker.name}`,
  },

  // ── Repairer replies ────────────────────────────────────────
  'repairer:REPAIR_IN_PROGRESS': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Vehicle ${claim.vehicle.registration} received in workshop. ETA 5 working days.\n\nRegards,\nRepair Centre`,
  },
  'repairer:INSPECTION_FINAL_COSTING': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `Final costing confirmed for vehicle ${claim.vehicle.registration}. Quote attached.\n\nRegards,\nRepair Centre`,
    attachments: () => [{ id: nextAttachmentId(), name: 'final_quote.pdf' }],
  },
  'repairer:*': {
    subjectPrefix: 'Re: ',
    body: (claim) => `Noted on vehicle ${claim.vehicle.registration}.\n\nRegards,\nRepair Centre`,
  },

  // ── Glass repairer replies ──────────────────────────────────
  'glass_repairer:GLASS_REPAIRER_APPOINTED': {
    subjectPrefix: 'Re: ',
    body: (claim) =>
      `On site at ${claim.incident.vehicleLocation ?? claim.incident.location}. Replacement underway.\n\nRegards,\nGlass Replacement Team`,
  },
  'glass_repairer:*': {
    subjectPrefix: 'Re: ',
    body: (claim) => `Confirmed on ${claim.vehicle.registration}.\n\nRegards,\nGlass Replacement Team`,
  },
}

/**
 * Resolve a reply template using fallback order:
 *   1. exact `role:state`
 *   2. `role:*`
 *   3. generic acknowledgement
 */
export function resolveReplyTemplate(role: MessageRole, state: WorkflowState): ReplyTemplate {
  const exact = replyTemplates[`${role}:${state}`]
  if (exact) return exact
  const roleWildcard = replyTemplates[`${role}:*`]
  if (roleWildcard) return roleWildcard
  return {
    subjectPrefix: 'Re: ',
    body: (claim) => `Acknowledged on claim ${claim.id}.`,
  }
}
