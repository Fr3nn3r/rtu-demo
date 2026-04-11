import { addHours, formatDistanceStrict } from 'date-fns'
import type { Claim, ClaimType, SLARecord, SLAStatus, StepDefinition, WorkflowState } from '@/types'
import { workflowDefinitions, getStepDef, getLinearPath } from '@/data/workflow-definitions'

// ── Get valid next states from current state ─────────────────
export function getNextStates(claimType: ClaimType, currentState: WorkflowState): WorkflowState[] {
  return workflowDefinitions[claimType].transitions[currentState] ?? []
}

// ── Get the previous state (reverse lookup from SLA history) ─
export function getPreviousState(claim: Claim): WorkflowState | null {
  if (claim.status === 'NEW') return null
  if (claim.status === 'CLOSED') return null

  // Find the most recently completed SLA record — that's where we came from
  const completedRecords = claim.slaHistory
    .filter(r => r.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  if (completedRecords.length > 0) {
    return completedRecords[0].state
  }

  // If no completed SLA records, the previous state was NEW
  return 'NEW'
}

// ── Check if a transition is valid ───────────────────────────
export function canTransition(claimType: ClaimType, from: WorkflowState, to: WorkflowState): boolean {
  return getNextStates(claimType, from).includes(to)
}

// ── Auto-routing logic (after assessment/investigation) ──────
export function resolveAutoRoute(
  assessedAmount: number,
  excessAmount: number,
  threshold: number = 50_000,
): 'WITHIN_EXCESS' | 'INTERNAL_APPROVAL' | 'QA_APPOINTED' {
  if (assessedAmount <= excessAmount) return 'WITHIN_EXCESS'
  if (assessedAmount <= threshold) return 'INTERNAL_APPROVAL'
  return 'QA_APPOINTED'
}

// ── Compute SLA status for a record ──────────────────────────
export interface SLAComputed {
  status: SLAStatus
  percentElapsed: number
  timeRemaining: string
  isActive: boolean
}

export function computeSLAStatus(slaRecord: SLARecord): SLAComputed {
  if (slaRecord.completedAt) {
    return { status: 'within', percentElapsed: 0, timeRemaining: 'Completed', isActive: false }
  }

  const now = new Date()
  const entered = new Date(slaRecord.enteredAt)
  const due = new Date(slaRecord.dueAt)
  const totalMs = due.getTime() - entered.getTime()
  const elapsedMs = now.getTime() - entered.getTime()

  if (totalMs <= 0) {
    return { status: 'within', percentElapsed: 0, timeRemaining: '-', isActive: true }
  }

  const percent = (elapsedMs / totalMs) * 100
  const remainingMs = due.getTime() - now.getTime()

  let timeRemaining: string
  if (remainingMs <= 0) {
    timeRemaining = `${formatHMS(Math.abs(remainingMs))} overdue`
  } else {
    timeRemaining = formatHMS(remainingMs)
  }

  if (percent >= 100) return { status: 'breached', percentElapsed: percent, timeRemaining, isActive: true }
  if (percent >= 75) return { status: 'approaching', percentElapsed: percent, timeRemaining, isActive: true }
  return { status: 'within', percentElapsed: percent, timeRemaining, isActive: true }
}

// ── Format milliseconds as DD:HH:MM:SS ───────────────────────
function formatHMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (d > 0) {
    return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Get the current active SLA record for a claim ────────────
export function getCurrentSLA(claim: Claim): SLARecord | undefined {
  return claim.slaHistory.find(r => !r.completedAt)
}

// ── Get the current SLA status for a claim ───────────────────
export function getClaimSLAStatus(claim: Claim): SLAComputed | null {
  const currentSLA = getCurrentSLA(claim)
  if (!currentSLA) return null
  return computeSLAStatus(currentSLA)
}

// ── Create an SLA record for a new state ─────────────────────
export function createSLARecord(claimType: ClaimType, state: WorkflowState): SLARecord | null {
  const stepDef = getStepDef(claimType, state)
  if (!stepDef?.slaHours) return null

  const now = new Date()
  return {
    state,
    enteredAt: now.toISOString(),
    dueAt: addHours(now, stepDef.slaHours).toISOString(),
  }
}

// ── Complete the current SLA record ──────────────────────────
export function completeSLARecord(slaHistory: SLARecord[], state: WorkflowState): SLARecord[] {
  return slaHistory.map(r =>
    r.state === state && !r.completedAt
      ? { ...r, completedAt: new Date().toISOString() }
      : r
  )
}

// ── Get step config for the action panel ─────────────────────
export function getStepConfig(claimType: ClaimType, state: WorkflowState): StepDefinition | undefined {
  return getStepDef(claimType, state)
}

// ── Build the stepper path for a claim ───────────────────────
// Shows completed states + current + projected future based on the claim's route
export type StepStatus = 'completed' | 'current' | 'upcoming'

export interface StepperStep {
  definition: StepDefinition
  status: StepStatus
  stepNumber: number
}

export function getStepperSteps(claim: Claim): StepperStep[] {
  const { type, status, slaHistory } = claim
  const completedStates = slaHistory
    .filter(r => r.completedAt)
    .map(r => r.state)

  // Build the actual path: completed states + current + projected future
  const linearPath = getLinearPath(type)

  // Determine which states this claim has actually visited
  const visitedStates = new Set([
    ...completedStates,
    ...slaHistory.map(r => r.state),
    status,
  ])

  // Start with the linear path, but substitute actual route where diverged
  const actualPath: WorkflowState[] = []

  // Add completed states in order of the linear path
  for (const pathState of linearPath) {
    if (completedStates.includes(pathState)) {
      actualPath.push(pathState)
    } else if (visitedStates.has(pathState)) {
      // Current state found on the linear path
      break
    } else {
      // Check if we've diverged (e.g., QA path instead of internal approval)
      continue
    }
  }

  // Add any visited states not in the linear path (diverged branch)
  for (const visited of [...completedStates, status]) {
    if (!actualPath.includes(visited) && visited !== 'CLOSED') {
      actualPath.push(visited)
    }
  }

  // Add current state if not already there
  if (!actualPath.includes(status) && status !== 'CLOSED') {
    actualPath.push(status)
  }

  // Add projected future states from current
  if (status !== 'CLOSED') {
    const futureLinearIdx = linearPath.indexOf(status)
    if (futureLinearIdx >= 0) {
      for (let j = futureLinearIdx + 1; j < linearPath.length; j++) {
        if (!actualPath.includes(linearPath[j])) {
          actualPath.push(linearPath[j])
        }
      }
    } else {
      // On a branch not in linear path — add convergent future states
      const nextStates = getNextStates(type, status)
      for (const ns of nextStates) {
        if (!actualPath.includes(ns)) {
          actualPath.push(ns)
          // Continue the linear path from this convergent point
          const idx = linearPath.indexOf(ns)
          if (idx >= 0) {
            for (let j = idx + 1; j < linearPath.length; j++) {
              if (!actualPath.includes(linearPath[j])) {
                actualPath.push(linearPath[j])
              }
            }
          }
          break
        }
      }
    }
  }

  // Ensure CLOSED is always last if present
  if (status === 'CLOSED' && !actualPath.includes('CLOSED')) {
    actualPath.push('CLOSED')
  } else if (!actualPath.includes('CLOSED')) {
    actualPath.push('CLOSED')
  }

  // Build stepper steps
  return actualPath.map((state, idx) => {
    const definition = getStepDef(type, state)!
    let stepStatus: StepStatus = 'upcoming'

    if (completedStates.includes(state) || (status === 'CLOSED' && state !== 'CLOSED')) {
      stepStatus = 'completed'
    } else if (state === status) {
      stepStatus = status === 'CLOSED' ? 'completed' : 'current'
    }

    return {
      definition,
      status: stepStatus,
      stepNumber: idx + 1,
    }
  })
}

// ── Elapsed time helpers ─────────────────────────────────────
export function getElapsedTime(fromDate: string): string {
  return formatDistanceStrict(new Date(fromDate), new Date(), { addSuffix: true })
}

export function formatSLADuration(hours: number): string {
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remaining = hours % 24
    return remaining > 0 ? `${days}d ${remaining}h` : `${days}d`
  }
  return `${hours}h`
}
