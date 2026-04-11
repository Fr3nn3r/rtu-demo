import { useState } from 'react'
import type { InboundMessage } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { AssignToClaimPicker } from './assign-to-claim-picker'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Paperclip, UserPlus, XCircle } from 'lucide-react'

interface UnmatchedMessageCardProps {
  message: InboundMessage
}

export function UnmatchedMessageCard({ message }: UnmatchedMessageCardProps) {
  const { dispatch, getClaimById } = useClaims()
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleAssign(targetClaimId: string) {
    dispatch({
      type: 'ASSIGN_UNMATCHED_TO_CLAIM',
      messageId: message.id,
      targetClaimId,
    })
    const claim = getClaimById(targetClaimId)
    toast.success(`Assigned to ${claim?.id ?? targetClaimId}`)
  }

  function handleDismiss() {
    dispatch({ type: 'DISMISS_UNMATCHED', messageId: message.id })
    toast.success('Marked as not claim-related')
  }

  return (
    <>
      <Card className="p-4 mb-3 border-l-4 border-l-accent-foreground bg-accent/20">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">
              {message.from.name} <span className="text-muted-foreground text-xs">&lt;{message.from.email}&gt;</span>
            </div>
            <div className="text-xs font-medium text-foreground mt-0.5">
              {message.subject}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground flex-shrink-0">
            {format(new Date(message.receivedAt), 'dd MMM HH:mm')}
          </div>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mb-3 line-clamp-4">
          {message.body}
        </div>
        {message.attachments.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {message.attachments.map(att => (
              <div
                key={att.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground"
              >
                <Paperclip className="size-3" />
                <span>{att.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <UserPlus className="size-3.5 mr-1.5" />
            Assign to claim…
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <XCircle className="size-3.5 mr-1.5" />
            Not claim-related
          </Button>
        </div>
      </Card>

      <AssignToClaimPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={handleAssign}
      />
    </>
  )
}
