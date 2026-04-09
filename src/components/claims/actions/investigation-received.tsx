import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { Upload } from 'lucide-react'

export function InvestigationReceived({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [confirmed, setConfirmed] = useState(false)

  function handleSubmit() {
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: 'QA_APPOINTED',
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload the investigation report and confirm receipt.
        All theft claims proceed to QA review.
      </p>

      <div
        className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setConfirmed(true)}
      >
        <Upload className="size-5 text-muted-foreground" />
        <div className="text-sm">
          {confirmed
            ? <span className="font-medium text-primary">Investigation report uploaded</span>
            : <span className="text-muted-foreground">Click to simulate uploading the investigation report</span>
          }
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!confirmed}>
          Confirm Investigation Received — Proceed to QA
        </Button>
      </div>
    </div>
  )
}
