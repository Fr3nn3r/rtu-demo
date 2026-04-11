// ── Claim Types ──────────────────────────────────────────────
export type ClaimType = 'accident' | 'theft' | 'glass'

// ── Workflow States ──────────────────────────────────────────
export type WorkflowState =
  | 'NEW'
  | 'POLICY_VALIDATION'
  | 'INVALID'
  | 'REGISTERED'
  | 'ASSESSOR_APPOINTED'
  | 'ASSESSMENT_RECEIVED'
  | 'INVESTIGATOR_APPOINTED'
  | 'INVESTIGATION_RECEIVED'
  | 'WITHIN_EXCESS'
  | 'INTERNAL_APPROVAL'
  | 'QA_APPOINTED'
  | 'QA_DECISION'
  | 'REJECTED'
  | 'AOL'
  | 'ROUTE_TYPE'
  | 'INSPECTION_FINAL_COSTING'
  | 'REPAIR_IN_PROGRESS'
  | 'TOTAL_LOSS'
  | 'SETTLEMENT_CONFIRMED'
  | 'SALVAGE_IN_PROGRESS'
  | 'GLASS_REPAIRER_APPOINTED'
  | 'REPAIR_COMPLETE'
  | 'CLOSED'

// ── SLA Status ───────────────────────────────────────────────
export type SLAStatus = 'within' | 'approaching' | 'breached'

// ── Contact Roles ────────────────────────────────────────────
export type ContactRole = 'assessor' | 'investigator' | 'repairer' | 'glass_repairer'

// ── Document Types ───────────────────────────────────────────
export type DocumentType =
  | 'claim_form'
  | 'police_report'
  | 'id_copy'
  | 'license_disk'
  | 'vehicle_registration'
  | 'drivers_license'
  | 'trip_log'
  | 'damage_photos'
  | 'assessment_report'
  | 'investigation_report'
  | 'rejection_docs'
  | 'other'

export type DocumentStatus = 'pending' | 'received' | 'not_required'

// ── Audit Action Types ───────────────────────────────────────
export type AuditActionType =
  | 'claim_created'
  | 'status_changed'
  | 'field_updated'
  | 'document_updated'
  | 'contact_assigned'
  | 'communication_sent'       // KEEP — removed in cleanup task
  | 'communication_generated'  // KEEP — removed in cleanup task
  | 'message_generated'        // NEW
  | 'message_sent'             // NEW
  | 'message_received'         // NEW
  | 'message_assigned'         // NEW
  | 'sla_warning'
  | 'sla_breached'
  | 'note_added'

// ── Contact ──────────────────────────────────────────────────
export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: ContactRole
}

// ── Document ─────────────────────────────────────────────────
export interface ClaimDocument {
  id: string
  type: DocumentType
  label: string
  status: DocumentStatus
  updatedAt: string
}

// ── Audit Entry ──────────────────────────────────────────────
export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  actionType: AuditActionType
  description: string
  oldValue?: string
  newValue?: string
}

// ── Draft Communication ──────────────────────────────────────
export type CommunicationRecipient = 'insured' | 'broker' | 'provider'

export interface DraftCommunication {
  id: string
  claimId: string
  trigger: string
  recipient: CommunicationRecipient
  to: string
  subject: string
  body: string
  sentAt?: string
  createdAt: string
}

// ── Thread tokens ────────────────────────────────────────────
// Every message carries a stable token matching the pattern CP-{ClaimID}
// e.g. "CP-CLM-10001". Outbound drafts embed this in the Subject line;
// simulated inbound replies preserve it (threading); seeded unmatched
// messages deliberately lack it (that's why they are unmatched).
export type ThreadToken = string

// ── Message participants ─────────────────────────────────────
export type MessageRole =
  | 'consultant'
  | 'insured'
  | 'broker'
  | 'assessor'
  | 'investigator'
  | 'repairer'
  | 'glass_repairer'
  | 'insurer'
  | 'unknown'

export interface MessageParticipant {
  name: string
  email: string
  role: MessageRole
}

// ── Message attachments ──────────────────────────────────────
export interface MessageAttachment {
  id: string
  name: string
  documentId?: string // set when auto-attached to claim.documents
}

// ── Outbound message ─────────────────────────────────────────
export interface OutboundMessage {
  id: string
  claimId: string
  direction: 'outbound'
  state: 'pending' | 'sent'
  source: 'draft_generated'
  threadToken: ThreadToken
  trigger: string

  from: MessageParticipant
  to: string[]
  cc?: string[]
  bcc: string[] // includes claims@rtusa.co.za

  subject: string // includes [${threadToken}] prefix
  body: string
  attachments: MessageAttachment[]

  generatedAt: string
  sentAt?: string
}

// ── Inbound message ──────────────────────────────────────────
export interface InboundMessage {
  id: string
  claimId: string | null // null when in unmatched tray
  direction: 'inbound'
  state: 'received'
  source: 'seeded' | 'simulated' | 'unmatched_assigned'
  threadToken: ThreadToken | null

  from: MessageParticipant
  to: string[]

  subject: string
  body: string
  attachments: MessageAttachment[]

  receivedAt: string
}

// ── Discriminated union ──────────────────────────────────────
export type ClaimMessage = OutboundMessage | InboundMessage

// ── Insured Details ──────────────────────────────────────────
export interface InsuredDetails {
  name: string
  company?: string
  idNumber: string
  phone: string
  email?: string
  address?: string
}

