import type { Claim, OutboundMessage, MessageRole, WorkflowState } from '@/types'
import { buildThreadToken, formatSubjectWithToken } from '@/lib/messages'
import { getContactById } from '@/data/seed-contacts'

let msgCounter = 100

function nextId(): string {
  msgCounter++
  return `MSG-OUT-${String(msgCounter).padStart(4, '0')}`
}

function vehicleDesc(claim: Claim): string {
  const v = claim.vehicle
  return `${v.year} ${v.make} ${v.model} (${v.registration})`
}

function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return 'R0.00'
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
}

const SIGN_OFF = 'Regards,\nRTU Insurance Services'

// ── Template definitions ────────────────────────────────────
// Each template returns partial draft fields (no id/claimId/generatedAt)

type TemplateDraft = { trigger: string; to: string; toRole: MessageRole; subject: string; body: string }
type TemplateGenerator = (claim: Claim) => TemplateDraft

// ── Insured (policyholder) templates ────────────────────────

const insuredTemplates: Record<string, TemplateGenerator> = {
  // P1 — Claim acknowledged
  claim_acknowledged: (claim) => ({
    trigger: 'claim_acknowledged',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Acknowledgement of Receipt`,
    body: `Dear ${claim.insured.name},\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number ${claim.id}.\n\nVehicle: ${vehicleDesc(claim)}\n\nWe are currently validating your policy details and will be in touch shortly with an update.\n\n${SIGN_OFF}`,
  }),

  // P2 — Invalid policy
  invalid_policy: (claim) => ({
    trigger: 'invalid_policy',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Invalid Policy`,
    body: `Dear ${claim.insured.name},\n\nWe were unable to validate the policy associated with your claim ${claim.id} for your ${vehicleDesc(claim)}.\n\nPlease contact your broker to verify your policy details.\n\n${SIGN_OFF}`,
  }),

  // P3 — Insured notified of assessor appointment
  insured_assessor_appointed: (claim) => {
    const contact = claim.workflow.assessorId ? getContactById(claim.workflow.assessorId) : undefined
    return {
      trigger: 'insured_assessor_appointed',
      to: claim.insured.email ?? '',
      toRole: 'insured',
      subject: `Claim ${claim.id} — Assessor Appointed`,
      body: `Dear ${claim.insured.name},\n\nWe refer to your claim ${claim.id} regarding your ${vehicleDesc(claim)}.\n\n${contact?.name ?? 'An assessor'} has been appointed to assess the damage to your vehicle. Please expect contact from them to arrange an inspection.\n\nShould you have any queries in the interim, please do not hesitate to contact us.\n\n${SIGN_OFF}`,
    }
  },

  // P4 — Insured notified of investigator appointment
  insured_investigator_appointed: (claim) => {
    const contact = claim.workflow.investigatorId ? getContactById(claim.workflow.investigatorId) : undefined
    return {
      trigger: 'insured_investigator_appointed',
      to: claim.insured.email ?? '',
      toRole: 'insured',
      subject: `Claim ${claim.id} — Investigator Appointed`,
      body: `Dear ${claim.insured.name},\n\nWe refer to your claim ${claim.id} regarding the theft of your ${vehicleDesc(claim)}.\n\n${contact?.name ?? 'An investigator'} has been appointed to investigate your claim. They may contact you for additional information.\n\nShould you have any queries in the interim, please do not hesitate to contact us.\n\n${SIGN_OFF}`,
    }
  },

  // P5 — Insured notified of glass repairer dispatch
  insured_glass_dispatched: (claim) => {
    const contact = claim.workflow.glassRepairerId ? getContactById(claim.workflow.glassRepairerId) : undefined
    return {
      trigger: 'insured_glass_dispatched',
      to: claim.insured.email ?? '',
      toRole: 'insured',
      subject: `Claim ${claim.id} — Glass Repairer Dispatched`,
      body: `Dear ${claim.insured.name},\n\nWe refer to your claim ${claim.id} regarding your ${vehicleDesc(claim)}.\n\n${contact?.name ?? 'A glass replacement specialist'} will contact you to arrange the replacement at ${claim.incident.vehicleLocation ?? claim.incident.location}.\n\nShould you have any queries, please do not hesitate to contact us.\n\n${SIGN_OFF}`,
    }
  },

  // P6 — Within excess
  within_excess: (claim) => ({
    trigger: 'within_excess',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Within Excess Notification`,
    body: `Dear ${claim.insured.name},\n\nWe refer to your claim ${claim.id} regarding your ${vehicleDesc(claim)}.\n\nFollowing assessment, the assessed damage amount of ${formatAmount(claim.workflow.assessedAmount)} falls within your policy excess of ${formatAmount(claim.workflow.excessAmount)}.\n\nAs the damage is within the excess, no further action will be taken on this claim.\n\nShould you have any queries, please contact us.\n\n${SIGN_OFF}`,
  }),

  // P7 — Claim approved (AOL generated)
  claim_approved: (claim) => ({
    trigger: 'claim_approved',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Claim Approved`,
    body: `Dear ${claim.insured.name},\n\nWe are pleased to advise that your claim ${claim.id} for your ${vehicleDesc(claim)} has been approved and authorised.\n\nWe will advise on next steps shortly.\n\n${SIGN_OFF}`,
  }),

  // P8 — Claim rejected
  claim_rejected: (claim) => ({
    trigger: 'claim_rejected',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Claim Declined`,
    body: `Dear ${claim.insured.name},\n\nWe regret to inform you that your claim ${claim.id} for your ${vehicleDesc(claim)} has been declined.\n\nReason: ${claim.workflow.rejectionReason ?? 'Please contact us for details.'}\n\nShould you wish to dispute this decision, please contact us within 30 days.\n\n${SIGN_OFF}`,
  }),

  // P9 — Repair commenced
  repair_started: (claim) => ({
    trigger: 'repair_started',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Repair Commenced`,
    body: `Dear ${claim.insured.name},\n\nWe are pleased to advise that repairs on your ${vehicleDesc(claim)} have commenced.\n\nClaim Reference: ${claim.id}\nFinal Authorised Cost: ${formatAmount(claim.workflow.finalCostAmount)}\n\nYou will be notified once the repair is complete. Should you have any queries in the interim, please do not hesitate to contact us.\n\n${SIGN_OFF}`,
  }),

  // P10 — Repair complete
  repair_complete: (claim) => ({
    trigger: 'repair_complete',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Repair Complete`,
    body: `Dear ${claim.insured.name},\n\nWe are pleased to advise that repairs on your ${vehicleDesc(claim)} have been completed.\n\nClaim Reference: ${claim.id}\n\nPlease arrange collection of your vehicle at your earliest convenience. Your claim has been finalised and closed.\n\nThank you for your patience throughout the process.\n\n${SIGN_OFF}`,
  }),

  // P11 — Total loss
  claim_approved_total_loss: (claim) => ({
    trigger: 'claim_approved_total_loss',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Total Loss Notification`,
    body: `Dear ${claim.insured.name},\n\nYour claim ${claim.id} for your ${vehicleDesc(claim)} has been assessed as a total loss.\n\nPlease provide the following Natis documents to proceed with settlement:\n- Vehicle registration certificate\n- ID document\n\n${SIGN_OFF}`,
  }),

  // P12 — Settlement issued
  settlement_issued: (claim) => ({
    trigger: 'settlement_issued',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Settlement Notification`,
    body: `Dear ${claim.insured.name},\n\nSettlement for your claim ${claim.id} has been processed for the amount of ${formatAmount(claim.workflow.settlementAmount)}.\n\nPlease confirm receipt of the settlement.\n\n${SIGN_OFF}`,
  }),

  // P13 — Glass replacement complete
  glass_complete: (claim) => ({
    trigger: 'glass_complete',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Glass Replacement Complete`,
    body: `Dear ${claim.insured.name},\n\nWe are pleased to confirm that the glass replacement on your ${vehicleDesc(claim)} has been completed.\n\nClaim Reference: ${claim.id}\n\nYour claim has been finalised and closed. Thank you for your patience.\n\n${SIGN_OFF}`,
  }),

  // P14 — Claim closed
  claim_closed: (claim) => ({
    trigger: 'claim_closed',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Claim Closed`,
    body: `Dear ${claim.insured.name},\n\nYour claim ${claim.id} for your ${vehicleDesc(claim)} has been finalised and closed.\n\nShould you have any queries regarding this claim, please do not hesitate to contact us quoting your reference number.\n\nThank you for your patience throughout the process.\n\n${SIGN_OFF}`,
  }),
}

// ── Service provider templates ──────────────────────────────

const providerTemplates: Record<string, TemplateGenerator> = {
  assessor_appointed: (claim) => {
    const contact = claim.workflow.assessorId ? getContactById(claim.workflow.assessorId) : undefined
    return {
      trigger: 'assessor_appointed',
      to: contact?.email ?? '',
      toRole: 'assessor',
      subject: `Assessment Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Assessor'},\n\nPlease note that claim ${claim.id} requires your assessment.\n\nVehicle: ${vehicleDesc(claim)}\nIncident: ${claim.incident.circumstances}\nInsured: ${claim.insured.name}\nLocation: ${claim.incident.location}\n\nPlease submit your report within the agreed timeframe.\n\n${SIGN_OFF}`,
    }
  },

  investigator_appointed: (claim) => {
    const contact = claim.workflow.investigatorId ? getContactById(claim.workflow.investigatorId) : undefined
    return {
      trigger: 'investigator_appointed',
      to: contact?.email ?? '',
      toRole: 'investigator',
      subject: `Investigation Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Investigator'},\n\nPlease investigate claim ${claim.id} (vehicle theft).\n\nVehicle: ${vehicleDesc(claim)}\nIncident: ${claim.incident.circumstances}\nInsured: ${claim.insured.name}\nPolice Reference: ${claim.incident.policeReference ?? 'N/A'}\n\nPlease submit your report within 14 days.\n\n${SIGN_OFF}`,
    }
  },

  glass_repairer_appointed: (claim) => {
    const contact = claim.workflow.glassRepairerId ? getContactById(claim.workflow.glassRepairerId) : undefined
    return {
      trigger: 'glass_repairer_appointed',
      to: contact?.email ?? '',
      toRole: 'glass_repairer',
      subject: `Glass Replacement Required — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Glass Repairer'},\n\nPlease attend to glass replacement for claim ${claim.id}.\n\nVehicle: ${vehicleDesc(claim)}\nGlass: ${claim.incident.causeOfLoss ?? 'Windscreen'}\nVehicle Location: ${claim.incident.vehicleLocation ?? claim.incident.location}\nInsured Contact: ${claim.insured.phone}\n\nPlease complete within 12 hours.\n\n${SIGN_OFF}`,
    }
  },

  sla_warning: (claim) => {
    const contact = getAssignedContact(claim)
    return {
      trigger: 'sla_warning',
      to: contact?.email ?? '',
      toRole: 'assessor',
      subject: `REMINDER: ${claim.id} — Action Required`,
      body: `Dear ${contact?.name ?? 'Team'},\n\nThis is a reminder that the SLA for claim ${claim.id} (${vehicleDesc(claim)}) is approaching.\n\nPlease take action promptly to avoid a breach.\n\n${SIGN_OFF}`,
    }
  },

  repair_follow_up: (claim) => {
    const contact = claim.workflow.repairerId ? getContactById(claim.workflow.repairerId) : undefined
    return {
      trigger: 'repair_follow_up',
      to: contact?.email ?? '',
      toRole: 'repairer',
      subject: `Status Update Request — ${claim.id} | ${claim.vehicle.make} ${claim.vehicle.model}`,
      body: `Dear ${contact?.name ?? 'Repairer'},\n\nPlease provide a status update on the repairs for claim ${claim.id}.\n\nVehicle: ${vehicleDesc(claim)}\nInsured: ${claim.insured.name}\n\nKindly advise on expected completion date.\n\n${SIGN_OFF}`,
    }
  },

  salvage_follow_up: (claim) => ({
    trigger: 'salvage_follow_up',
    to: claim.insured.email ?? '',
    toRole: 'insured',
    subject: `Claim ${claim.id} — Salvage Status`,
    body: `Dear ${claim.insured.name},\n\nThis is a follow-up regarding the salvage process for your ${vehicleDesc(claim)}.\n\nClaim Reference: ${claim.id}\n\nPlease confirm the current status of the salvage. Should you require any assistance, please contact us.\n\n${SIGN_OFF}`,
  }),
}

