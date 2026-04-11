import type { InboundMessage } from '@/types'

const now = Date.now()
function hoursAgo(h: number): string {
  return new Date(now - h * 60 * 60 * 1000).toISOString()
}

export const seedUnmatched: InboundMessage[] = [
  // 1. Assignable — matches CLM-10001 (Sipho Dlamini, Toyota Corolla GP 12 RBF)
  {
    id: 'MSG-UN-001',
    claimId: null,
    direction: 'inbound',
    state: 'received',
    source: 'seeded',
    threadToken: null, // no CP token = unmatched
    from: {
      name: 'Peter Ndlovu',
      email: 'peter@sagelooma.co.za',
      role: 'assessor',
    },
    to: ['claims@rtusa.co.za'],
    subject: 'Re: Toyota Corolla GP 12 RBF — photos attached',
    body:
      `Hi,\n\nAs requested please find attached the damage photos for the 2022 Toyota Corolla Quest, registration GP 12 RBF. The subject line on your original mail didn't have a claim reference, thought I'd send separately so nothing gets lost.\n\nLet me know if you need anything else.\n\nRegards,\nPeter`,
    attachments: [
      { id: 'ATT-001', name: 'damage_photos.zip' },
    ],
    receivedAt: hoursAgo(2),
  },

  // 2. Assignable via SPM number — matches a claim by SPM field
  {
    id: 'MSG-UN-002',
    claimId: null,
    direction: 'inbound',
    state: 'received',
    source: 'seeded',
    threadToken: null,
    from: {
      name: 'Renasa Claims Desk',
      email: 'noreply@renasa.co.za',
      role: 'insurer',
    },
    to: ['claims@rtusa.co.za'],
    subject: 'Claim acknowledged — SPM-9987654',
    body:
      `Dear RTUSA Claims Team,\n\nThis is to confirm that claim SPM-9987654 has been acknowledged on ROC. The reference number is now active in our system.\n\nRegards,\nRenasa Claims Desk (automated)`,
    attachments: [],
    receivedAt: hoursAgo(4),
  },

  // 3. Dismissible — not claim-related
  {
    id: 'MSG-UN-003',
    claimId: null,
    direction: 'inbound',
    state: 'received',
    source: 'seeded',
    threadToken: null,
    from: {
      name: 'SATAWU Communications',
      email: 'info@satawu.org.za',
      role: 'unknown',
    },
    to: ['claims@rtusa.co.za'],
    subject: 'Upcoming taxi industry meeting — Tuesday 15 April',
    body:
      `Dear members,\n\nThis is a reminder that the quarterly taxi industry stakeholder meeting is scheduled for Tuesday 15 April at the SATAWU offices, 10:00. Agenda items include regulatory updates and industry-wide safety initiatives.\n\nRSVP required by Monday.\n\nKind regards,\nSATAWU Communications`,
    attachments: [],
    receivedAt: hoursAgo(6),
  },
]
