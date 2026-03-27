import type { ClaimType, StepDefinition, WorkflowDefinition, WorkflowState } from '@/types'

// ── Step definitions for ACCIDENT workflow ───────────────────
const accidentSteps: StepDefinition[] = [
  {
    state: 'NEW',
    label: 'New Claim',
    shortLabel: 'New',
    slaHours: null,
    isBridgeStep: false,
    description: 'Review extracted claim data, correct errors, and confirm creation.',
  },
  {
    state: 'POLICY_VALIDATION',
    label: 'Policy Validation',
    shortLabel: 'Policy',
    slaHours: 12,
    isBridgeStep: true,
    bridgeSystem: 'nimbus',
    description: 'Look up the policy on Nimbus. Enter the policy number and excess amount, then confirm validity.',
  },
  {
    state: 'REGISTERED',
    label: 'Registered',
    shortLabel: 'Register',
    slaHours: null, // included in policy validation SLA
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Register the claim on Rock. Enter the SPM claim number and confirm registration.',
  },
  {
    state: 'ASSESSOR_APPOINTED',
    label: 'Assessor Appointed',
    shortLabel: 'Assessor',
    slaHours: 12,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Select an assessor from the list and confirm appointment on Rock.',
    contactType: 'assessor',
  },
  {
    state: 'ASSESSMENT_RECEIVED',
    label: 'Assessment Received',
    shortLabel: 'Assessment',
    slaHours: 48,
    isBridgeStep: false,
    description: 'Enter the assessed amount from the assessor report and upload the report.',
  },
  {
    state: 'WITHIN_EXCESS',
    label: 'Within Excess',
    shortLabel: 'Within Exc.',
    slaHours: null,
    isBridgeStep: false,
    description: 'The assessed amount is within the excess. Draft notification to policyholder and broker.',
  },
  {
    state: 'INTERNAL_APPROVAL',
    label: 'Internal Approval',
    shortLabel: 'Approval',
    slaHours: 24,
    isBridgeStep: false,
    description: 'Review claim details and approve or reject.',
  },
  {
    state: 'QA_APPOINTED',
    label: 'QA Appointed',
    shortLabel: 'QA Appt.',
    slaHours: 6,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Appoint QA on Rock. Await QA decision.',
  },
  {
    state: 'QA_DECISION',
    label: 'QA Decision',
    shortLabel: 'QA Dec.',
    slaHours: 6,
    isBridgeStep: false,
    description: 'QA approves or rejects the claim.',
  },
  {
    state: 'REJECTED',
    label: 'Rejected',
    shortLabel: 'Rejected',
    slaHours: 12,
    isBridgeStep: false,
    description: 'Upload supporting documents, enter rejection reason, and draft notification.',
  },
  {
    state: 'AOL',
    label: 'AOL Generated',
    shortLabel: 'AOL',
    slaHours: null,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Confirm that the Authority of Loss has been generated on Rock.',
  },
  {
    state: 'ROUTE_TYPE',
    label: 'Route Decision',
    shortLabel: 'Route',
    slaHours: null,
    isBridgeStep: false,
    description: 'Select whether this claim is a repair or total loss.',
  },
  {
    state: 'INSPECTION_FINAL_COSTING',
    label: 'Inspection & Costing',
    shortLabel: 'Inspect',
    slaHours: 12,
    isBridgeStep: false,
    description: 'Confirm final cost from the repairer/assessor after inspection.',
  },
  {
    state: 'REPAIR_IN_PROGRESS',
    label: 'Repair in Progress',
    shortLabel: 'Repair',
    slaHours: 168, // 7 days default
    isBridgeStep: false,
    description: 'Track repair progress. Mark complete when done.',
  },
  {
    state: 'TOTAL_LOSS',
    label: 'Total Loss',
    shortLabel: 'Total Loss',
    slaHours: null,
    isBridgeStep: false,
    description: 'Send AOL and request Natis documents from insured and broker.',
  },
  {
    state: 'SETTLEMENT_CONFIRMED',
    label: 'Settlement',
    shortLabel: 'Settlement',
    slaHours: null,
    isBridgeStep: false,
    description: 'Confirm settlement has been issued and receipt acknowledged.',
  },
  {
    state: 'SALVAGE_IN_PROGRESS',
    label: 'Salvage',
    shortLabel: 'Salvage',
    slaHours: 168,
    isBridgeStep: false,
    description: 'Track salvage process. Mark complete when done.',
  },
  {
    state: 'INVALID',
    label: 'Invalid Policy',
    shortLabel: 'Invalid',
    slaHours: null,
    isBridgeStep: false,
    description: 'Policy is invalid. Draft notification to policyholder.',
  },
  {
    state: 'CLOSED',
    label: 'Closed',
    shortLabel: 'Closed',
    slaHours: null,
    isBridgeStep: false,
    description: 'Claim is closed.',
  },
]

