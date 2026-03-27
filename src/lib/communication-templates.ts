import type { Claim, DraftCommunication, WorkflowState } from '@/types'
import { getContactById } from '@/data/seed-contacts'

let commCounter = 100

function nextId(): string {
  commCounter++
  return `COM-${String(commCounter).padStart(4, '0')}`
}

function vehicleDesc(claim: Claim): string {
  const v = claim.vehicle
  return `${v.year} ${v.make} ${v.model} (${v.registration})`
}

type TemplateGenerator = (claim: Claim) => Omit<DraftCommunication, 'id' | 'claimId' | 'createdAt'>

const templates: Record<string, TemplateGenerator> = {
  assessor_appointed: (claim) => {
    const contact = claim.workflow.assessorId ? getContactById(claim.workflow.assessorId) : undefined
    return {
      trigger: 'assessor_appointed',
      to: contact?.email ?? '',
      subject: `Assessment Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Assessor'},\n\nPlease note that claim ${claim.id} requires your assessment.\n\nVehicle: ${vehicleDesc(claim)}\nIncident: ${claim.incident.circumstances}\nInsured: ${claim.insured.name}\nLocation: ${claim.incident.location}\n\nPlease submit your report within the agreed timeframe.\n\nRegards,\nClaimPilot — RTU Insurance Services`,
    }
  },

  investigator_appointed: (claim) => {
    const contact = claim.workflow.investigatorId ? getContactById(claim.workflow.investigatorId) : undefined
    return {
      trigger: 'investigator_appointed',
      to: contact?.email ?? '',
      subject: `Investigation Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Investigator'},\n\nPlease investigate claim ${claim.id} (vehicle theft).\n\nVehicle: ${vehicleDesc(claim)}\nIncident: ${claim.incident.circumstances}\nInsured: ${claim.insured.name}\nPolice Reference: ${claim.incident.policeReference ?? 'N/A'}\n\nPlease submit your report within 14 days.\n\nRegards,\nClaimPilot — RTU Insurance Services`,
    }
  },

  glass_repairer_appointed: (claim) => {
    const contact = claim.workflow.glassRepairerId ? getContactById(claim.workflow.glassRepairerId) : undefined
    return {
      trigger: 'glass_repairer_appointed',
      to: contact?.email ?? '',
      subject: `Glass Replacement Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Glass Repairer'},\n\nPlease attend to glass replacement for claim ${claim.id}.\n\nVehicle: ${vehicleDesc(claim)}\nGlass: ${claim.incident.causeOfLoss ?? 'Windscreen'}\nVehicle Location: ${claim.incident.vehicleLocation ?? claim.incident.location}\nInsured Contact: ${claim.insured.phone}\n\nRegards,\nClaimPilot — RTU Insurance Services`,
    }
  },

  within_excess: (claim) => ({
    trigger: 'within_excess',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} — Within Excess Notification`,
    body: `Dear ${claim.insured.name},\n\nWe refer to your claim ${claim.id} regarding your ${vehicleDesc(claim)}.\n\nFollowing assessment, the assessed damage amount of ${formatAmount(claim.workflow.assessedAmount)} falls within your policy excess of ${formatAmount(claim.workflow.excessAmount)}.\n\nAs the damage is within the excess, no further action will be taken on this claim.\n\nShould you have any queries, please contact us.\n\nRegards,\nRTU Insurance Services`,
  }),

  claim_approved_repair: (claim) => ({
    trigger: 'claim_approved_repair',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} Approved — Repair Authorised`,
    body: `Dear ${claim.insured.name},\n\nYour claim ${claim.id} for your ${vehicleDesc(claim)} has been approved.\n\nRepairs have been authorised. You will be contacted by the appointed repairer to arrange the repair schedule.\n\nRegards,\nRTU Insurance Services`,
  }),

  claim_approved_total_loss: (claim) => ({
    trigger: 'claim_approved_total_loss',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} — Total Loss Notification`,
    body: `Dear ${claim.insured.name},\n\nYour claim ${claim.id} for your ${vehicleDesc(claim)} has been assessed as a total loss.\n\nPlease provide the following Natis documents to proceed with settlement:\n- Vehicle registration certificate\n- ID document\n\nRegards,\nRTU Insurance Services`,
  }),

  claim_rejected: (claim) => ({
    trigger: 'claim_rejected',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} — Claim Declined`,
    body: `Dear ${claim.insured.name},\n\nWe regret to inform you that your claim ${claim.id} for your ${vehicleDesc(claim)} has been declined.\n\nReason: ${claim.workflow.rejectionReason ?? 'Please contact us for details.'}\n\nShould you wish to dispute this decision, please contact us within 30 days.\n\nRegards,\nRTU Insurance Services`,
  }),

  invalid_policy: (claim) => ({
    trigger: 'invalid_policy',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} — Invalid Policy`,
    body: `Dear ${claim.insured.name},\n\nWe were unable to validate the policy associated with your claim ${claim.id} for your ${vehicleDesc(claim)}.\n\nPlease contact your broker to verify your policy details.\n\nRegards,\nRTU Insurance Services`,
  }),

  settlement_issued: (claim) => ({
    trigger: 'settlement_issued',
    to: claim.insured.email ?? '',
    subject: `Claim ${claim.id} — Settlement Notification`,
    body: `Dear ${claim.insured.name},\n\nSettlement for your claim ${claim.id} has been processed for the amount of ${formatAmount(claim.workflow.settlementAmount)}.\n\nPlease confirm receipt of the settlement.\n\nRegards,\nRTU Insurance Services`,
  }),

  sla_warning: (claim) => {
    const contact = getAssignedContact(claim)
    return {
      trigger: 'sla_warning',
      to: contact?.email ?? '',
      subject: `REMINDER: ${claim.id} — Action Required`,
      body: `Dear ${contact?.name ?? 'Team'},\n\nThis is a reminder that the SLA for claim ${claim.id} (${vehicleDesc(claim)}) is approaching.\n\nPlease take action promptly to avoid a breach.\n\nRegards,\nClaimPilot — RTU Insurance Services`,
    }
  },
}

function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return 'R0.00'
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
}

function getAssignedContact(claim: Claim) {
  const id = claim.workflow.assessorId
    ?? claim.workflow.investigatorId
    ?? claim.workflow.glassRepairerId
    ?? claim.workflow.repairerId
  return id ? getContactById(id) : undefined
}

// ── Map workflow transitions to communication triggers ────────
const transitionTriggers: Partial<Record<WorkflowState, string>> = {
  ASSESSOR_APPOINTED: 'assessor_appointed',
  INVESTIGATOR_APPOINTED: 'investigator_appointed',
  GLASS_REPAIRER_APPOINTED: 'glass_repairer_appointed',
  WITHIN_EXCESS: 'within_excess',
  REJECTED: 'claim_rejected',
  INVALID: 'invalid_policy',
}

// ── Generate a draft communication for a state transition ────
export function generateCommunication(claim: Claim, toState: WorkflowState): DraftCommunication | null {
  const triggerKey = transitionTriggers[toState]
  if (!triggerKey) return null

  const generator = templates[triggerKey]
  if (!generator) return null

  const draft = generator(claim)
  return {
    ...draft,
    id: nextId(),
    claimId: claim.id,
    createdAt: new Date().toISOString(),
  }
}

// ── Generate a communication from a template key ─────────────
export function generateFromTemplate(claim: Claim, templateKey: string): DraftCommunication | null {
  const generator = templates[templateKey]
  if (!generator) return null

  const draft = generator(claim)
  return {
    ...draft,
    id: nextId(),
    claimId: claim.id,
    createdAt: new Date().toISOString(),
  }
}
