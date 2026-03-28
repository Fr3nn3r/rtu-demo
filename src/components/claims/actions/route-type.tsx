import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { Wrench, AlertTriangle } from 'lucide-react'

export function RouteType({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  function handleRepair() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'INSPECTION_FINAL_COSTING',
      data: { routeType: 'repair' },
    })
  }

  function handleTotalLoss() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'TOTAL_LOSS',
      data: { routeType: 'total_loss' },
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Select the route for this claim based on the assessment outcome.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleRepair}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center transition-all hover:border-primary-400 hover:bg-primary-50/50"
        >
          <Wrench className="size-8 text-primary-500" />
          <div>
            <div className="text-sm font-semibold">Repair</div>
            <div className="text-xs text-text-muted mt-1">Vehicle will be sent for inspection and repair</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleTotalLoss}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center transition-all hover:border-warning-400 hover:bg-warning-50/50"
        >
          <AlertTriangle className="size-8 text-warning-500" />
          <div>
            <div className="text-sm font-semibold">Total Loss</div>
            <div className="text-xs text-text-muted mt-1">Proceed to settlement and salvage</div>
          </div>
        </button>
      </div>
    </div>
  )
}
