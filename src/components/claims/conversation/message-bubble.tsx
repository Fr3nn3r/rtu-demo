import type { ClaimMessage } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Paperclip } from 'lucide-react'

interface MessageBubbleProps {
  message: ClaimMessage
  onClickPendingDraft?: (message: ClaimMessage) => void
}

function formatTimestamp(message: ClaimMessage): string {
  const iso = message.direction === 'outbound'
    ? (message.sentAt ?? message.generatedAt)
    : message.receivedAt
  return format(new Date(iso), 'dd MMM HH:mm')
}

function participantLabel(message: ClaimMessage): string {
  if (message.direction === 'outbound') {
    return `${message.from.name} → ${message.to.join(', ')}`
  }
  return `← ${message.from.name} <${message.from.email}>`
}

function bodyPreview(body: string, maxLines = 6): string {
  const lines = body.split('\n')
  if (lines.length <= maxLines) return body
  return lines.slice(0, maxLines).join('\n') + '\n…'
}

export function MessageBubble({ message, onClickPendingDraft }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound'
  const isPending = isOutbound && message.state === 'pending'
  const isUnmatchedAssigned = !isOutbound && message.source === 'unmatched_assigned'

  const variantClasses = isOutbound
    ? cn(
        'border-l-4 border-l-primary bg-primary/5',
        isPending && 'border-l-dashed opacity-70 cursor-pointer hover:opacity-100 transition-opacity',
      )
    : 'border-l-4 border-l-accent-foreground bg-accent/30'

  const handleClick = isPending ? () => onClickPendingDraft?.(message) : undefined

  return (
    <Card
      className={cn('p-3 mb-3 shadow-xs', variantClasses)}
      onClick={handleClick}
      role={isPending ? 'button' : undefined}
      tabIndex={isPending ? 0 : undefined}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="text-xs font-medium text-foreground truncate">
          {participantLabel(message)}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isPending && <Badge variant="outline" className="text-[10px]">Draft — not yet sent</Badge>}
          {isUnmatchedAssigned && <Badge variant="secondary" className="text-[10px]">Assigned from inbox</Badge>}
          <div className="text-[11px] text-muted-foreground">
            {formatTimestamp(message)}
          </div>
        </div>
      </div>
      <div className="text-xs font-medium text-foreground mb-1 truncate">
        {message.subject}
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {bodyPreview(message.body)}
      </div>
      {message.attachments.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
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
    </Card>
  )
}
