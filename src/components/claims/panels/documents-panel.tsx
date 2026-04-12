import type { Claim, DocumentStatus, DocumentType } from '@/types'
import { useClaims } from '@/context/ClaimContext'
import { FileText, Check, Clock, Minus, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDocumentCompleteness } from '@/lib/documents'
import { REQUIRED_DOCUMENTS, DOCUMENT_LABELS } from '@/data/document-requirements'
import { format } from 'date-fns'

const statusConfig: Record<DocumentStatus, { icon: typeof Check; label: string; className: string }> = {
  received: { icon: Check, label: 'Received', className: 'text-primary' },
  pending: { icon: Clock, label: 'Pending', className: 'text-accent-foreground' },
  not_required: { icon: Minus, label: 'N/A', className: 'text-muted-foreground' },
}

export function DocumentsPanel({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const completeness = getDocumentCompleteness(claim)
  const requiredTypes = new Set(REQUIRED_DOCUMENTS[claim.type])

  const requiredDocs = claim.documents.filter(d => requiredTypes.has(d.type))
  const otherDocs = claim.documents.filter(d => !requiredTypes.has(d.type))

  // Required types that have no document entry yet
  const missingTypes = completeness.missing.filter(
    t => !claim.documents.some(d => d.type === t),
  )

  function markReceived(docId: string, docLabel: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', claimId: claim.id, docId, status: 'received' })
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      claimId: claim.id,
      entry: {
        id: `AUD-DOC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: claim.assignedTo,
        actionType: 'document_updated',
        description: `Document received: ${docLabel}`,
      },
    })
  }

  const progressPercent = completeness.required > 0
    ? Math.round((completeness.received / completeness.required) * 100)
    : 100

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <FileCheck className="size-3.5" />
            {completeness.received} of {completeness.required} documents received
          </span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              progressPercent === 100 ? 'bg-primary' : 'bg-accent-foreground',
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Required documents */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
          Required
        </div>
        {requiredDocs.map(doc => {
          const config = statusConfig[doc.status]
          const Icon = config.icon

          return (
            <div
              key={doc.id}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5"
            >
              <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{doc.label}</div>
                {doc.status === 'received' && (
                  <div className="text-[10px] text-muted-foreground">
                    {format(new Date(doc.updatedAt), 'dd MMM HH:mm')}
                  </div>
                )}
              </div>
              {doc.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => markReceived(doc.id, doc.label)}
                  className="text-[11px] font-medium text-accent-foreground hover:text-primary transition-colors px-2 py-0.5 rounded hover:bg-muted"
                >
                  Mark received
                </button>
              ) : (
                <span className={cn('flex items-center gap-1 text-[11px] font-medium', config.className)}>
                  <Icon className="size-3" />
                  {config.label}
                </span>
              )}
            </div>
          )
        })}

        {/* Missing types with no document entry */}
        {missingTypes.map(docType => (
          <div
            key={docType}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 opacity-60"
          >
            <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-xs text-foreground truncate">
              {DOCUMENT_LABELS[docType]}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent-foreground">
              <Clock className="size-3" />
              Pending
            </span>
          </div>
        ))}
      </div>

      {/* Other documents */}
      {otherDocs.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
            Other
          </div>
          {otherDocs.map(doc => {
            const config = statusConfig[doc.status]
            const Icon = config.icon

            return (
              <div
                key={doc.id}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-xs text-foreground truncate">{doc.label}</span>
                <span className={cn('flex items-center gap-1 text-[11px] font-medium', config.className)}>
                  <Icon className="size-3" />
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