// ── Broker Details ───────────────────────────────────────────
export interface BrokerDetails {
  name: string
  email: string
}

// ── Driver Details ───────────────────────────────────────────
export interface DriverDetails {
  firstName: string
  lastName: string
  idNumber: string
  phone: string
}

// ── Vehicle Details ──────────────────────────────────────────
export interface VehicleDetails {
  year: number
  make: string
  model: string
  registration: string
  vin: string
  engineNumber?: string
  colour?: string
  value?: number
  km?: number
}

// ── Finance Details (accident/theft only) ────────────────────
export interface FinanceDetails {
  company: string
  accountNumber: string
  outstandingAmount: number
}

// ── Incident Details ─────────────────────────────────────────
export interface IncidentDetails {
  date: string
  time?: string
  location: string
  circumstances: string
  policeReference?: string
  policeStation?: string
  vehicleLocation?: string
  causeOfLoss?: string
}

// ── Anti-Theft Device Details ────────────────────────────────
export interface AntiTheftDetails {
  hasDevice: boolean
  deviceMake?: string
  fittedBy?: string
}

// ── Workflow Fields ──────────────────────────────────────────
export interface WorkflowFields {
  policyNumber?: string
  spmClaimNumber?: string
  excessAmount?: number
  assessedAmount?: number
  assessorId?: string
  investigatorId?: string
  qaAssessorId?: string
  glassRepairerId?: string
  repairerId?: string
  rejectionReason?: string
  rejectionDocs?: boolean
  routeType?: 'repair' | 'total_loss'
  finalCostAmount?: number
  settlementAmount?: number
  settlementConfirmed?: boolean
  salvageComplete?: boolean
  repairComplete?: boolean
}

// ── SLA Record ───────────────────────────────────────────────
export interface SLARecord {
  state: WorkflowState
  enteredAt: string
  dueAt: string
  completedAt?: string
}

// ── The Claim (top-level aggregate) ──────────────────────────
export interface Claim {
  id: string
  type: ClaimType
  status: WorkflowState
  assignedTo: string
  createdAt: string
  updatedAt: string

  insured: InsuredDetails
  broker: BrokerDetails
  driver: DriverDetails
  vehicle: VehicleDetails
  finance?: FinanceDetails
  incident: IncidentDetails
  antiTheft?: AntiTheftDetails

  workflow: WorkflowFields
  slaHistory: SLARecord[]
  documents: ClaimDocument[]
  communications: DraftCommunication[]
  messages: ClaimMessage[]
  auditTrail: AuditEntry[]
}

// ── Workflow Step Definition ─────────────────────────────────
export interface StepDefinition {
  state: WorkflowState
  label: string
  shortLabel: string
  slaHours: number | null
  isBridgeStep: boolean
  bridgeSystem?: 'nimbis' | 'roc'
  description: string
  contactType?: ContactRole
}

// ── Workflow Definition ──────────────────────────────────────
export interface WorkflowDefinition {
  claimType: ClaimType
  steps: StepDefinition[]
  transitions: Partial<Record<WorkflowState, WorkflowState[]>>
}

// ── Dashboard Stats ──────────────────────────────────────────
export interface DashboardStats {
  activeClaims: number
  breachedSLAs: number
  newThisMonth: number
  closedThisMonth: number
  avgDaysToClose: number
}

// ── Historical Claim (for trend charts) ─────────────────────
export type HistoricalClaimStatus = 'settled' | 'rejected' | 'not_taken_up' | 'within_excess' | 'no_cover' | 'open'

export type TimePeriod = '1W' | '1M' | '1Y'

export interface HistoricalClaim {
  id: string
  type: ClaimType
  createdAt: string
  closedAt: string | null
  daysToClose: number | null
  settlementAmount: number
  handler: string
  province: string
  status: HistoricalClaimStatus
  slaCompliant: boolean
}

// ── Claim Action Types (for reducer) ─────────────────────────
export type ClaimAction =
  | { type: 'ADVANCE_WORKFLOW'; claimId: string; toState: WorkflowState; data?: Partial<WorkflowFields> }
  | { type: 'REVERT_WORKFLOW'; claimId: string }
  | { type: 'UPDATE_CLAIM_FIELD'; claimId: string; field: string; value: unknown }
  | { type: 'ADD_CLAIM'; claim: Claim }
  | { type: 'UPDATE_DOCUMENT_STATUS'; claimId: string; docId: string; status: DocumentStatus }
  | { type: 'ADD_COMMUNICATION'; claimId: string; communication: DraftCommunication } // KEEP
  | { type: 'MARK_COMMUNICATION_SENT'; claimId: string; communicationId: string }     // KEEP
  | { type: 'ADD_AUDIT_ENTRY'; claimId: string; entry: AuditEntry }
  | { type: 'ASSIGN_CLAIM'; claimId: string; assignedTo: string }
  | { type: 'FAST_FORWARD'; hours: number }
  // NEW message actions:
  | { type: 'ADD_MESSAGE'; claimId: string; message: ClaimMessage }
  | { type: 'MARK_MESSAGE_SENT'; claimId: string; messageId: string }
  | { type: 'SIMULATE_INBOUND_REPLY'; claimId: string; fromRole: MessageRole }
  | { type: 'ASSIGN_UNMATCHED_TO_CLAIM'; messageId: string; targetClaimId: string }
  | { type: 'DISMISS_UNMATCHED'; messageId: string }
