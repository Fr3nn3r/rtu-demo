import type { Claim, ClaimDocument, ClaimMessage, InboundMessage, OutboundMessage, SLARecord, WorkflowState } from '@/types'
import { addHours, subHours } from 'date-fns'

const operators = ['Nikki Pearmain', 'Nombuso Ncube', 'Shanaaz Smith']

function hours(h: number): number {
  return h * 60 * 60 * 1000
}

function makeSLA(state: WorkflowState, slaHours: number, hoursAgo: number, completed?: boolean): SLARecord {
  const enteredAt = new Date(Date.now() - hours(hoursAgo))
  const dueAt = addHours(enteredAt, slaHours)
  return {
    state,
    enteredAt: enteredAt.toISOString(),
    dueAt: dueAt.toISOString(),
    completedAt: completed ? subHours(dueAt, 1).toISOString() : undefined,
  }
}

function makeDocs(type: 'accident' | 'theft' | 'glass'): ClaimDocument[] {
  const now = new Date().toISOString()
  if (type === 'glass') {
    return [
      { id: 'DOC-1', type: 'claim_form', label: 'Glass Claim Form', status: 'received', updatedAt: now },
      { id: 'DOC-2', type: 'drivers_license', label: "Driver's License", status: 'received', updatedAt: now },
      { id: 'DOC-3', type: 'damage_photos', label: 'Damage Photos', status: 'received', updatedAt: now },
    ]
  }
  return [
    { id: 'DOC-1', type: 'claim_form', label: 'Claim Form', status: 'received', updatedAt: now },
    { id: 'DOC-2', type: 'police_report', label: 'Police Report', status: 'received', updatedAt: now },
    { id: 'DOC-3', type: 'id_copy', label: "Owner's ID Copy", status: 'received', updatedAt: now },
    { id: 'DOC-4', type: 'license_disk', label: 'License Disk', status: 'received', updatedAt: now },
    { id: 'DOC-5', type: 'vehicle_registration', label: 'Vehicle Registration', status: 'pending', updatedAt: now },
    { id: 'DOC-6', type: 'drivers_license', label: "Driver's License", status: 'received', updatedAt: now },
  ]
}

let msgCounter = 1000
function nextMsgId(prefix: 'OUT' | 'IN'): string {
  msgCounter++
  return `MSG-${prefix}-${msgCounter}`
}

function makeOutbound(args: {
  claimId: string
  trigger: string
  to: string[]
  subject: string
  body: string
  hoursAfterCreation: number
  claimCreatedAt: string
  sent: boolean
}): OutboundMessage {
  const generatedAt = new Date(new Date(args.claimCreatedAt).getTime() + args.hoursAfterCreation * 60 * 60 * 1000).toISOString()
  return {
    id: nextMsgId('OUT'),
    claimId: args.claimId,
    direction: 'outbound',
    state: args.sent ? 'sent' : 'pending',
    source: 'draft_generated',
    threadToken: `CP-${args.claimId}`,
    trigger: args.trigger,
    from: { name: 'Nikki Pearmain', email: 'nikki@rtusa.co.za', role: 'consultant' },
    to: args.to,
    bcc: ['claims@rtusa.co.za'],
    subject: `[CP-${args.claimId}] ${args.subject}`,
    body: args.body,
    attachments: [],
    generatedAt,
    sentAt: args.sent ? generatedAt : undefined,
  }
}

function makeInbound(args: {
  claimId: string
  fromName: string
  fromEmail: string
  fromRole: 'insured' | 'broker' | 'assessor' | 'investigator' | 'repairer' | 'glass_repairer' | 'insurer'
  subject: string
  body: string
  hoursAfterCreation: number
  claimCreatedAt: string
  attachments?: { id: string; name: string }[]
}): InboundMessage {
  const receivedAt = new Date(new Date(args.claimCreatedAt).getTime() + args.hoursAfterCreation * 60 * 60 * 1000).toISOString()
  return {
    id: nextMsgId('IN'),
    claimId: args.claimId,
    direction: 'inbound',
    state: 'received',
    source: 'seeded',
    threadToken: `CP-${args.claimId}`,
    from: { name: args.fromName, email: args.fromEmail, role: args.fromRole },
    to: ['claims@rtusa.co.za'],
    subject: `Re: [CP-${args.claimId}] ${args.subject}`,
    body: args.body,
    attachments: args.attachments ?? [],
    receivedAt,
  }
}

