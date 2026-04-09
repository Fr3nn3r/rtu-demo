import { useState } from 'react'
import type { Claim, DraftCommunication } from '@/types'
import { DraftCommunicationModal } from '../draft-communication-modal'
import { Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function CommunicationsPanel({ claim }: { claim: Claim }) {
  const [selectedComm, setSelectedComm] = useState<DraftCommunication | null>(null)

  if (claim.communications.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center text-xs text-muted-foreground">
        <Mail className="size-5 mb-2" />
        No communications yet
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        {claim.communications.map(comm => (
          <button
            key={comm.id}
            type="button"
            onClick={() => setSelectedComm(comm)}
            className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
          >
            <Mail className="mt-0.5 size-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{comm.subject}</div>
              <div className="text-[11px] text-muted-foreground">To: {comm.to}</div>
            </div>
            <div className={cn(
              'text-[11px] font-medium flex items-center gap-0.5 flex-shrink-0',
              comm.sentAt ? 'text-primary' : 'text-accent-foreground',
            )}>
              {comm.sentAt ? (
                <><Check className="size-3" />{format(new Date(comm.sentAt), 'HH:mm')}</>
              ) : (
                'Pending'
              )}
            </div>
          </button>
        ))}
      </div>

      <DraftCommunicationModal
        communication={selectedComm}
        open={selectedComm !== null}
        onOpenChange={open => { if (!open) setSelectedComm(null) }}
      />
    </>
  )
}