// ── Accident transitions ─────────────────────────────────────
const accidentTransitions: Partial<Record<WorkflowState, WorkflowState[]>> = {
  NEW: ['POLICY_VALIDATION'],
  POLICY_VALIDATION: ['REGISTERED', 'INVALID'],
  INVALID: ['CLOSED'],
  REGISTERED: ['ASSESSOR_APPOINTED'],
  ASSESSOR_APPOINTED: ['ASSESSMENT_RECEIVED'],
  ASSESSMENT_RECEIVED: ['WITHIN_EXCESS', 'INTERNAL_APPROVAL', 'QA_APPOINTED'],
  WITHIN_EXCESS: ['CLOSED'],
  INTERNAL_APPROVAL: ['AOL', 'REJECTED'],
  QA_APPOINTED: ['QA_DECISION'],
  QA_DECISION: ['AOL', 'REJECTED'],
  REJECTED: ['CLOSED'],
  AOL: ['ROUTE_TYPE'],
  ROUTE_TYPE: ['INSPECTION_FINAL_COSTING', 'TOTAL_LOSS'],
  INSPECTION_FINAL_COSTING: ['REPAIR_IN_PROGRESS'],
  REPAIR_IN_PROGRESS: ['CLOSED'],
  TOTAL_LOSS: ['SETTLEMENT_CONFIRMED'],
  SETTLEMENT_CONFIRMED: ['SALVAGE_IN_PROGRESS'],
  SALVAGE_IN_PROGRESS: ['CLOSED'],
  CLOSED: [],
}

// ── Step definitions for THEFT workflow ──────────────────────
const theftSteps: StepDefinition[] = [
  {
    state: 'NEW',
    label: 'New Claim',
    shortLabel: 'New',
    slaHours: null,
    isBridgeStep: false,
    description: 'Review extracted claim data, correct errors, and confirm creation.',
  },
  {
    state: 'POLICY_VALIDATION',
    label: 'Policy Validation',
    shortLabel: 'Policy',
    slaHours: 12,
    isBridgeStep: true,
    bridgeSystem: 'nimbus',
    description: 'Look up the policy on Nimbus. Enter the policy number and excess amount, then confirm validity.',
  },
  {
    state: 'REGISTERED',
    label: 'Registered',
    shortLabel: 'Register',
    slaHours: null,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Register the claim on Rock. Enter the SPM claim number and confirm registration.',
  },
  {
    state: 'INVESTIGATOR_APPOINTED',
    label: 'Investigator Appointed',
    shortLabel: 'Investigator',
    slaHours: 12,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Select an investigator from the list and confirm appointment on Rock.',
    contactType: 'investigator',
  },
  {
    state: 'INVESTIGATION_RECEIVED',
    label: 'Investigation Received',
    shortLabel: 'Investigation',
    slaHours: 336, // 14 days
    isBridgeStep: false,
    description: 'Enter the assessed amount from the investigation report and upload the report.',
  },
  {
    state: 'WITHIN_EXCESS',
    label: 'Within Excess',
    shortLabel: 'Within Exc.',
    slaHours: null,
    isBridgeStep: false,
    description: 'The assessed amount is within the excess. Draft notification to policyholder and broker.',
  },
  {
    state: 'INTERNAL_APPROVAL',
    label: 'Internal Approval',
    shortLabel: 'Approval',
    slaHours: 24,
    isBridgeStep: false,
    description: 'Review claim details and approve or reject.',
  },
  {
    state: 'QA_APPOINTED',
    label: 'QA Appointed',
    shortLabel: 'QA Appt.',
    slaHours: 6,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Appoint QA on Rock. Await QA decision.',
  },
  {
    state: 'QA_DECISION',
    label: 'QA Decision',
    shortLabel: 'QA Dec.',
    slaHours: 6,
    isBridgeStep: false,
    description: 'QA approves or rejects the claim.',
  },
  {
    state: 'REJECTED',
    label: 'Rejected',
    shortLabel: 'Rejected',
    slaHours: 12,
    isBridgeStep: false,
    description: 'Upload supporting documents, enter rejection reason, and draft notification.',
  },
  {
    state: 'AOL',
    label: 'AOL Generated',
    shortLabel: 'AOL',
    slaHours: null,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Confirm that the Authority of Loss has been generated on Rock.',
  },
  {
    state: 'ROUTE_TYPE',
    label: 'Route Decision',
    shortLabel: 'Route',
    slaHours: null,
    isBridgeStep: false,
    description: 'Select whether this claim is a repair or total loss.',
  },
  {
    state: 'INSPECTION_FINAL_COSTING',
    label: 'Inspection & Costing',
    shortLabel: 'Inspect',
    slaHours: 12,
    isBridgeStep: false,
    description: 'Confirm final cost from the repairer/assessor after inspection.',
  },
  {
    state: 'REPAIR_IN_PROGRESS',
    label: 'Repair in Progress',
    shortLabel: 'Repair',
    slaHours: 168,
    isBridgeStep: false,
    description: 'Track repair progress. Mark complete when done.',
  },
  {
    state: 'TOTAL_LOSS',
    label: 'Total Loss',
    shortLabel: 'Total Loss',
    slaHours: null,
    isBridgeStep: false,
    description: 'Send AOL and request Natis documents from insured and broker.',
  },
  {
    state: 'SETTLEMENT_CONFIRMED',
    label: 'Settlement',
    shortLabel: 'Settlement',
    slaHours: null,
    isBridgeStep: false,
    description: 'Confirm settlement has been issued and receipt acknowledged.',
  },
  {
    state: 'SALVAGE_IN_PROGRESS',
    label: 'Salvage',
    shortLabel: 'Salvage',
    slaHours: 168,
    isBridgeStep: false,
    description: 'Track salvage process. Mark complete when done.',
  },
  {
    state: 'INVALID',
    label: 'Invalid Policy',
    shortLabel: 'Invalid',
    slaHours: null,
    isBridgeStep: false,
    description: 'Policy is invalid. Draft notification to policyholder.',
  },
  {
    state: 'CLOSED',
    label: 'Closed',
    shortLabel: 'Closed',
    slaHours: null,
    isBridgeStep: false,
    description: 'Claim is closed.',
  },
]