// ── Broker adapter ──────────────────────────────────────────
// Takes an insured-targeted draft and produces a broker version

function generateBrokerCopy(claim: Claim, insuredDraft: TemplateDraft): TemplateDraft | null {
  const brokerEmail = claim.broker?.email
  if (!brokerEmail) return null

  const brokerName = claim.broker?.name ?? 'Broker'

  // Build operational details block based on available data
  const details: string[] = []
  details.push(`Claim Reference: ${claim.id}`)
  details.push(`Claim Type: ${claim.type.charAt(0).toUpperCase() + claim.type.slice(1)}`)
  details.push(`Insured: ${claim.insured.name}`)
  if (claim.workflow.policyNumber) details.push(`Policy Number: ${claim.workflow.policyNumber}`)
  if (claim.workflow.spmClaimNumber) details.push(`SPM Number: ${claim.workflow.spmClaimNumber}`)
  if (claim.workflow.assessedAmount !== undefined) details.push(`Assessed Amount: ${formatAmount(claim.workflow.assessedAmount)}`)
  if (claim.workflow.excessAmount !== undefined) details.push(`Excess Amount: ${formatAmount(claim.workflow.excessAmount)}`)
  if (claim.workflow.finalCostAmount !== undefined) details.push(`Final Cost: ${formatAmount(claim.workflow.finalCostAmount)}`)
  if (claim.workflow.settlementAmount !== undefined) details.push(`Settlement Amount: ${formatAmount(claim.workflow.settlementAmount)}`)
  details.push(`Assigned To: ${claim.assignedTo}`)

  // Replace insured greeting with broker greeting, append operational details
  const bodyLines = insuredDraft.body.split('\n')
  bodyLines[0] = `Dear ${brokerName},`

  // Insert operational details before sign-off
  const signOffIndex = bodyLines.findIndex(line => line.startsWith('Regards,'))
  const opsBlock = `\n--- Operational Details ---\n${details.join('\n')}\n`

  if (signOffIndex >= 0) {
    bodyLines.splice(signOffIndex, 0, opsBlock)
  } else {
    bodyLines.push(opsBlock)
  }

  return {
    trigger: `broker_${insuredDraft.trigger}`,
    to: brokerEmail,
    toRole: 'broker',
    subject: insuredDraft.subject,
    body: bodyLines.join('\n'),
  }
}

