import { createContext, useContext, useReducer, useMemo, useEffect, useState, type ReactNode } from 'react'
import type { Claim, ClaimAction, WorkflowState, DashboardStats } from '@/types'
import { seedClaims } from '@/data/seed-claims'
import { createAuditEntry } from '@/lib/audit'
import { createSLARecord, completeSLARecord, getPreviousState } from '@/lib/workflow-engine'
import { generateCommunication } from '@/lib/communication-templates'
import { stateLabels } from '@/data/workflow-definitions'

// ── Reducer ──────────────────────────────────────────────────
function claimReducer(state: Claim[], action: ClaimAction): Claim[] {
  switch (action.type) {
    case 'ADVANCE_WORKFLOW': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim

        const now = new Date().toISOString()
        const fromState = claim.status
        const toState = action.toState

        // Complete current SLA record
        let slaHistory = completeSLARecord(claim.slaHistory, fromState)

        // Create new SLA record for the target state
        const newSLA = createSLARecord(claim.type, toState)
        if (newSLA) {
          slaHistory = [...slaHistory, newSLA]
        }

        // Merge workflow field updates
        const workflow = { ...claim.workflow, ...action.data }

        // Generate audit entry
        const auditEntry = createAuditEntry(
          claim.assignedTo,
          'status_changed',
          `Status changed from ${stateLabels[fromState]} to ${stateLabels[toState]}`,
          fromState,
          toState,
        )

        // Auto-generate communication if applicable
        const updatedClaim: Claim = {
          ...claim,
          status: toState,
          updatedAt: now,
          workflow,
          slaHistory,
          auditTrail: [...claim.auditTrail, auditEntry],
        }

        const comm = generateCommunication(updatedClaim, toState)
        if (comm) {
          const commAudit = createAuditEntry(
            claim.assignedTo,
            'communication_generated',
            `Draft communication generated: ${comm.subject}`,
          )
          updatedClaim.communications = [...updatedClaim.communications, comm]
          updatedClaim.auditTrail = [...updatedClaim.auditTrail, commAudit]
        }

        return updatedClaim
      })
    }

    case 'REVERT_WORKFLOW': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim

        const prevState = getPreviousState(claim)
        if (!prevState) return claim

        const now = new Date().toISOString()
        const fromState = claim.status

        // Remove the current active SLA record (the one without completedAt)
        let slaHistory = claim.slaHistory.filter(r => !(r.state === fromState && !r.completedAt))

        // Re-open the previous SLA record (remove its completedAt)
        slaHistory = slaHistory.map(r =>
          r.state === prevState && r.completedAt
            ? { ...r, completedAt: undefined }
            : r
        )

        const auditEntry = createAuditEntry(
          claim.assignedTo,
          'status_changed',
          `Status reverted from ${stateLabels[fromState]} to ${stateLabels[prevState]}`,
          fromState,
          prevState,
        )

        return {
          ...claim,
          status: prevState,
          updatedAt: now,
          slaHistory,
          auditTrail: [...claim.auditTrail, auditEntry],
        }
      })
    }

    case 'UPDATE_CLAIM_FIELD': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        const now = new Date().toISOString()
        // Shallow update — handles top-level and nested via dot notation would need more logic
        // For prototype, we'll handle workflow fields directly
        return {
          ...claim,
          updatedAt: now,
        }
      })
    }

    case 'ADD_CLAIM': {
      return [...state, action.claim]
    }

    case 'UPDATE_DOCUMENT_STATUS': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        return {
          ...claim,
          updatedAt: new Date().toISOString(),
          documents: claim.documents.map(doc =>
            doc.id === action.docId ? { ...doc, status: action.status, updatedAt: new Date().toISOString() } : doc
          ),
        }
      })
    }

    case 'ADD_COMMUNICATION': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        return {
          ...claim,
          communications: [...claim.communications, action.communication],
        }
      })
    }

    case 'MARK_COMMUNICATION_SENT': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        const now = new Date().toISOString()
        const comm = claim.communications.find(c => c.id === action.communicationId)
        const auditEntry = createAuditEntry(
          claim.assignedTo,
          'communication_sent',
          `Communication marked as sent: ${comm?.subject ?? 'Unknown'}`,
        )
        return {
          ...claim,
          updatedAt: now,
          communications: claim.communications.map(c =>
            c.id === action.communicationId ? { ...c, sentAt: now } : c
          ),
          auditTrail: [...claim.auditTrail, auditEntry],
        }
      })
    }

    case 'ADD_AUDIT_ENTRY': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        return {
          ...claim,
          auditTrail: [...claim.auditTrail, action.entry],
        }
      })
    }

    case 'ASSIGN_CLAIM': {
      return state.map(claim => {
        if (claim.id !== action.claimId) return claim
        const now = new Date().toISOString()
        const auditEntry = createAuditEntry(
          claim.assignedTo,
          'field_updated',
          `Claim reassigned to ${action.assignedTo}`,
          claim.assignedTo,
          action.assignedTo,
        )
        return {
          ...claim,
          assignedTo: action.assignedTo,
          updatedAt: now,
          auditTrail: [...claim.auditTrail, auditEntry],
        }
      })
    }

    case 'FAST_FORWARD': {
      // Shift all SLA timestamps back by N hours (simulates time passing)
      const shiftMs = action.hours * 60 * 60 * 1000
      return state.map(claim => ({
        ...claim,
        slaHistory: claim.slaHistory.map(r => ({
          ...r,
          enteredAt: new Date(new Date(r.enteredAt).getTime() - shiftMs).toISOString(),
          dueAt: new Date(new Date(r.dueAt).getTime() - shiftMs).toISOString(),
          completedAt: r.completedAt
            ? new Date(new Date(r.completedAt).getTime() - shiftMs).toISOString()
            : undefined,
        })),
      }))
    }

    default:
      return state
  }
}

