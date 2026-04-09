import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { DocumentDropZone } from '@/components/document-drop-zone'

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

      <DocumentDropZone
        label="Upload Investigation Report"
        fileName="Investigation Report.pdf"
        onProcessed={() => {
          setConfirmed(true)
          const doc = claim.documents.find(d => d.type === 'investigation_report')
          if (doc) {
            dispatch({ type: 'UPDATE_DOCUMENT_STATUS', claimId: claim.id, docId: doc.id, status: 'received' })
          }
        }}
      />

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!confirmed}>
          Confirm Investigation Received — Proceed to QA
        </Button>
      </div>
    </div>
  )
}