export const seedClaims: Claim[] = [
  // ── 1. Accident — NEW — Within SLA ─────────────────────────────────────────
  {
    id: 'CLM-10001',
    type: 'accident',
    status: 'NEW',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(2)).toISOString(),
    updatedAt: new Date(Date.now() - hours(2)).toISOString(),
    insured: {
      name: 'Sipho Dlamini',
      company: 'Rea Vaya Fleet Services',
      idNumber: '8501015800089',
      phone: '+27 82 345 6789',
      email: 'sipho.dlamini@reavaya.co.za',
      address: '42 Commissioner Street, Johannesburg CBD, 2001',
    },
    broker: { name: 'Oaksure Financial Services', email: 'claims@oaksure.co.za' },
    driver: { firstName: 'Sipho', lastName: 'Dlamini', idNumber: '8501015800089', phone: '+27 82 345 6789' },
    vehicle: {
      year: 2022,
      make: 'Toyota',
      model: 'Corolla Quest 1.6',
      registration: 'GP 12 RBF',
      vin: 'AHTDB3EE50A123456',
      engineNumber: '1NZFE-112345',
      colour: 'Silver',
      value: 185_000,
      km: 48_000,
    },
    incident: {
      date: new Date(Date.now() - hours(6)).toISOString(),
      location: 'Cnr Bree & Jeppe Street, Johannesburg CBD',
      circumstances: 'Rear-ended at traffic light by unknown vehicle. Other party fled the scene.',
      policeReference: '011-CAS-2026/04/3412',
      policeStation: 'Johannesburg Central SAPS',
    },
    workflow: {},
    slaHistory: [],
    documents: makeDocs('accident'),
    communications: [],
    messages: [],
    auditTrail: [
      {
        id: 'AUD-10001',
        timestamp: new Date(Date.now() - hours(2)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 2. Accident — POLICY_VALIDATION — Approaching SLA (10 of 12 hours) ────
  // messages: POLICY_VALIDATION → 1 outbound ack to insured (sent)
  {
    id: 'CLM-10002',
    type: 'accident',
    status: 'POLICY_VALIDATION',
    assignedTo: operators[1], // Nombuso Ncube
    createdAt: new Date(Date.now() - hours(14)).toISOString(),
    updatedAt: new Date(Date.now() - hours(10)).toISOString(),
    insured: {
      name: 'Thandeka Mthembu',
      company: 'Soweto Star Taxis cc',
      idNumber: '7803125600081',
      phone: '+27 73 456 7890',
      email: 'thandeka@sowetostartaxis.co.za',
      address: '18 Vilakazi Street, Orlando West, Soweto, 1804',
    },
    broker: { name: 'Primak Insurance Brokers', email: 'claims@primak.co.za' },
    driver: { firstName: 'Mandla', lastName: 'Mthembu', idNumber: '9002185800085', phone: '+27 61 234 5678' },
    vehicle: {
      year: 2021,
      make: 'Toyota',
      model: 'Quantum 2.5D-4D GL',
      registration: 'GP 45 NJK',
      vin: 'AHTFR22G200223456',
      engineNumber: '2KD-2234567',
      colour: 'White',
      value: 395_000,
      km: 188_000,
    },
    incident: {
      date: new Date(Date.now() - hours(18)).toISOString(),
      location: 'N1 Highway, Midrand, near Buccleuch Interchange',
      circumstances: 'Lost control on wet road surface, struck centre barrier. No other vehicles involved.',
      policeReference: '012-CAS-2026/04/1102',
      policeStation: 'Midrand SAPS',
    },
    workflow: {},
    slaHistory: [
      makeSLA('NEW', 12, 14, true),
      makeSLA('POLICY_VALIDATION', 12, 10), // 10h into 12h = approaching
    ],
    documents: makeDocs('accident'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10002',
        trigger: 'claim_acknowledged',
        to: ['thandeka@sowetostartaxis.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Thandeka Mthembu,\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number CLM-10002.\n\nWe are currently verifying your policy details and will be in touch shortly.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(14)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10002',
        timestamp: new Date(Date.now() - hours(14)).toISOString(),
        user: operators[1],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10003',
        timestamp: new Date(Date.now() - hours(10)).toISOString(),
        user: operators[1],
        actionType: 'status_changed',
        description: 'Status changed to Policy Validation',
        oldValue: 'NEW',
        newValue: 'POLICY_VALIDATION',
      },
    ],
  },

  // ── 3. Accident — ASSESSOR_APPOINTED — Breached (report 6 hours overdue) ──
  {
    id: 'CLM-10003',
    type: 'accident',
    status: 'ASSESSOR_APPOINTED',
    assignedTo: operators[2], // Shanaaz Smith
    createdAt: new Date(Date.now() - hours(80)).toISOString(),
    updatedAt: new Date(Date.now() - hours(54)).toISOString(),
    insured: {
      name: 'Lwandile Nkosi',
      company: 'Tshwane Taxi Council',
      idNumber: '8206095800083',
      phone: '+27 12 345 6789',
      email: 'lwandile@ttc.co.za',
      address: '125 Church Street, Pretoria CBD, 0002',
    },
    broker: { name: 'Ikhethelo Brokers', email: 'claims@ikhethelo.co.za' },
    driver: { firstName: 'Lucky', lastName: 'Nkosi', idNumber: '9108185800082', phone: '+27 79 876 5432' },
    vehicle: {
      year: 2020,
      make: 'Nissan',
      model: 'Almera 1.5 Acenta',
      registration: 'GP 78 TKL',
      vin: '3N1AB7AP5LL123456',
      engineNumber: 'HR15DE-123456',
      colour: 'White',
      value: 145_000,
      km: 62_000,
    },
    incident: {
      date: new Date(Date.now() - hours(84)).toISOString(),
      location: 'R21 Highway, near OR Tambo International Airport',
      circumstances: 'Side collision with delivery truck changing lanes without signalling.',
      policeReference: '011-CAS-2026/04/3456',
      policeStation: 'Kempton Park SAPS',
    },
    workflow: {
      policyNumber: 'POL-ALM-2020-0781',
      spmClaimNumber: 'SPM-2026-04-0781',
      assessorId: 'CON-001',
    },
    slaHistory: [
      makeSLA('NEW', 12, 80, true),
      makeSLA('POLICY_VALIDATION', 12, 72, true),
      makeSLA('REGISTERED', 4, 64, true),
      makeSLA('ASSESSOR_APPOINTED', 12, 60, true),  // appointment SLA
      makeSLA('ASSESSOR_APPOINTED', 48, 54),         // 54h into 48h report SLA = breached
    ],
    documents: makeDocs('accident'),
    communications: [
      {
        id: 'COM-10003',
        claimId: 'CLM-10003',
        trigger: 'assessor_appointed',
        recipient: 'provider',
        to: 'pieter@assessments.co.za',
        subject: 'Assessment Required — CLM-10003 | Nissan Almera 1.5 Acenta',
        body: 'Dear Pieter van der Merwe,\n\nPlease note that claim CLM-10003 requires your assessment.\n\nVehicle: 2020 Nissan Almera 1.5 Acenta (GP 78 TKL)\nIncident: Side collision on R21 Highway near OR Tambo\nInsured: Lwandile Nkosi\n\nPlease submit your report within 48 hours.\n\nRegards,\nRTU Insurance Services',
        sentAt: new Date(Date.now() - hours(53)).toISOString(),
        createdAt: new Date(Date.now() - hours(54)).toISOString(),
      },
    ],
    messages: [
      makeOutbound({
        claimId: 'CLM-10003',
        trigger: 'claim_acknowledged',
        to: ['lwandile@ttc.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Lwandile Nkosi,\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number CLM-10003.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(80)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10003',
        trigger: 'broker_acknowledged',
        to: ['claims@ikhethelo.co.za'],
        subject: 'New Claim Registered',
        body: 'Dear Ikhethelo Brokers,\n\nWe have registered a new accident claim for your client Lwandile Nkosi. Reference: CLM-10003.\n\nVehicle: 2020 Nissan Almera 1.5 Acenta (GP 78 TKL)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(80)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10003',
        trigger: 'assessor_appointed',
        to: ['pieter@assessments.co.za'],
        subject: 'Assessment Required — 2020 Nissan Almera 1.5 Acenta',
        body: 'Dear Pieter,\n\nWe have appointed you to assess the damage to a 2020 Nissan Almera 1.5 Acenta, registration GP 78 TKL. Please attend within 48 hours and revert with the report.\n\nInsured: Lwandile Nkosi\nIncident: Side collision on R21 Highway near OR Tambo International Airport\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(80)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10004',
        timestamp: new Date(Date.now() - hours(80)).toISOString(),
        user: operators[2],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10005',
        timestamp: new Date(Date.now() - hours(54)).toISOString(),
        user: operators[2],
        actionType: 'contact_assigned',
        description: 'Assessor appointed: Pieter van der Merwe',
      },
    ],
  },

  // ── 4. Accident — ASSESSMENT_RECEIVED — Within SLA ─────────────────────────
  {
    id: 'CLM-10004',
    type: 'accident',
    status: 'ASSESSMENT_RECEIVED',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(120)).toISOString(),
    updatedAt: new Date(Date.now() - hours(10)).toISOString(),
    insured: {
      name: 'Bongani Sithole',
      company: 'Phoenix Taxi Association',
      idNumber: '7510205800087',
      phone: '+27 31 567 8901',
      email: 'bongani@phoenixtaxi.co.za',
      address: '5 Chatsworth Main Road, Chatsworth, Durban, 4092',
    },
    broker: { name: 'Taccsure Insurance Brokers', email: 'claims@taccsure.co.za' },
    driver: { firstName: 'Bongani', lastName: 'Sithole', idNumber: '7510205800087', phone: '+27 31 567 8901' },
    vehicle: {
      year: 2021,
      make: 'Toyota',
      model: 'Etios 1.5 Xi',
      registration: 'ND 33 PKL',
      vin: 'MBJZ8BP3J00234567',
      engineNumber: '1NRFE-234567',
      colour: 'White',
      value: 155_000,
      km: 54_000,
    },
    incident: {
      date: new Date(Date.now() - hours(124)).toISOString(),
      location: 'M7 Higginson Highway, Chatsworth, Durban',
      circumstances: 'Rear collision at pedestrian crossing. Bumper and tailgate damage.',
      policeReference: '031-CAS-2026/04/1234',
      policeStation: 'Chatsworth SAPS',
    },
    workflow: {
      policyNumber: 'POL-ETS-2021-0334',
      spmClaimNumber: 'SPM-2026-04-0334',
      assessorId: 'CON-002',
      assessedAmount: 22_500,
      excessAmount: 3_500,
    },
    slaHistory: [
      makeSLA('NEW', 12, 120, true),
      makeSLA('POLICY_VALIDATION', 12, 112, true),
      makeSLA('REGISTERED', 4, 104, true),
      makeSLA('ASSESSOR_APPOINTED', 12, 98, true),
      makeSLA('ASSESSOR_APPOINTED', 48, 92, true),
      makeSLA('ASSESSMENT_RECEIVED', 48, 10), // 10h into 48h = within
    ],
    documents: [
      ...makeDocs('accident'),
      { id: 'DOC-7', type: 'assessment_report', label: 'Assessment Report — Brandon Stein', status: 'received', updatedAt: new Date(Date.now() - hours(10)).toISOString() },
    ],
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10004',
        trigger: 'claim_acknowledged',
        to: ['bongani@phoenixtaxi.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Bongani Sithole,\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number CLM-10004.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10004',
        trigger: 'broker_acknowledged',
        to: ['claims@taccsure.co.za'],
        subject: 'New Claim Registered',
        body: 'Dear Taccsure Insurance Brokers,\n\nWe have registered a new accident claim for your client Bongani Sithole. Reference: CLM-10004.\n\nVehicle: 2021 Toyota Etios 1.5 Xi (ND 33 PKL)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10004',
        trigger: 'assessor_appointed',
        to: ['thandiwe@motorassess.co.za'],
        subject: 'Assessment Required — 2021 Toyota Etios 1.5 Xi',
        body: 'Dear Thandiwe,\n\nWe have appointed you to assess the damage to a 2021 Toyota Etios 1.5 Xi, registration ND 33 PKL. Please attend within 48 hours and revert with the report.\n\nInsured: Bongani Sithole\nIncident: Rear collision on M7 Higginson Highway, Chatsworth\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
      makeInbound({
        claimId: 'CLM-10004',
        fromName: 'Thandiwe Nkosi',
        fromEmail: 'thandiwe@motorassess.co.za',
        fromRole: 'assessor',
        subject: 'Assessment Required — 2021 Toyota Etios 1.5 Xi',
        body: 'Hi,\n\nConfirmed. I will be on-site tomorrow morning. Will send through the full assessment report by end of day.\n\nRegards,\nThandiwe',
        hoursAfterCreation: 6,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10006',
        timestamp: new Date(Date.now() - hours(120)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 5. Accident — INTERNAL_APPROVAL — Approaching (3.5 of 4 hours) ─────────
  {
    id: 'CLM-10005',
    type: 'accident',
    status: 'INTERNAL_APPROVAL',
    assignedTo: operators[1], // Nombuso Ncube
    createdAt: new Date(Date.now() - hours(200)).toISOString(),
    updatedAt: new Date(Date.now() - hours(3.5)).toISOString(),
    insured: {
      name: 'Patricia Mokoena',
      company: 'Tshwane Minibus Holdings',
      idNumber: '8102065800084',
      phone: '+27 12 567 8901',
      email: 'patricia@tshwaneminibus.co.za',
      address: '88 Paul Kruger Street, Pretoria, 0002',
    },
    broker: { name: 'Synergy Risk Managers', email: 'claims@synergyriskmgrs.co.za' },
    driver: { firstName: 'Samuel', lastName: 'Mokoena', idNumber: '9505125800080', phone: '+27 72 345 6789' },
    vehicle: {
      year: 2019,
      make: 'VW',
      model: 'Caddy 2.0TDI',
      registration: 'GP 99 UVB',
      vin: 'WV2ZZZ2KZLX098765',
      engineNumber: 'CFHC-098765',
      colour: 'Silver',
      value: 215_000,
      km: 175_000,
    },
    incident: {
      date: new Date(Date.now() - hours(204)).toISOString(),
      location: 'Hendrik Verwoerd Drive, Centurion, Pretoria',
      circumstances: 'T-bone collision at intersection. Other driver ran a red light.',
      policeReference: '012-CAS-2026/04/4567',
      policeStation: 'Centurion SAPS',
    },
    workflow: {
      policyNumber: 'POL-CDY-2019-0099',
      spmClaimNumber: 'SPM-2026-04-0099',
      assessorId: 'CON-002',
      assessedAmount: 45_000,
      excessAmount: 5_000,
    },
    slaHistory: [
      makeSLA('NEW', 12, 200, true),
      makeSLA('POLICY_VALIDATION', 12, 190, true),
      makeSLA('REGISTERED', 4, 182, true),
      makeSLA('ASSESSOR_APPOINTED', 12, 176, true),
      makeSLA('ASSESSOR_APPOINTED', 48, 164, true),
      makeSLA('ASSESSMENT_RECEIVED', 48, 30, true),
      makeSLA('INTERNAL_APPROVAL', 4, 3.5), // 3.5h into 4h = approaching
    ],
    documents: [
      ...makeDocs('accident'),
      { id: 'DOC-7', type: 'assessment_report', label: 'Assessment Report — Thandiwe Nkosi', status: 'received', updatedAt: new Date(Date.now() - hours(30)).toISOString() },
    ],
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10005',
        trigger: 'claim_acknowledged',
        to: ['patricia@tshwaneminibus.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Patricia Mokoena,\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number CLM-10005.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(200)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10005',
        trigger: 'broker_acknowledged',
        to: ['claims@synergyriskmgrs.co.za'],
        subject: 'New Claim Registered',
        body: 'Dear Synergy Risk Managers,\n\nWe have registered a new accident claim for your client Patricia Mokoena. Reference: CLM-10005.\n\nVehicle: 2019 VW Caddy 2.0TDI (GP 99 UVB)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(200)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10005',
        trigger: 'assessor_appointed',
        to: ['thandiwe@motorassess.co.za'],
        subject: 'Assessment Required — 2019 VW Caddy 2.0TDI',
        body: 'Dear Thandiwe,\n\nWe have appointed you to assess the damage to a 2019 VW Caddy 2.0TDI, registration GP 99 UVB. Please attend within 48 hours and revert with the report.\n\nInsured: Patricia Mokoena\nIncident: T-bone collision at intersection on Hendrik Verwoerd Drive, Centurion\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(200)).toISOString(),
        sent: true,
      }),
      makeInbound({
        claimId: 'CLM-10005',
        fromName: 'Thandiwe Nkosi',
        fromEmail: 'thandiwe@motorassess.co.za',
        fromRole: 'assessor',
        subject: 'Assessment Required — 2019 VW Caddy 2.0TDI',
        body: 'Hi,\n\nNoted. I will attend the vehicle tomorrow and submit the assessment report by close of business.\n\nRegards,\nThandiwe',
        hoursAfterCreation: 6,
        claimCreatedAt: new Date(Date.now() - hours(200)).toISOString(),
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10007',
        timestamp: new Date(Date.now() - hours(200)).toISOString(),
        user: operators[1],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 6. Accident — INSPECTION_FINAL_COSTING — Within SLA ────────────────────
  {
    id: 'CLM-10006',
    type: 'accident',
    status: 'INSPECTION_FINAL_COSTING',
    assignedTo: operators[2], // Shanaaz Smith
    createdAt: new Date(Date.now() - hours(300)).toISOString(),
    updatedAt: new Date(Date.now() - hours(6)).toISOString(),
    insured: {
      name: 'Abdul Moosa',
      company: 'Gateway Shuttle Co',
      idNumber: '7709105800088',
      phone: '+27 11 789 0123',
      email: 'abdul@gatewayshuttle.co.za',
      address: '55 Rivonia Road, Sandton, 2196',
    },
    broker: { name: 'Oaksure Financial Services', email: 'claims@oaksure.co.za' },
    driver: { firstName: 'Abdul', lastName: 'Moosa', idNumber: '7709105800088', phone: '+27 11 789 0123' },
    vehicle: {
      year: 2022,
      make: 'Toyota',
      model: 'Quantum 2.5D-4D GL',
      registration: 'GP 34 XYZ',
      vin: 'AHTFR22G200345678',
      engineNumber: '2KD-3456789',
      colour: 'White',
      value: 410_000,
      km: 132_000,
    },
    incident: {
      date: new Date(Date.now() - hours(304)).toISOString(),
      location: 'William Nicol Drive, Sandton, at Bryanston intersection',
      circumstances: 'Struck by vehicle failing to yield. Front-left quarter panel and bumper damage.',
      policeReference: '011-CAS-2026/04/8901',
      policeStation: 'Sandton SAPS',
    },
    workflow: {
      policyNumber: 'POL-QTM-2022-0345',
      spmClaimNumber: 'SPM-2026-04-0345',
      assessorId: 'CON-003',
      assessedAmount: 58_000,
      excessAmount: 7_500,
      repairerId: 'CON-006',
      routeType: 'repair',
    },
    slaHistory: [
      makeSLA('NEW', 12, 300, true),
      makeSLA('POLICY_VALIDATION', 12, 290, true),
      makeSLA('REGISTERED', 4, 282, true),
      makeSLA('ASSESSOR_APPOINTED', 12, 276, true),
      makeSLA('ASSESSOR_APPOINTED', 48, 264, true),
      makeSLA('ASSESSMENT_RECEIVED', 48, 180, true),
      makeSLA('INTERNAL_APPROVAL', 4, 60, true),
      makeSLA('AOL', 12, 20, true),
      makeSLA('INSPECTION_FINAL_COSTING', 12, 6), // 6h into 12h = within
    ],
    documents: makeDocs('accident'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10006',
        trigger: 'claim_acknowledged',
        to: ['abdul@gatewayshuttle.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Abdul Moosa,\n\nThank you for submitting your claim. We confirm receipt and have assigned it reference number CLM-10006.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(300)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10006',
        trigger: 'broker_acknowledged',
        to: ['claims@oaksure.co.za'],
        subject: 'New Claim Registered',
        body: 'Dear Oaksure Financial Services,\n\nWe have registered a new accident claim for your client Abdul Moosa. Reference: CLM-10006.\n\nVehicle: 2022 Toyota Quantum 2.5D-4D GL (GP 34 XYZ)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(300)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10006',
        trigger: 'assessor_appointed',
        to: ['rajesh@autoassess.co.za'],
        subject: 'Assessment Required — 2022 Toyota Quantum 2.5D-4D GL',
        body: 'Dear Rajesh,\n\nWe have appointed you to assess the damage to a 2022 Toyota Quantum 2.5D-4D GL, registration GP 34 XYZ. Please attend within 48 hours and revert with the report.\n\nInsured: Abdul Moosa\nIncident: Collision on William Nicol Drive, Sandton\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(300)).toISOString(),
        sent: true,
      }),
      makeInbound({
        claimId: 'CLM-10006',
        fromName: 'Rajesh Govender',
        fromEmail: 'rajesh@autoassess.co.za',
        fromRole: 'assessor',
        subject: 'Assessment Required — 2022 Toyota Quantum 2.5D-4D GL',
        body: 'Hi,\n\nConfirmed. I will inspect the vehicle tomorrow and submit my report within 24 hours of inspection.\n\nRegards,\nRajesh',
        hoursAfterCreation: 6,
        claimCreatedAt: new Date(Date.now() - hours(300)).toISOString(),
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10008',
        timestamp: new Date(Date.now() - hours(300)).toISOString(),
        user: operators[2],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 7. Accident — CLOSED ────────────────────────────────────────────────────
  {
    id: 'CLM-10007',
    type: 'accident',
    status: 'CLOSED',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(504)).toISOString(),
    updatedAt: new Date(Date.now() - hours(168)).toISOString(),
    insured: {
      name: 'Lwazi Mkhize',
      company: 'eThekwini Transport Holdings',
      idNumber: '8607025800081',
      phone: '+27 31 456 7890',
      email: 'lwazi@ethekwini-transport.co.za',
      address: '77 Dr Pixley Ka Seme Street, Durban CBD, 4001',
    },
    broker: { name: 'Primak Insurance Brokers', email: 'claims@primak.co.za' },
    driver: { firstName: 'Lwazi', lastName: 'Mkhize', idNumber: '8607025800081', phone: '+27 31 456 7890' },
    vehicle: {
      year: 2020,
      make: 'Nissan',
      model: 'NV350 Impendulo 2.5i',
      registration: 'ND 01 GHI',
      vin: 'JN1TBNT30Z0654321',
      engineNumber: 'QR25-654321',
      colour: 'White',
      value: 360_000,
      km: 190_000,
    },
    incident: {
      date: new Date(Date.now() - hours(510)).toISOString(),
      location: 'M4 Ruth First Highway, Durban North',
      circumstances: 'Collision with stationary vehicle. Front-end and bumper damage.',
      policeReference: '031-CAS-2026/04/5678',
      policeStation: 'Durban North SAPS',
    },
    workflow: {
      policyNumber: 'POL-NV3-2020-0001',
      spmClaimNumber: 'SPM-2026-04-0001',
      assessorId: 'CON-003',
      assessedAmount: 18_500,
      excessAmount: 6_000,
      repairerId: 'CON-007',
      routeType: 'repair',
      finalCostAmount: 17_800,
      repairComplete: true,
    },
    slaHistory: [
      makeSLA('NEW', 12, 504, true),
      makeSLA('POLICY_VALIDATION', 12, 496, true),
      makeSLA('REGISTERED', 4, 488, true),
      makeSLA('ASSESSOR_APPOINTED', 12, 480, true),
      makeSLA('ASSESSOR_APPOINTED', 48, 470, true),
      makeSLA('ASSESSMENT_RECEIVED', 48, 400, true),
      makeSLA('INTERNAL_APPROVAL', 4, 350, true),
      makeSLA('AOL', 12, 300, true),
      makeSLA('INSPECTION_FINAL_COSTING', 12, 250, true),
      makeSLA('REPAIR_IN_PROGRESS', 168, 200, true),
    ],
    documents: makeDocs('accident'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10007',
        trigger: 'claim_closed',
        to: ['lwazi@ethekwini-transport.co.za'],
        subject: 'Claim Closed — Repair Completed',
        body: 'Dear Lwazi Mkhize,\n\nWe are pleased to confirm that your claim CLM-10007 has been closed. The repair to your 2020 Nissan NV350 Impendulo (ND 01 GHI) has been completed and the vehicle returned.\n\nThank you for your patience throughout this process.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(504)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10009',
        timestamp: new Date(Date.now() - hours(504)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10010',
        timestamp: new Date(Date.now() - hours(168)).toISOString(),
        user: operators[0],
        actionType: 'status_changed',
        description: 'Claim closed — repair completed',
        oldValue: 'REPAIR_IN_PROGRESS',
        newValue: 'CLOSED',
      },
    ],
  },

  // ── 8. Theft — INVESTIGATOR_APPOINTED — Within SLA ─────────────────────────
  {
    id: 'CLM-10008',
    type: 'theft',
    status: 'INVESTIGATOR_APPOINTED',
    assignedTo: operators[1], // Nombuso Ncube
    createdAt: new Date(Date.now() - hours(120)).toISOString(),
    updatedAt: new Date(Date.now() - hours(72)).toISOString(),
    insured: {
      name: 'Thulani Zulu',
      company: 'KZN Express Taxis',
      idNumber: '8805155800086',
      phone: '+27 33 456 7890',
      email: 'thulani@kznexpress.co.za',
      address: '15 Longmarket Street, Pietermaritzburg, 3201',
    },
    broker: { name: 'Ikhethelo Brokers', email: 'claims@ikhethelo.co.za' },
    driver: { firstName: 'Thulani', lastName: 'Zulu', idNumber: '8805155800086', phone: '+27 33 456 7890' },
    vehicle: {
      year: 2023,
      make: 'Toyota',
      model: 'Quantum 2.5D-4D GL',
      registration: 'ND 56 RST',
      vin: 'AHTFR22G200567890',
      engineNumber: '2KD-5678901',
      colour: 'White',
      value: 480_000,
      km: 28_000,
    },
    incident: {
      date: new Date(Date.now() - hours(124)).toISOString(),
      location: 'Pietermaritzburg CBD Taxi Rank, Church Street',
      circumstances: 'Vehicle hijacked at gunpoint while loading passengers. Driver was unharmed.',
      policeReference: '033-CAS-2026/04/2567',
      policeStation: 'Pietermaritzburg Central SAPS',
    },
    workflow: {
      policyNumber: 'POL-QTM-2023-0568',
      spmClaimNumber: 'SPM-2026-04-0568',
      investigatorId: 'CON-004',
    },
    slaHistory: [
      makeSLA('NEW', 12, 120, true),
      makeSLA('POLICY_VALIDATION', 12, 112, true),
      makeSLA('REGISTERED', 4, 104, true),
      makeSLA('INVESTIGATOR_APPOINTED', 12, 96, true),
      makeSLA('INVESTIGATOR_APPOINTED', 336, 72), // 72h into 336h = within (~21%)
    ],
    documents: makeDocs('theft'),
    communications: [
      {
        id: 'COM-10008',
        claimId: 'CLM-10008',
        trigger: 'investigator_appointed',
        recipient: 'provider',
        to: 'sipho@investigate.co.za',
        subject: 'Investigation Required — CLM-10008 | Toyota Quantum 2.5D-4D GL',
        body: 'Dear Sipho Dlamini,\n\nPlease investigate claim CLM-10008 (vehicle theft/hijacking).\n\nVehicle: 2023 Toyota Quantum 2.5D-4D GL (ND 56 RST)\nIncident: Hijacking at Pietermaritzburg taxi rank\nInsured: Thulani Zulu\n\nPlease submit your report within 14 days.\n\nRegards,\nRTU Insurance Services',
        sentAt: new Date(Date.now() - hours(71)).toISOString(),
        createdAt: new Date(Date.now() - hours(72)).toISOString(),
      },
    ],
    messages: [
      makeOutbound({
        claimId: 'CLM-10008',
        trigger: 'claim_acknowledged',
        to: ['thulani@kznexpress.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Thulani Zulu,\n\nThank you for submitting your theft claim. We confirm receipt and have assigned it reference number CLM-10008.\n\nWe are sorry to hear about the hijacking and are treating this matter urgently.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10008',
        trigger: 'broker_acknowledged',
        to: ['claims@ikhethelo.co.za'],
        subject: 'New Theft Claim Registered',
        body: 'Dear Ikhethelo Brokers,\n\nWe have registered a new theft/hijacking claim for your client Thulani Zulu. Reference: CLM-10008.\n\nVehicle: 2023 Toyota Quantum 2.5D-4D GL (ND 56 RST)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10008',
        trigger: 'investigator_appointed',
        to: ['sipho@investigate.co.za'],
        subject: 'Investigation Required — 2023 Toyota Quantum 2.5D-4D GL',
        body: 'Dear Sipho,\n\nWe have appointed you to investigate a vehicle hijacking. Please contact the insured and submit your report within 14 days.\n\nInsured: Thulani Zulu\nVehicle: 2023 Toyota Quantum 2.5D-4D GL (ND 56 RST)\nIncident: Hijacking at Pietermaritzburg CBD Taxi Rank on Church Street\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(120)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10011',
        timestamp: new Date(Date.now() - hours(120)).toISOString(),
        user: operators[1],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 9. Glass — NEW — Within SLA ────────────────────────────────────────────
  {
    id: 'CLM-10009',
    type: 'glass',
    status: 'NEW',
    assignedTo: operators[2], // Shanaaz Smith
    createdAt: new Date(Date.now() - hours(1)).toISOString(),
    updatedAt: new Date(Date.now() - hours(1)).toISOString(),
    insured: {
      name: 'Fatima Ismail',
      idNumber: '9003205800085',
      phone: '+27 11 890 1234',
      email: 'fatima.ismail@gmail.com',
      address: '10 Oxford Road, Rosebank, Johannesburg, 2196',
    },
    broker: { name: 'Oaksure Financial Services', email: 'claims@oaksure.co.za' },
    driver: { firstName: 'Fatima', lastName: 'Ismail', idNumber: '9003205800085', phone: '+27 11 890 1234' },
    vehicle: {
      year: 2021,
      make: 'Toyota',
      model: 'Corolla Quest 1.6',
      registration: 'GP 90 DEF',
      vin: 'AHTDB3EE50A901234',
      engineNumber: '1NZFE-901234',
      colour: 'White',
      value: 178_000,
      km: 41_000,
    },
    incident: {
      date: new Date(Date.now() - hours(3)).toISOString(),
      location: 'N12 Highway, Johannesburg West',
      circumstances: 'Stone chip from passing truck caused windscreen crack extending across the glass.',
      vehicleLocation: 'Rosebank — 10 Oxford Road',
      causeOfLoss: 'Stone chip',
    },
    workflow: {},
    slaHistory: [],
    documents: makeDocs('glass'),
    communications: [],
    messages: [],
    auditTrail: [
      {
        id: 'AUD-10012',
        timestamp: new Date(Date.now() - hours(1)).toISOString(),
        user: operators[2],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 10. Glass — POLICY_VALIDATION — Within SLA ─────────────────────────────
  {
    id: 'CLM-10010',
    type: 'glass',
    status: 'POLICY_VALIDATION',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(16)).toISOString(),
    updatedAt: new Date(Date.now() - hours(6)).toISOString(),
    insured: {
      name: 'Nkosi Mthethwa',
      idNumber: '8804125800082',
      phone: '+27 11 234 5678',
      email: 'nkosi.mthethwa@gmail.com',
      address: '33 West Street, Boksburg, 1459',
    },
    broker: { name: 'Taccsure Insurance Brokers', email: 'claims@taccsure.co.za' },
    driver: { firstName: 'Nkosi', lastName: 'Mthethwa', idNumber: '8804125800082', phone: '+27 11 234 5678' },
    vehicle: {
      year: 2022,
      make: 'Toyota',
      model: 'Etios 1.5 Xi',
      registration: 'GP 22 QRS',
      vin: 'MBJZ8BP3J00345678',
      engineNumber: '1NRFE-345678',
      colour: 'Silver',
      value: 158_000,
      km: 37_000,
    },
    incident: {
      date: new Date(Date.now() - hours(20)).toISOString(),
      location: 'R21 Highway, Boksburg, heading toward OR Tambo',
      circumstances: 'Windscreen cracked by stone debris kicked up from construction vehicle.',
      vehicleLocation: 'Boksburg — 33 West Street',
      causeOfLoss: 'Stone chip',
    },
    workflow: {},
    slaHistory: [
      makeSLA('NEW', 12, 16, true),
      makeSLA('POLICY_VALIDATION', 12, 6), // 6h into 12h = within
    ],
    documents: makeDocs('glass'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10010',
        trigger: 'claim_acknowledged',
        to: ['nkosi.mthethwa@gmail.com'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Nkosi Mthethwa,\n\nThank you for submitting your glass claim. We confirm receipt and have assigned it reference number CLM-10010.\n\nWe are currently verifying your policy details and will be in touch shortly.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(16)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10013',
        timestamp: new Date(Date.now() - hours(16)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 11. Glass — REGISTERED — Within SLA ────────────────────────────────────
  {
    id: 'CLM-10011',
    type: 'glass',
    status: 'REGISTERED',
    assignedTo: operators[1], // Nombuso Ncube
    createdAt: new Date(Date.now() - hours(36)).toISOString(),
    updatedAt: new Date(Date.now() - hours(2)).toISOString(),
    insured: {
      name: 'Reshma Naidoo',
      idNumber: '9205285800083',
      phone: '+27 31 678 9012',
      email: 'reshma.naidoo@gmail.com',
      address: '8 Musgrave Road, Berea, Durban, 4001',
    },
    broker: { name: 'Primak Insurance Brokers', email: 'claims@primak.co.za' },
    driver: { firstName: 'Reshma', lastName: 'Naidoo', idNumber: '9205285800083', phone: '+27 31 678 9012' },
    vehicle: {
      year: 2020,
      make: 'Nissan',
      model: 'Almera 1.5 Acenta',
      registration: 'ND 88 KLM',
      vin: '3N1AB7AP5LL345678',
      engineNumber: 'HR15DE-345678',
      colour: 'White',
      value: 138_000,
      km: 55_000,
    },
    incident: {
      date: new Date(Date.now() - hours(38)).toISOString(),
      location: 'N2 Highway, Durban South',
      circumstances: 'Side window shattered by rock thrown from bridge overpass.',
      vehicleLocation: 'Berea — 8 Musgrave Road',
      causeOfLoss: 'Vandalism',
    },
    workflow: {
      policyNumber: 'POL-ALM-2020-0889',
      spmClaimNumber: 'SPM-2026-04-0889',
    },
    slaHistory: [
      makeSLA('NEW', 12, 36, true),
      makeSLA('POLICY_VALIDATION', 12, 28, true),
      makeSLA('REGISTERED', 4, 2), // 2h into 4h = within
    ],
    documents: makeDocs('glass'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10011',
        trigger: 'claim_acknowledged',
        to: ['reshma.naidoo@gmail.com'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Reshma Naidoo,\n\nThank you for submitting your glass claim. We confirm receipt and have assigned it reference number CLM-10011.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(36)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10011',
        trigger: 'broker_acknowledged',
        to: ['claims@primak.co.za'],
        subject: 'New Glass Claim Registered',
        body: 'Dear Primak Insurance Brokers,\n\nWe have registered a new glass claim for your client Reshma Naidoo. Reference: CLM-10011.\n\nVehicle: 2020 Nissan Almera 1.5 Acenta (ND 88 KLM)\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(36)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10014',
        timestamp: new Date(Date.now() - hours(36)).toISOString(),
        user: operators[1],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
    ],
  },

  // ── 12. Glass — GLASS_REPAIRER_APPOINTED — Breached ────────────────────────
  {
    id: 'CLM-10012',
    type: 'glass',
    status: 'GLASS_REPAIRER_APPOINTED',
    assignedTo: operators[2], // Shanaaz Smith
    createdAt: new Date(Date.now() - hours(56)).toISOString(),
    updatedAt: new Date(Date.now() - hours(18)).toISOString(),
    insured: {
      name: 'Johannes Ferreira',
      company: 'Centurion Courier Services',
      idNumber: '7912145800087',
      phone: '+27 12 345 6789',
      email: 'jferreira@centurioncourier.co.za',
      address: '102 Jean Avenue, Centurion, 0157',
    },
    broker: { name: 'Synergy Risk Managers', email: 'claims@synergyriskmgrs.co.za' },
    driver: { firstName: 'Johannes', lastName: 'Ferreira', idNumber: '7912145800087', phone: '+27 12 345 6789' },
    vehicle: {
      year: 2021,
      make: 'Toyota',
      model: 'Quantum 2.5D-4D GL',
      registration: 'GP 21 ABF',
      vin: 'AHTFR22G200112345',
      engineNumber: '2KD-1123456',
      colour: 'White',
      value: 390_000,
      km: 147_000,
    },
    incident: {
      date: new Date(Date.now() - hours(60)).toISOString(),
      location: 'N1 Highway, Centurion, near Bosman Street off-ramp',
      circumstances: 'Windscreen cracked by gravel flung from construction truck ahead.',
      vehicleLocation: 'Centurion — 102 Jean Avenue',
      causeOfLoss: 'Stone chip',
    },
    workflow: {
      policyNumber: 'POL-QTM-2021-0211',
      spmClaimNumber: 'SPM-2026-04-0211',
      glassRepairerId: 'CON-008',
    },
    slaHistory: [
      makeSLA('NEW', 12, 56, true),
      makeSLA('POLICY_VALIDATION', 12, 48, true),
      makeSLA('REGISTERED', 4, 40, true),
      makeSLA('GLASS_REPAIRER_APPOINTED', 12, 18), // 18h into 12h = breached
    ],
    documents: makeDocs('glass'),
    communications: [
      {
        id: 'COM-10012',
        claimId: 'CLM-10012',
        trigger: 'glass_repairer_appointed',
        recipient: 'provider',
        to: 'claims@autoglasssa.co.za',
        subject: 'Glass Replacement Required — CLM-10012 | Toyota Quantum 2.5D-4D GL',
        body: 'Dear Autoglass Centurion,\n\nPlease attend to windscreen replacement for claim CLM-10012.\n\nVehicle: 2021 Toyota Quantum 2.5D-4D GL (GP 21 ABF)\nGlass: Windscreen\nVehicle Location: Centurion — 102 Jean Avenue\n\nPlease complete within 12 hours.\n\nRegards,\nRTU Insurance Services',
        sentAt: new Date(Date.now() - hours(17)).toISOString(),
        createdAt: new Date(Date.now() - hours(18)).toISOString(),
      },
    ],
    messages: [
      makeOutbound({
        claimId: 'CLM-10012',
        trigger: 'claim_acknowledged',
        to: ['jferreira@centurioncourier.co.za'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Johannes Ferreira,\n\nThank you for submitting your glass claim. We confirm receipt and have assigned it reference number CLM-10012.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(56)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10012',
        trigger: 'glass_repairer_dispatched',
        to: ['claims@pgglass.co.za'],
        subject: 'Glass Replacement Required — 2021 Toyota Quantum 2.5D-4D GL',
        body: 'Dear PG Glass Johannesburg,\n\nWe have appointed you for a windscreen replacement for claim CLM-10012.\n\nVehicle: 2021 Toyota Quantum 2.5D-4D GL (GP 21 ABF)\nVehicle Location: Centurion — 102 Jean Avenue\nInsured: Johannes Ferreira\n\nPlease complete within 12 hours and confirm.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(56)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10015',
        timestamp: new Date(Date.now() - hours(56)).toISOString(),
        user: operators[2],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10016',
        timestamp: new Date(Date.now() - hours(18)).toISOString(),
        user: operators[2],
        actionType: 'contact_assigned',
        description: 'Glass repairer appointed: Autoglass Centurion',
      },
    ],
  },

  // ── 13. Glass — GLASS_REPAIRER_APPOINTED — Within SLA ──────────────────────
  {
    id: 'CLM-10013',
    type: 'glass',
    status: 'GLASS_REPAIRER_APPOINTED',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(40)).toISOString(),
    updatedAt: new Date(Date.now() - hours(4)).toISOString(),
    insured: {
      name: 'Anele Khumalo',
      idNumber: '9307085800081',
      phone: '+27 11 456 7890',
      email: 'anele.khumalo@gmail.com',
      address: '22 Oxford Road, Illovo, Johannesburg, 2196',
    },
    broker: { name: 'Ikhethelo Brokers', email: 'claims@ikhethelo.co.za' },
    driver: { firstName: 'Anele', lastName: 'Khumalo', idNumber: '9307085800081', phone: '+27 11 456 7890' },
    vehicle: {
      year: 2022,
      make: 'Toyota',
      model: 'Corolla Quest 1.6',
      registration: 'GP 55 TLK',
      vin: 'AHTDB3EE50A556789',
      engineNumber: '1NZFE-556789',
      colour: 'Black',
      value: 190_000,
      km: 29_000,
    },
    incident: {
      date: new Date(Date.now() - hours(42)).toISOString(),
      location: 'William Nicol Drive, Fourways, Johannesburg',
      circumstances: 'Rear windscreen cracked by falling object in parking area.',
      vehicleLocation: 'Illovo — 22 Oxford Road',
      causeOfLoss: 'Crack',
    },
    workflow: {
      policyNumber: 'POL-CQL-2022-0556',
      spmClaimNumber: 'SPM-2026-04-0556',
      glassRepairerId: 'CON-009',
    },
    slaHistory: [
      makeSLA('NEW', 12, 40, true),
      makeSLA('POLICY_VALIDATION', 12, 32, true),
      makeSLA('REGISTERED', 4, 24, true),
      makeSLA('GLASS_REPAIRER_APPOINTED', 12, 4), // 4h into 12h = within
    ],
    documents: makeDocs('glass'),
    communications: [
      {
        id: 'COM-10013',
        claimId: 'CLM-10013',
        trigger: 'glass_repairer_appointed',
        recipient: 'provider',
        to: 'claims@pgglass.co.za',
        subject: 'Glass Replacement Required — CLM-10013 | Toyota Corolla Quest 1.6',
        body: 'Dear PG Glass Illovo,\n\nPlease attend to glass replacement for claim CLM-10013.\n\nVehicle: 2022 Toyota Corolla Quest 1.6 (GP 55 TLK)\nGlass: Rear windscreen\nVehicle Location: Illovo — 22 Oxford Road\n\nPlease complete within 12 hours.\n\nRegards,\nRTU Insurance Services',
        sentAt: new Date(Date.now() - hours(3.5)).toISOString(),
        createdAt: new Date(Date.now() - hours(4)).toISOString(),
      },
    ],
    messages: [
      makeOutbound({
        claimId: 'CLM-10013',
        trigger: 'claim_acknowledged',
        to: ['anele.khumalo@gmail.com'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Anele Khumalo,\n\nThank you for submitting your glass claim. We confirm receipt and have assigned it reference number CLM-10013.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(40)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10013',
        trigger: 'glass_repairer_dispatched',
        to: ['service@autoglass.co.za'],
        subject: 'Glass Replacement Required — 2022 Toyota Corolla Quest 1.6',
        body: 'Dear Autoglass Durban,\n\nWe have appointed you for a rear windscreen replacement for claim CLM-10013.\n\nVehicle: 2022 Toyota Corolla Quest 1.6 (GP 55 TLK)\nVehicle Location: Illovo — 22 Oxford Road\nInsured: Anele Khumalo\n\nPlease complete within 12 hours and confirm.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(40)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10017',
        timestamp: new Date(Date.now() - hours(40)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10018',
        timestamp: new Date(Date.now() - hours(4)).toISOString(),
        user: operators[0],
        actionType: 'contact_assigned',
        description: 'Glass repairer appointed: PG Glass Illovo',
      },
    ],
  },

  // ── 14. Glass — REPAIR_COMPLETE ─────────────────────────────────────────────
  {
    id: 'CLM-10014',
    type: 'glass',
    status: 'REPAIR_COMPLETE',
    assignedTo: operators[1], // Nombuso Ncube
    createdAt: new Date(Date.now() - hours(72)).toISOString(),
    updatedAt: new Date(Date.now() - hours(4)).toISOString(),
    insured: {
      name: 'Maryam van Wyk',
      idNumber: '8610285800084',
      phone: '+27 21 345 6789',
      email: 'maryam.vanwyk@gmail.com',
      address: '15 Beach Road, Mouille Point, Cape Town, 8005',
    },
    broker: { name: 'Oaksure Financial Services', email: 'claims@oaksure.co.za' },
    driver: { firstName: 'Maryam', lastName: 'van Wyk', idNumber: '8610285800084', phone: '+27 21 345 6789' },
    vehicle: {
      year: 2020,
      make: 'Toyota',
      model: 'Etios 1.5 Xi',
      registration: 'CA 44 LKP',
      vin: 'MBJZ8BP3J00445678',
      engineNumber: '1NRFE-445678',
      colour: 'Red',
      value: 142_000,
      km: 67_000,
    },
    incident: {
      date: new Date(Date.now() - hours(75)).toISOString(),
      location: 'N2 Highway, Cape Town, near Borcherds Quarry',
      circumstances: 'Windscreen chipped by stone from the road surface. Chip spread to a crack overnight.',
      vehicleLocation: 'Mouille Point — 15 Beach Road',
      causeOfLoss: 'Stone chip',
    },
    workflow: {
      policyNumber: 'POL-ETS-2020-0445',
      spmClaimNumber: 'SPM-2026-04-0445',
      glassRepairerId: 'CON-009',
    },
    slaHistory: [
      makeSLA('NEW', 12, 72, true),
      makeSLA('POLICY_VALIDATION', 12, 64, true),
      makeSLA('REGISTERED', 4, 56, true),
      makeSLA('GLASS_REPAIRER_APPOINTED', 12, 20, true),
    ],
    documents: makeDocs('glass'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10014',
        trigger: 'claim_acknowledged',
        to: ['maryam.vanwyk@gmail.com'],
        subject: 'Acknowledgement of Receipt',
        body: 'Dear Maryam van Wyk,\n\nThank you for submitting your glass claim. We confirm receipt and have assigned it reference number CLM-10014.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(72)).toISOString(),
        sent: true,
      }),
      makeOutbound({
        claimId: 'CLM-10014',
        trigger: 'glass_repairer_dispatched',
        to: ['service@autoglass.co.za'],
        subject: 'Glass Replacement Required — 2020 Toyota Etios 1.5 Xi',
        body: 'Dear Autoglass Durban,\n\nWe have appointed you for a windscreen replacement for claim CLM-10014.\n\nVehicle: 2020 Toyota Etios 1.5 Xi (CA 44 LKP)\nVehicle Location: Mouille Point — 15 Beach Road\nInsured: Maryam van Wyk\n\nPlease complete within 12 hours and confirm.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 3,
        claimCreatedAt: new Date(Date.now() - hours(72)).toISOString(),
        sent: true,
      }),
      makeInbound({
        claimId: 'CLM-10014',
        fromName: 'Autoglass Durban',
        fromEmail: 'service@autoglass.co.za',
        fromRole: 'glass_repairer',
        subject: 'Glass Replacement Required — 2020 Toyota Etios 1.5 Xi',
        body: 'Hi,\n\nWindscreen replacement for CLM-10014 has been completed. Vehicle CA 44 LKP is ready for collection at Mouille Point.\n\nRegards,\nAutoglass Durban',
        hoursAfterCreation: 4,
        claimCreatedAt: new Date(Date.now() - hours(72)).toISOString(),
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10019',
        timestamp: new Date(Date.now() - hours(72)).toISOString(),
        user: operators[1],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10020',
        timestamp: new Date(Date.now() - hours(4)).toISOString(),
        user: operators[1],
        actionType: 'status_changed',
        description: 'Glass repair completed',
        oldValue: 'GLASS_REPAIRER_APPOINTED',
        newValue: 'REPAIR_COMPLETE',
      },
    ],
  },

  // ── 15. Glass — CLOSED ──────────────────────────────────────────────────────
  {
    id: 'CLM-10015',
    type: 'glass',
    status: 'CLOSED',
    assignedTo: operators[2], // Shanaaz Smith
    createdAt: new Date(Date.now() - hours(240)).toISOString(),
    updatedAt: new Date(Date.now() - hours(168)).toISOString(),
    insured: {
      name: 'Pieter du Plessis',
      company: 'Du Plessis Deliveries cc',
      idNumber: '7604125800086',
      phone: '+27 12 678 9012',
      email: 'pieter@duplessisdeliveries.co.za',
      address: '19 Pretoria Street, Arcadia, Pretoria, 0083',
    },
    broker: { name: 'Taccsure Insurance Brokers', email: 'claims@taccsure.co.za' },
    driver: { firstName: 'Pieter', lastName: 'du Plessis', idNumber: '7604125800086', phone: '+27 12 678 9012' },
    vehicle: {
      year: 2019,
      make: 'Toyota',
      model: 'Corolla Quest 1.6',
      registration: 'GP 19 PRK',
      vin: 'AHTDB3EE50A190123',
      engineNumber: '1NZFE-190123',
      colour: 'Blue',
      value: 152_000,
      km: 88_000,
    },
    incident: {
      date: new Date(Date.now() - hours(244)).toISOString(),
      location: 'N4 Highway, Pretoria East',
      circumstances: 'Windscreen cracked due to temperature differential — defrost applied to cold glass.',
      vehicleLocation: 'Arcadia — 19 Pretoria Street',
      causeOfLoss: 'Crack',
    },
    workflow: {
      policyNumber: 'POL-CQL-2019-0191',
      spmClaimNumber: 'SPM-2026-04-0191',
      glassRepairerId: 'CON-008',
    },
    slaHistory: [
      makeSLA('NEW', 12, 240, true),
      makeSLA('POLICY_VALIDATION', 12, 232, true),
      makeSLA('REGISTERED', 4, 224, true),
      makeSLA('GLASS_REPAIRER_APPOINTED', 12, 200, true),
    ],
    documents: makeDocs('glass'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10015',
        trigger: 'claim_closed',
        to: ['pieter@duplessisdeliveries.co.za'],
        subject: 'Claim Closed — Glass Repair Completed',
        body: 'Dear Pieter du Plessis,\n\nWe are pleased to confirm that your claim CLM-10015 has been closed. The windscreen replacement on your 2019 Toyota Corolla Quest 1.6 (GP 19 PRK) has been completed.\n\nThank you for your patience.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(240)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10021',
        timestamp: new Date(Date.now() - hours(240)).toISOString(),
        user: operators[2],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10022',
        timestamp: new Date(Date.now() - hours(168)).toISOString(),
        user: operators[2],
        actionType: 'status_changed',
        description: 'Claim closed — glass repair completed and confirmed',
        oldValue: 'REPAIR_COMPLETE',
        newValue: 'CLOSED',
      },
    ],
  },

  // ── 16. Glass — CLOSED ──────────────────────────────────────────────────────
  {
    id: 'CLM-10016',
    type: 'glass',
    status: 'CLOSED',
    assignedTo: operators[0], // Nikki Pearmain
    createdAt: new Date(Date.now() - hours(336)).toISOString(),
    updatedAt: new Date(Date.now() - hours(240)).toISOString(),
    insured: {
      name: 'Sunita Pillay',
      idNumber: '8501255800083',
      phone: '+27 31 789 0123',
      email: 'sunita.pillay@gmail.com',
      address: '3 Sparks Road, Overport, Durban, 4091',
    },
    broker: { name: 'Primak Insurance Brokers', email: 'claims@primak.co.za' },
    driver: { firstName: 'Sunita', lastName: 'Pillay', idNumber: '8501255800083', phone: '+27 31 789 0123' },
    vehicle: {
      year: 2021,
      make: 'Nissan',
      model: 'Almera 1.5 Acenta',
      registration: 'ND 21 FGH',
      vin: '3N1AB7AP5LL567890',
      engineNumber: 'HR15DE-567890',
      colour: 'White',
      value: 145_000,
      km: 44_000,
    },
    incident: {
      date: new Date(Date.now() - hours(340)).toISOString(),
      location: 'M4 Ruth First Highway, Durban, near Umgeni Road',
      circumstances: 'Stone chip from construction vehicle caused windscreen crack spreading to passenger side.',
      vehicleLocation: 'Overport — 3 Sparks Road',
      causeOfLoss: 'Stone chip',
    },
    workflow: {
      policyNumber: 'POL-ALM-2021-0213',
      spmClaimNumber: 'SPM-2026-04-0213',
      glassRepairerId: 'CON-009',
    },
    slaHistory: [
      makeSLA('NEW', 12, 336, true),
      makeSLA('POLICY_VALIDATION', 12, 328, true),
      makeSLA('REGISTERED', 4, 320, true),
      makeSLA('GLASS_REPAIRER_APPOINTED', 12, 290, true),
    ],
    documents: makeDocs('glass'),
    communications: [],
    messages: [
      makeOutbound({
        claimId: 'CLM-10016',
        trigger: 'claim_closed',
        to: ['sunita.pillay@gmail.com'],
        subject: 'Claim Closed — Glass Repair Completed',
        body: 'Dear Sunita Pillay,\n\nWe are pleased to confirm that your claim CLM-10016 has been closed. The windscreen replacement on your 2021 Nissan Almera 1.5 Acenta (ND 21 FGH) has been completed.\n\nThank you for your patience.\n\nRegards,\nRTU Insurance Services',
        hoursAfterCreation: 1,
        claimCreatedAt: new Date(Date.now() - hours(336)).toISOString(),
        sent: true,
      }),
    ] satisfies ClaimMessage[],
    auditTrail: [
      {
        id: 'AUD-10023',
        timestamp: new Date(Date.now() - hours(336)).toISOString(),
        user: operators[0],
        actionType: 'claim_created',
        description: 'Claim created from uploaded form',
      },
      {
        id: 'AUD-10024',
        timestamp: new Date(Date.now() - hours(240)).toISOString(),
        user: operators[0],
        actionType: 'status_changed',
        description: 'Claim closed — glass repair completed and confirmed',
        oldValue: 'REPAIR_COMPLETE',
        newValue: 'CLOSED',
      },
    ],
  },
]
