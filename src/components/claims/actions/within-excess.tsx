import { useEffect } from 'react'
import type { Claim } from '@/types'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

export function WithinExcess({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  useEffect(() => {
    // Auto-close: dispatch after a brief delay so the user sees the info card
    const timer = setTimeout(() => {
      dispatch({
        type: 'ADVANCE_WORKFLOW',
        claimId: claim.id,
        toState: 'CLOSED',
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [claim.id, dispatch])

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <CheckCircle2 className="mt-0.5 size-5 text-primary flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-primary">Auto-Closing — Within Excess</div>
          <p className="mt-1 text-sm text-muted-foreground">
            The assessed amount of {formatZAR(claim.workflow.assessedAmount ?? 0)} is within the
            policy excess of {formatZAR(claim.workflow.excessAmount ?? 0)}.
            This claim is being auto-closed. A draft notification has been generated for the policyholder and broker.
          </p>
        </div>
      </div>
    </div>
  )
}
