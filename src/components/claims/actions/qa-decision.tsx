import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BridgeStepBanner } from '../bridge-step-banner'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

export function QaDecision({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const assessed = claim.workflow.assessedAmount ?? 0
  const excess = claim.workflow.excessAmount ?? 0

  function handleApprove() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'AOL',
    })
  }

  function handleReject() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'REJECTED',
      data: { rejectionReason },
    })
  }

  return (
    <div className="space-y-4">
      {claim.status === 'QA_APPOINTED' && (
        <BridgeStepBanner
          system="rock"
          instruction="QA has been appointed on Rock. Awaiting the QA decision."
        />
      )}

      <p className="text-sm text-text-secondary">
        This claim exceeds R50,000 and requires QA approval. Assessed: {formatZAR(assessed)}, Excess: {formatZAR(excess)}.
      </p>

      {!rejecting ? (
        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={() => setRejecting(true)}>
            <XCircle className="size-4" data-icon="inline-start" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <CheckCircle className="size-4" data-icon="inline-start" />
            QA Approve
          </Button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-sm font-medium text-danger-700">Rejection Details</h4>
          <div>
            <Label htmlFor="qaRejectionReason">Reason for Rejection</Label>
            <Textarea
              id="qaRejectionReason"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