// ── Theft transitions ────────────────────────────────────────
const theftTransitions: Partial<Record<WorkflowState, WorkflowState[]>> = {
  NEW: ['POLICY_VALIDATION'],
  POLICY_VALIDATION: ['REGISTERED', 'INVALID'],
  INVALID: ['CLOSED'],
  REGISTERED: ['INVESTIGATOR_APPOINTED'],
  INVESTIGATOR_APPOINTED: ['INVESTIGATION_RECEIVED'],
  INVESTIGATION_RECEIVED: ['WITHIN_EXCESS', 'INTERNAL_APPROVAL', 'QA_APPOINTED'],
  WITHIN_EXCESS: ['CLOSED'],
  INTERNAL_APPROVAL: ['AOL', 'REJECTED'],
  QA_APPOINTED: ['QA_DECISION'],
  QA_DECISION: ['AOL', 'REJECTED'],
  REJECTED: ['CLOSED'],
  AOL: ['ROUTE_TYPE'],
  ROUTE_TYPE: ['INSPECTION_FINAL_COSTING', 'TOTAL_LOSS'],
  INSPECTION_FINAL_COSTING: ['REPAIR_IN_PROGRESS'],
  REPAIR_IN_PROGRESS: ['CLOSED'],
  TOTAL_LOSS: ['SETTLEMENT_CONFIRMED'],
  SETTLEMENT_CONFIRMED: ['SALVAGE_IN_PROGRESS'],
  SALVAGE_IN_PROGRESS: ['CLOSED'],
  CLOSED: [],
}

// ── Step definitions for GLASS workflow ──────────────────────
const glassSteps: StepDefinition[] = [
  {
    state: 'NEW',
    label: 'New Claim',
    shortLabel: 'New',
    slaHours: null,
    isBridgeStep: false,
    description: 'Review extracted claim data, correct errors, and confirm creation.',
  },
  {
    state: 'POLICY_VALIDATION',
    label: 'Policy Validation',
    shortLabel: 'Policy',
    slaHours: 12,
    isBridgeStep: true,
    bridgeSystem: 'nimbus',
    description: 'Look up the policy on Nimbus. Enter the policy number and excess amount, then confirm validity.',
  },
  {
    state: 'REGISTERED',
    label: 'Registered',
    shortLabel: 'Register',
    slaHours: null,
    isBridgeStep: true,
    bridgeSystem: 'rock',
    description: 'Register the claim on Rock. Enter the SPM claim number and confirm registration.',
  },
  {
    state: 'GLASS_REPAIRER_APPOINTED',
    label: 'Glass Repairer Appointed',
    shortLabel: 'Repairer',
    slaHours: 12,
    isBridgeStep: false,
    description: 'Select a glass repairer from the list and dispatch to the vehicle location.',
    contactType: 'glass_repairer',
  },
  {
    state: 'REPAIR_COMPLETE',
    label: 'Repair Complete',
    shortLabel: 'Complete',
    slaHours: null,
    isBridgeStep: false,
    description: 'Confirm the glass replacement has been completed.',
  },
  {
    state: 'INVALID',
    label: 'Invalid Policy',
    shortLabel: 'Invalid',
    slaHours: null,
    isBridgeStep: false,
    description: 'Policy is invalid. Draft notification to policyholder.',
  },
  {
    state: 'CLOSED',
    label: 'Closed',
    shortLabel: 'Closed',
    slaHours: null,
    isBridgeStep: false,
    description: 'Claim is closed.',
  },
]