// ── Helper ──────────────────────────────────────────────────

function getAssignedContact(claim: Claim) {
  const id = claim.workflow.assessorId
    ?? claim.workflow.investigatorId
    ?? claim.workflow.glassRepairerId
    ?? claim.workflow.repairerId
  return id ? getContactById(id) : undefined
}

function toOutboundMessage(claim: Claim, draft: TemplateDraft): OutboundMessage {
  const threadToken = buildThreadToken(claim)
  return {
    id: nextId(),
    claimId: claim.id,
    direction: 'outbound',
    state: 'pending',
    source: 'draft_generated',
    threadToken,
    trigger: draft.trigger,
    from: { name: claim.assignedTo, email: 'claims@rtusa.co.za', role: 'consultant' },
    to: [draft.to],
    bcc: ['claims@rtusa.co.za'],
    subject: formatSubjectWithToken(draft.subject, threadToken),
    body: draft.body,
    attachments: [],
    generatedAt: new Date().toISOString(),
  }
}

// ── Transition → template mapping ───────────────────────────
// Each state maps to: { insured?, provider? } template keys

interface TransitionComms {
  insured?: string
  provider?: string
}

const transitionTriggers: Partial<Record<WorkflowState, TransitionComms>> = {
  POLICY_VALIDATION: { insured: 'claim_acknowledged' },
  INVALID: { insured: 'invalid_policy' },
  ASSESSOR_APPOINTED: { insured: 'insured_assessor_appointed', provider: 'assessor_appointed' },
  INVESTIGATOR_APPOINTED: { insured: 'insured_investigator_appointed', provider: 'investigator_appointed' },
  GLASS_REPAIRER_APPOINTED: { insured: 'insured_glass_dispatched', provider: 'glass_repairer_appointed' },
  WITHIN_EXCESS: { insured: 'within_excess' },
  REJECTED: { insured: 'claim_rejected' },
  AOL: { insured: 'claim_approved' },
  REPAIR_IN_PROGRESS: { insured: 'repair_started' },
  REPAIR_COMPLETE: { insured: 'repair_complete' },
  TOTAL_LOSS: { insured: 'claim_approved_total_loss' },
  SETTLEMENT_CONFIRMED: { insured: 'settlement_issued' },
  CLOSED: { insured: 'claim_closed' },
}

