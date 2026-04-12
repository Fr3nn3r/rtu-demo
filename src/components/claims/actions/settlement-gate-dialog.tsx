import { useState } from 'react'
import type { DocumentType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Square, CheckSquare } from 'lucide-react'
import { DOCUMENT_LABELS } from '@/data/document-requirements'

interface SettlementGateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingDocs: DocumentType[]
  total: number
  onOverride: (reason: string) => void
}

export function SettlementGateDialog({
  open,
  onOpenChange,
  missingDocs,
  total,
  onOverride,
}: SettlementGateDialogProps) {
  const [acknowledged, setAcknowledged] = useState<Set<DocumentType>>(new Set())
  const [reason, setReason] = useState('')

  const allAcknowledged = missingDocs.every(d => acknowledged.has(d))
  const canOverride = allAcknowledged && reason.trim().length > 0

  function toggleAcknowledge(docType: DocumentType) {
    setAcknowledged(prev => {
      const next = new Set(prev)
      if (next.has(docType)) {
        next.delete(docType)
      } else {
        next.add(docType)
      }
      return next
    })
  }

  function handleOverride() {
    if (!canOverride) return
    onOverride(reason.trim())
    setAcknowledged(new Set())
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            Incomplete Document Pack
          </DialogTitle>
          <DialogDescription>
            {missingDocs.length} of {total} required documents are still outstanding.
            Acknowledge each missing document and provide a reason to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            {missingDocs.map(docType => {
              const isChecked = acknowledged.has(docType)
              const Icon = isChecked ? CheckSquare : Square

              return (
                <button
                  key={docType}
                  type="button"
                  onClick={() => toggleAcknowledge(docType)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted transition-colors"
                >
                  <Icon className={`size-4 flex-shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-foreground">{DOCUMENT_LABELS[docType]}</span>
                </button>
              )
            })}
          </div>

          <div>
            <label htmlFor="override-reason" className="text-xs font-medium text-muted-foreground">
              Reason for proceeding without complete documents
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Insured confirmed delivery by courier tomorrow"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canOverride}
            onClick={handleOverride}
          >
            Override &amp; Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
