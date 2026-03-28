import type { Claim } from '@/types'
import { formatZAR } from '@/lib/utils'
import { format } from 'date-fns'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function Closed({ claim }: { claim: Claim }) {
  const wasRejected = claim.workflow.rejectionReason != null
  const wasWithinExcess = claim.auditTrail.some(a => a.newValue === 'WITHIN_EXCESS')
  const wasInvalid = claim.auditTrail.some(a => a.newValue === 'INVALID')

  let icon = <CheckCircle className="size-6 text-success-600" />
  let title = 'Claim Closed'
  let subtitle = 'This claim has been completed successfully.'

  if (wasRejected) {
    icon = <XCircle className="size-6 text-danger-600" />
    title = 'Claim Rejected'
    subtitle = claim.workflow.rejectionReason ?? 'No reason provided.'
  } else if (wasWithinExcess) {
    icon = <AlertTriangle className="size-6 text-warning-600" />
    title = 'Closed — Within Excess'
    subtitle = 'The assessed amount fell within the policy excess.'
  } else if (wasInvalid) {
    icon = <XCircle className="size-6 text-danger-600" />
    title = 'Closed — Invalid Policy'
    subtitle = 'The policy could not be validated.'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-4">
        {icon}
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[11px] font-medium text-text-muted uppercase">Created</div>
          <div>{format(new Date(claim.createdAt), 'dd MMM yyyy, HH:mm')}</div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-text-muted uppercase">Closed</div>
          <div>{format(new Date(claim.updatedAt), 'dd MMM yyyy, HH:mm')}</div>
        </div>
        {claim.workflow.assessedAmount != null && (
          <div>
            <div className="text-[11px] font-medium text-text-muted uppercase">Assessed Amount</div>
            <div>{formatZAR(claim.workflow.assessedAmount)}</div>
          </div>
        )}
        {claim.workflow.finalCostAmount != null && (
          <div>
            <div className="text-[11px] font-medium text-text-muted uppercase">Final Cost</div>
            <div>{formatZAR(claim.workflow.finalCostAmount)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