// ── Context shape ────────────────────────────────────────────
interface ClaimContextValue {
  claims: Claim[]
  dispatch: React.Dispatch<ClaimAction>
  getClaimById: (id: string) => Claim | undefined
  getClaimsByStatus: (status: WorkflowState) => Claim[]
  getActiveClaims: () => Claim[]
  getBreachedClaims: () => Claim[]
  getDashboardStats: () => DashboardStats
  tick: number // increments every 60s to force SLA re-renders
}

const ClaimContext = createContext<ClaimContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────
export function ClaimProvider({ children }: { children: ReactNode }) {
  const [claims, dispatch] = useReducer(claimReducer, seedClaims)
  const [tick, setTick] = useState(0)

  // Tick every second to refresh SLA countdown timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1_000)
    return () => clearInterval(interval)
  }, [])

  const value = useMemo<ClaimContextValue>(() => ({
    claims,
    dispatch,
    tick,

    getClaimById: (id: string) => claims.find(c => c.id === id),

    getClaimsByStatus: (status: WorkflowState) => claims.filter(c => c.status === status),

    getActiveClaims: () => claims.filter(c => c.status !== 'CLOSED'),

    getBreachedClaims: () => claims.filter(claim => {
      const activeSLA = claim.slaHistory.find(r => !r.completedAt)
      if (!activeSLA) return false
      return new Date() >= new Date(activeSLA.dueAt)
    }),

    getDashboardStats: () => {
      const active = claims.filter(c => c.status !== 'CLOSED')
      const closed = claims.filter(c => c.status === 'CLOSED')
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const newThisMonth = claims.filter(c => new Date(c.createdAt) >= monthStart).length
      const closedThisMonth = closed.filter(c => new Date(c.updatedAt) >= monthStart).length

      const breached = active.filter(claim => {
        const activeSLA = claim.slaHistory.find(r => !r.completedAt)
        return activeSLA ? now >= new Date(activeSLA.dueAt) : false
      }).length

      const closedWithTimes = closed
        .map(c => (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        .filter(d => d > 0)
      const avgDaysToClose = closedWithTimes.length > 0
        ? closedWithTimes.reduce((a, b) => a + b, 0) / closedWithTimes.length
        : 0

      return {
        activeClaims: active.length,
        breachedSLAs: breached,
        newThisMonth,
        closedThisMonth,
        avgDaysToClose: Math.round(avgDaysToClose * 10) / 10,
      }
    },
  }), [claims, tick])

  return (
    <ClaimContext.Provider value={value}>
      {children}
    </ClaimContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useClaims(): ClaimContextValue {
  const ctx = useContext(ClaimContext)
  if (!ctx) throw new Error('useClaims must be used within ClaimProvider')
  return ctx
}
