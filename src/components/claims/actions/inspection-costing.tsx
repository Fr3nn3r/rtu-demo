import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClaims } from '@/context/ClaimContext'
import { formatZAR } from '@/lib/utils'

export function InspectionCosting({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [finalCost, setFinalCost] = useState(claim.workflow.finalCostAmount?.toString() ?? '')

  function handleConfirm() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'REPAIR_IN_PROGRESS',
      data: { finalCostAmount: Number(finalCost) },
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Confirm the final cost from the repairer/assessor after inspection.
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-muted p-3">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Original Assessment</div>
          <div className="text-lg font-semibold">{formatZAR(claim.workflow.assessedAmount ?? 0)}</div>
        </div>
        <div>
          <Label htmlFor="finalCost">Final Cost (ZAR)</Label>
          <Input
            id="finalCost"
            type="number"
            value={finalCost}
            onChange={e => setFinalCost(e.target.value)}
            placeholder="e.g. 42000"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!finalCost}>
          Confirm Final Cost — Start Repair
        </Button>
      </div>
    </div>
  )
}
