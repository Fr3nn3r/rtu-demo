import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { BridgeStepBanner } from '../bridge-step-banner'
import { useClaims } from '@/context/ClaimContext'

export function AolGenerated({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  function handleConfirm() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'ROUTE_TYPE',
    })
  }

  return (
    <div className="space-y-4">
      <BridgeStepBanner
        system="roc"
        instruction="Generate the Authority of Loss (AOL) on ROC for this claim, then confirm below."
      />

      <p className="text-sm text-text-secondary">
        Once the AOL has been generated on ROC, confirm below to proceed to the route decision (repair or total loss).
      </p>

      <div className="flex justify-end">
        <Button onClick={handleConfirm}>
          Confirm AOL Generated
        </Button>
      </div>
    </div>
  )
}