// ── Main: generate all communications for a state transition ─
export function generateCommunication(claim: Claim, toState: WorkflowState): OutboundMessage[] {
  const triggers = transitionTriggers[toState]
  if (!triggers) return []

  const messages: OutboundMessage[] = []

  // Generate insured draft + automatic broker copy
  if (triggers.insured) {
    const generator = insuredTemplates[triggers.insured]
    if (generator) {
      const insuredDraft = generator(claim)
      messages.push(toOutboundMessage(claim, insuredDraft))

      // Auto-generate broker copy
      const brokerDraft = generateBrokerCopy(claim, insuredDraft)
      if (brokerDraft) {
        messages.push(toOutboundMessage(claim, brokerDraft))
      }
    }
  }

  // Generate provider draft
  if (triggers.provider) {
    const generator = providerTemplates[triggers.provider]
    if (generator) {
      messages.push(toOutboundMessage(claim, generator(claim)))
    }
  }

  return messages
}

// ── Generate a communication from a template key ─────────────
export function generateFromTemplate(claim: Claim, templateKey: string): OutboundMessage | null {
  const generator = insuredTemplates[templateKey] ?? providerTemplates[templateKey]
  if (!generator) return null

  const draft = generator(claim)
  return toOutboundMessage(claim, draft)
}
