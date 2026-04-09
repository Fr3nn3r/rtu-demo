import type { Claim, WorkflowState } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { stateLabels } from '@/data/workflow-definitions'
import { CheckCircle } from 'lucide-react'

const nextStateMap: Partial<Record<WorkflowState, WorkflowState>> = {
  REPAIR_IN_PROGRESS: 'CLOSED',
  TOTAL_LOSS: 'SETTLEMENT_CONFIRMED',
  SETTLEMENT_CONFIRMED: 'SALVAGE_IN_PROGRESS',
  SALVAGE_IN_PROGRESS: 'CLOSED',
  REPAIR_COMPLETE: 'CLOSED',
}

const actionLabels: Partial<Record<WorkflowState, string>> = {
  REPAIR_IN_PROGRESS: 'Mark Repair Complete',
  TOTAL_LOSS: 'Confirm Settlement Issued',
  SETTLEMENT_CONFIRMED: 'Confirm Receipt & Start Salvage',
  SALVAGE_IN_PROGRESS: 'Mark Salvage Complete',
  REPAIR_COMPLETE: 'Close Claim',
}

export function ProgressStatus({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const nextState = nextStateMap[claim.status]

  function handleAdvance() {
    if (!nextState) return
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: nextState,
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted p-4">
        <div className="text-sm font-medium text-foreground mb-3">{stateLabels[claim.status]}</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {claim.workflow.assessedAmount != null && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Assessed Amount</div>
              <div>{formatZAR(claim.workflow.assessedAmount)}</div>
            </div>
          )}
          {claim.workflow.finalCostAmount != null && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Final Cost</div>
              <div>{formatZAR(claim.workflow.finalCostAmount)}</div>
            </div>
          )}
          {claim.workflow.routeType && (
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Route</div>
              <div className="capitalize">{claim.workflow.routeType.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>

      {nextState && (
        <div className="flex justify-end">
          <Button onClick={handleAdvance}>
            <CheckCircle className="size-4" data-icon="inline-start" />
            {actionLabels[claim.status] ?? 'Proceed'}
          </Button>
        </div>
      )}
    </div>
  )
}
