import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

export function InternalApproval({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const assessed = claim.workflow.assessedAmount ?? 0
  const excess = claim.workflow.excessAmount ?? 0
  const netPayable = assessed - excess

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
      <p className="text-sm text-muted-foreground">
        Review the claim details and decide to approve or reject.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Assessed Amount" value={formatZAR(assessed)} />
        <SummaryCard label="Excess" value={formatZAR(excess)} />
        <SummaryCard label="Net Payable" value={formatZAR(netPayable)} highlight />
      </div>

      {!rejecting ? (
        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={() => setRejecting(true)}>
            <XCircle className="size-4" data-icon="inline-start" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <CheckCircle className="size-4" data-icon="inline-start" />
            Approve
          </Button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-sm font-medium text-destructive">Rejection Details</h4>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Reason for Rejection</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejecting this claim..."
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

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted'}`}>
      <div className="text-[11px] font-medium text-muted-foreground uppercase">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>{value}</div>
    </div>
  )
}
