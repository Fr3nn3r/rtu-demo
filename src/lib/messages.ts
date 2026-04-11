import type {
  Claim,
  ClaimMessage,
  InboundMessage,
  MessageRole,
  OutboundMessage,
  ThreadToken,
} from '@/types'

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

// ── Simulate reply (stub — full impl in Task 3) ──────────────

export function generateSimulatedReply(
  _claim: Claim,
  _fromRole: MessageRole,
): InboundMessage {
  // Placeholder — filled in Task 3 once simulate-reply-templates exists.
  throw new Error('generateSimulatedReply: not yet implemented (see Task 3)')
}