// ── Glass transitions ────────────────────────────────────────
const glassTransitions: Partial<Record<WorkflowState, WorkflowState[]>> = {
  NEW: ['POLICY_VALIDATION'],
  POLICY_VALIDATION: ['REGISTERED', 'INVALID'],
  INVALID: ['CLOSED'],
  REGISTERED: ['GLASS_REPAIRER_APPOINTED'],
  GLASS_REPAIRER_APPOINTED: ['REPAIR_COMPLETE'],
  REPAIR_COMPLETE: ['CLOSED'],
  CLOSED: [],
}

// ── Workflow definitions map ─────────────────────────────────
export const workflowDefinitions: Record<ClaimType, WorkflowDefinition> = {
  accident: {
    claimType: 'accident',
    steps: accidentSteps,
    transitions: accidentTransitions,
  },
  theft: {
    claimType: 'theft',
    steps: theftSteps,
    transitions: theftTransitions,
  },
  glass: {
    claimType: 'glass',
    steps: glassSteps,
    transitions: glassTransitions,
  },
}

// ── Helper: Get step definition by state ─────────────────────
export function getStepDef(claimType: ClaimType, state: WorkflowState): StepDefinition | undefined {
  return workflowDefinitions[claimType].steps.find(s => s.state === state)
}

// ── Helper: Get the primary linear path for stepper display ──
// Returns the "happy path" steps excluding branching alternatives
export function getLinearPath(claimType: ClaimType): WorkflowState[] {
  const paths: Record<ClaimType, WorkflowState[]> = {
    accident: [
      'NEW', 'POLICY_VALIDATION', 'REGISTERED', 'ASSESSOR_APPOINTED',
      'ASSESSMENT_RECEIVED', 'INTERNAL_APPROVAL', 'AOL', 'ROUTE_TYPE',
      'INSPECTION_FINAL_COSTING', 'REPAIR_IN_PROGRESS', 'CLOSED',
    ],
    theft: [
      'NEW', 'POLICY_VALIDATION', 'REGISTERED', 'INVESTIGATOR_APPOINTED',
      'INVESTIGATION_RECEIVED', 'INTERNAL_APPROVAL', 'AOL', 'ROUTE_TYPE',
      'INSPECTION_FINAL_COSTING', 'REPAIR_IN_PROGRESS', 'CLOSED',
    ],
    glass: [
      'NEW', 'POLICY_VALIDATION', 'REGISTERED', 'GLASS_REPAIRER_APPOINTED',
      'REPAIR_COMPLETE', 'CLOSED',
    ],
  }
  return paths[claimType]
}

// ── State display labels ─────────────────────────────────────
export const stateLabels: Record<WorkflowState, string> = {
  NEW: 'New',
  POLICY_VALIDATION: 'Policy Validation',
  INVALID: 'Invalid Policy',
  REGISTERED: 'Registered',
  ASSESSOR_APPOINTED: 'Assessor Appointed',
  ASSESSMENT_RECEIVED: 'Assessment Received',
  INVESTIGATOR_APPOINTED: 'Investigator Appointed',
  INVESTIGATION_RECEIVED: 'Investigation Received',
  WITHIN_EXCESS: 'Within Excess',
  INTERNAL_APPROVAL: 'Internal Approval',
  QA_APPOINTED: 'QA Appointed',
  QA_DECISION: 'QA Decision',
  REJECTED: 'Rejected',
  AOL: 'AOL Generated',
  ROUTE_TYPE: 'Route Decision',
  INSPECTION_FINAL_COSTING: 'Inspection & Costing',
  REPAIR_IN_PROGRESS: 'Repair in Progress',
  TOTAL_LOSS: 'Total Loss',
  SETTLEMENT_CONFIRMED: 'Settlement Confirmed',
  SALVAGE_IN_PROGRESS: 'Salvage in Progress',
  GLASS_REPAIRER_APPOINTED: 'Glass Repairer Appointed',
  REPAIR_COMPLETE: 'Repair Complete',
  CLOSED: 'Closed',
}

// ── Terminal states (no further transitions) ─────────────────
export const terminalStates: WorkflowState[] = ['CLOSED']

// ── States that close the claim ──────────────────────────────
export const closingStates: WorkflowState[] = [
  'WITHIN_EXCESS', 'REJECTED', 'REPAIR_COMPLETE',
]
