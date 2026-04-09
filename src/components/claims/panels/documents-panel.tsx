import type { Claim, DocumentStatus } from '@/types'
import { useClaims } from '@/context/ClaimContext'
import { FileText, Check, Clock, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<DocumentStatus, { icon: typeof Check; label: string; className: string }> = {
  received: { icon: Check, label: 'Received', className: 'text-primary' },
  pending: { icon: Clock, label: 'Pending', className: 'text-accent-foreground' },
  not_required: { icon: Minus, label: 'N/A', className: 'text-muted-foreground' },
}

export function DocumentsPanel({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()

  function cycleStatus(docId: string, current: DocumentStatus) {
    const order: DocumentStatus[] = ['pending', 'received', 'not_required']
    const next = order[(order.indexOf(current) + 1) % order.length]
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', claimId: claim.id, docId, status: next })
  }

  return (
    <div className="space-y-1">
      {claim.documents.map(doc => {
        const config = statusConfig[doc.status]
        const Icon = config.icon

        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => cycleStatus(doc.id, doc.status)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted transition-colors"
          >
            <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-xs text-foreground truncate">{doc.label}</span>
            <span className={cn('flex items-center gap-1 text-[11px] font-medium', config.className)}>
              <Icon className="size-3" />
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
