import type { Claim } from '@/types'
import { getStepConfig, getPreviousState } from '@/lib/workflow-engine'
import { stateLabels } from '@/data/workflow-definitions'
import { useClaims } from '@/context/ClaimContext'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'
import { NewClaimReview } from './actions/new-claim-review'
import { PolicyValidation } from './actions/policy-validation'
import { RegisterOnRock } from './actions/register-on-rock'
import { AppointContact } from './actions/appoint-contact'
import { AssessmentReceived } from './actions/assessment-received'
import { InternalApproval } from './actions/internal-approval'
import { QaDecision } from './actions/qa-decision'
import { AolGenerated } from './actions/aol-generated'
import { RouteType } from './actions/route-type'
import { InspectionCosting } from './actions/inspection-costing'
import { WithinExcess } from './actions/within-excess'
import { ProgressStatus } from './actions/progress-status'
import { Closed } from './actions/closed'

export function ActionPanel({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const stepConfig = getStepConfig(claim.type, claim.status)
  const prevState = getPreviousState(claim)

  function handleGoBack() {
    if (!prevState) return
    const confirmed = window.confirm(
      `Are you sure? This will revert the claim to "${stateLabels[prevState]}".`
    )
    if (confirmed) {
      dispatch({ type: 'REVERT_WORKFLOW', claimId: claim.id })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{stepConfig?.label ?? 'Unknown Step'}</h3>
          {stepConfig?.description && (
            <p className="mt-0.5 text-sm text-text-muted">{stepConfig.description}</p>
          )}
        </div>
        {prevState && claim.status !== 'CLOSED' && (
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="flex-shrink-0 text-text-muted hover:text-text-primary">
            <Undo2 className="size-3.5" data-icon="inline-start" />
            Back to {stateLabels[prevState]}
          </Button>
        )}
      </div>
      <ActionContent claim={claim} />
    </div>
  )
}

function ActionContent({ claim }: { claim: Claim }) {
  switch (claim.status) {
    case 'NEW':
      return <NewClaimReview claim={claim} />

    case 'POLICY_VALIDATION':
      return <PolicyValidation claim={claim} />

    case 'REGISTERED':
      return <RegisterOnRock claim={claim} />

    case 'ASSESSOR_APPOINTED':
      return (
        <AppointContact
          claim={claim}
          contactRole="assessor"
          nextState="ASSESSMENT_RECEIVED"
          workflowField="assessorId"
        />
      )

    case 'INVESTIGATOR_APPOINTED':
      return (
        <AppointContact
          claim={claim}
          contactRole="investigator"
          nextState="INVESTIGATION_RECEIVED"
          workflowField="investigatorId"
        />
      )

    case 'GLASS_REPAIRER_APPOINTED':
      return (
        <AppointContact
          claim={claim}
          contactRole="glass_repairer"
          nextState="REPAIR_COMPLETE"
          workflowField="glassRepairerId"
        />
      )

    case 'ASSESSMENT_RECEIVED':
    case 'INVESTIGATION_RECEIVED':
      return <AssessmentReceived claim={claim} />

    case 'WITHIN_EXCESS':
      return <WithinExcess claim={claim} />

    case 'INTERNAL_APPROVAL':
      return <InternalApproval claim={claim} />

    case 'QA_APPOINTED':
    case 'QA_DECISION':
      return <QaDecision claim={claim} />

    case 'REJECTED':
    case 'INVALID':
      return <ProgressStatus claim={claim} />

    case 'AOL':
      return <AolGenerated claim={claim} />

    case 'ROUTE_TYPE':
      return <RouteType claim={claim} />

    case 'INSPECTION_FINAL_COSTING':
      return <InspectionCosting claim={claim} />

    case 'REPAIR_IN_PROGRESS':
    case 'TOTAL_LOSS':
    case 'SETTLEMENT_CONFIRMED':
    case 'SALVAGE_IN_PROGRESS':
    case 'REPAIR_COMPLETE':
      return <ProgressStatus claim={claim} />

    case 'CLOSED':
      return <Closed claim={claim} />

    default:
      return <div className="text-sm text-text-muted">No actions available for this step.</div>
  }
}
