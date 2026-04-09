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
  | 'communication_sent'
  | 'communication_generated'
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
export interface DraftCommunication {
  id: string
  claimId: string
  trigger: string
  to: string
  subject: string
  body: string
  sentAt?: string
  createdAt: string
}

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

// ── Claim Action Types (for reducer) ─────────────────────────
export type ClaimAction =
  | { type: 'ADVANCE_WORKFLOW'; claimId: string; toState: WorkflowState; data?: Partial<WorkflowFields> }
  | { type: 'REVERT_WORKFLOW'; claimId: string }
  | { type: 'UPDATE_CLAIM_FIELD'; claimId: string; field: string; value: unknown }
  | { type: 'ADD_CLAIM'; claim: Claim }
  | { type: 'UPDATE_DOCUMENT_STATUS'; claimId: string; docId: string; status: DocumentStatus }
  | { type: 'ADD_COMMUNICATION'; claimId: string; communication: DraftCommunication }
  | { type: 'MARK_COMMUNICATION_SENT'; claimId: string; communicationId: string }
  | { type: 'ADD_AUDIT_ENTRY'; claimId: string; entry: AuditEntry }
  | { type: 'ASSIGN_CLAIM'; claimId: string; assignedTo: string }
  | { type: 'FAST_FORWARD'; hours: number }
