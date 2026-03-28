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
      <p className="text-sm text-text-secondary">
        Upload the investigation report and confirm receipt.
        All theft claims proceed to QA review.
      </p>

      <div
        className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-surface-secondary transition-colors"
        onClick={() => setConfirmed(true)}
      >
        <Upload className="size-5 text-text-muted" />
        <div className="text-sm">
          {confirmed
            ? <span className="font-medium text-success-700">Investigation report uploaded</span>
            : <span className="text-text-secondary">Click to simulate uploading the investigation report</span>
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
