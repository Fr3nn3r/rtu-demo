import { useState, useMemo } from 'react'
import type { Claim, ClaimMessage, InboundMessage, OutboundMessage } from '@/types'
import { MessageBubble } from './message-bubble'
import { DraftModal } from './draft-modal'
import { SimulateReplyDropdown } from './simulate-reply-dropdown'
import { sortMessagesChronologically } from '@/lib/messages'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mail } from 'lucide-react'
import { formatDistanceStrict } from 'date-fns'

interface ConversationViewProps {
  claim: Claim
}

function getLatestInbound(messages: ClaimMessage[]): InboundMessage | null {
  const inbound = messages
    .filter((m): m is InboundMessage => m.direction === 'inbound')
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  return inbound[0] ?? null
}

export function ConversationView({ claim }: ConversationViewProps) {
  const [activeDraft, setActiveDraft] = useState<OutboundMessage | null>(null)

  const sortedMessages = useMemo(() => sortMessagesChronologically(claim.messages), [claim.messages])
  const latestInbound = useMemo(() => getLatestInbound(claim.messages), [claim.messages])

  function handleClickPendingDraft(message: ClaimMessage) {
    if (message.direction === 'outbound' && message.state === 'pending') {
      setActiveDraft(message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-border mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">
            Conversation — {claim.id}
          </div>
          {latestInbound && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Last inbound: {latestInbound.from.name} &middot; {formatDistanceStrict(new Date(latestInbound.receivedAt), new Date(), { addSuffix: true })}
            </div>
          )}
        </div>
        <SimulateReplyDropdown claim={claim} />
      </div>

      {/* Thread */}
      {sortedMessages.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
          <Mail className="size-6 mb-2" />
          <div className="text-sm">No messages yet</div>
          <div className="text-[11px] mt-1">Drafts and inbound replies will appear here as the claim progresses.</div>
        </div>
      ) : (
        <ScrollArea className="flex-1 max-h-[550px] pr-2">
          {sortedMessages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              onClickPendingDraft={handleClickPendingDraft}
            />
          ))}
        </ScrollArea>
      )}

      {/* Draft modal */}
      <DraftModal
        message={activeDraft}
        claimId={claim.id}
        open={activeDraft !== null}
        onOpenChange={(open) => { if (!open) setActiveDraft(null) }}
      />
    </div>
  )
}
