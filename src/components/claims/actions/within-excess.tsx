import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { Info } from 'lucide-react'

export function WithinExcess({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  function handleClose() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'CLOSED',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50/50 p-4">
        <Info className="mt-0.5 size-5 text-warning-500 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-warning-700">Claim Within Excess</div>
          <p className="mt-1 text-sm text-text-secondary">
            The assessed amount of {formatZAR(claim.workflow.assessedAmount ?? 0)} is within the
            policy excess of {formatZAR(claim.workflow.excessAmount ?? 0)}.
            No further action will be taken.
          </p>
        </div>
      </div>

      <p className="text-sm text-text-secondary">
        A draft notification has been generated for the policyholder and broker. Review and send the notification, then close the claim.
      </p>

      <div className="flex justify-end">
        <Button onClick={handleClose}>
          Close Claim
        </Button>
      </div>
    </div>
  )
}
