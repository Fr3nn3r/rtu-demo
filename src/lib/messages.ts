import type {
  Claim,
  ClaimMessage,
  InboundMessage,
  MessageParticipant,
  MessageRole,
  OutboundMessage,
  ThreadToken,
} from '@/types'
import { resolveReplyTemplate } from '@/data/simulate-reply-templates'
import { getContactById } from '@/data/seed-contacts'

// ── Thread token helpers ─────────────────────────────────────

export function buildThreadToken(claim: Claim): ThreadToken {
  return `CP-${claim.id}`
}

export function formatSubjectWithToken(subject: string, token: ThreadToken): string {
  return `[${token}] ${subject}`
}

export function parseTokenFromSubject(subject: string): ThreadToken | null {
  const match = subject.match(/\[CP-([A-Z]+-\d+)\]/)
  return match ? `CP-${match[1]}` : null
}

// ── Gmail compose URL ────────────────────────────────────────

export function buildGmailComposeUrl(msg: OutboundMessage): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: msg.to.join(','),
    su: msg.subject,
    body: msg.body,
    bcc: msg.bcc.join(','),
  })
  if (msg.cc?.length) params.set('cc', msg.cc.join(','))
  return `https://mail.google.com/mail/?${params.toString()}`
}

// ── Thread participants ──────────────────────────────────────

export function getLatestOutboundRecipients(claim: Claim): MessageRole[] {
  const outbound = claim.messages
    .filter((m): m is OutboundMessage => m.direction === 'outbound' && m.state === 'sent')
    .sort((a, b) =>
      new Date(b.sentAt ?? b.generatedAt).getTime() -
      new Date(a.sentAt ?? a.generatedAt).getTime()
    )

  const roles = new Set<MessageRole>()
  for (const msg of outbound) {
    // The outbound message's recipient role is inferred from the trigger
    // or from the contacts on the claim. For the dropdown, we collect
    // every unique inbound-capable role that has received a message.
    const inferred = inferRecipientRole(msg, claim)
    if (inferred) roles.add(inferred)
  }
  return Array.from(roles)
}

function inferRecipientRole(msg: OutboundMessage, claim: Claim): MessageRole | null {
  const toLower = msg.to.join(',').toLowerCase()
  if (claim.insured.email && toLower.includes(claim.insured.email.toLowerCase())) return 'insured'
  if (claim.broker.email && toLower.includes(claim.broker.email.toLowerCase())) return 'broker'
  // Otherwise assume it's the contact role matching the current workflow
  if (claim.workflow.assessorId) return 'assessor'
  if (claim.workflow.investigatorId) return 'investigator'
  if (claim.workflow.repairerId) return 'repairer'
  if (claim.workflow.glassRepairerId) return 'glass_repairer'
  return null
}

// ── Thread chronological sort ────────────────────────────────

export function sortMessagesChronologically(messages: ClaimMessage[]): ClaimMessage[] {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.direction === 'outbound' ? a.generatedAt : a.receivedAt).getTime()
    const bTime = new Date(b.direction === 'outbound' ? b.generatedAt : b.receivedAt).getTime()
    return aTime - bTime
  })
}

// ── Simulate reply ───────────────────────────────────────────

let inboundCounter = 2000
function nextInboundId(): string {
  inboundCounter++
  return `MSG-IN-${inboundCounter}`
}

let attachmentCounter = 5000
function nextAttachmentId(): string {
  attachmentCounter++
  return `ATT-${attachmentCounter}`
}

function buildFromParticipant(claim: Claim, fromRole: MessageRole): MessageParticipant {
  switch (fromRole) {
    case 'insured':
      return {
        name: claim.insured.name,
        email: claim.insured.email ?? 'insured@example.co.za',
        role: 'insured',
      }
    case 'broker':
      return {
        name: claim.broker.name,
        email: claim.broker.email,
        role: 'broker',
      }
    case 'assessor': {
      const c = claim.workflow.assessorId ? getContactById(claim.workflow.assessorId) : undefined
      return {
        name: c?.name ?? 'Assessor',
        email: c?.email ?? 'assessor@example.co.za',
        role: 'assessor',
      }
    }
    case 'investigator': {
      const c = claim.workflow.investigatorId ? getContactById(claim.workflow.investigatorId) : undefined
      return {
        name: c?.name ?? 'Investigator',
        email: c?.email ?? 'investigator@example.co.za',
        role: 'investigator',
      }
    }
    case 'repairer': {
      const c = claim.workflow.repairerId ? getContactById(claim.workflow.repairerId) : undefined
      return {
        name: c?.name ?? 'Repairer',
        email: c?.email ?? 'repairer@example.co.za',
        role: 'repairer',
      }
    }
    case 'glass_repairer': {
      const c = claim.workflow.glassRepairerId ? getContactById(claim.workflow.glassRepairerId) : undefined
      return {
        name: c?.name ?? 'Glass Repairer',
        email: c?.email ?? 'glass@example.co.za',
        role: 'glass_repairer',
      }
    }
    case 'insurer':
      return {
        name: 'Renasa Claims Desk',
        email: 'claims@renasa.co.za',
        role: 'insurer',
      }
    default:
      return { name: 'Unknown Sender', email: 'unknown@example.co.za', role: 'unknown' }
  }
}

function getLatestOutboundForThread(claim: Claim): OutboundMessage | undefined {
  const sorted = claim.messages
    .filter((m): m is OutboundMessage => m.direction === 'outbound' && m.state === 'sent')
    .sort((a, b) =>
      new Date(b.sentAt ?? b.generatedAt).getTime() -
      new Date(a.sentAt ?? a.generatedAt).getTime()
    )
  return sorted[0]
}

export function generateSimulatedReply(claim: Claim, fromRole: MessageRole): InboundMessage {
  const template = resolveReplyTemplate(fromRole, claim.status)
  const latestOutbound = getLatestOutboundForThread(claim)
  const baseSubject = latestOutbound?.subject.replace(/^(Re:|FW:)\s*/, '') ?? `Claim ${claim.id}`
  const threadToken = latestOutbound?.threadToken ?? buildThreadToken(claim)

  // Jitter forward 0-90s so simulated replies appear to arrive "just now"
  // relative to the click — not retroactively dated.
  const jitterMs = Math.floor(Math.random() * 90 * 1000)
  const receivedAt = new Date(Date.now() + jitterMs).toISOString()

  return {
    id: nextInboundId(),
    claimId: claim.id,
    direction: 'inbound',
    state: 'received',
    source: 'simulated',
    threadToken,
    from: buildFromParticipant(claim, fromRole),
    to: ['claims@rtusa.co.za'],
    subject: `${template.subjectPrefix}${baseSubject}`,
    body: template.body(claim),
    attachments: (template.attachments?.(claim) ?? []).map(a => ({
      ...a,
      id: nextAttachmentId(),
    })),
    receivedAt,
  }
}
