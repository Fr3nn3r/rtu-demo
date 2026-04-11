import { useClaims } from '@/context/ClaimContext'
import { UnmatchedMessageCard } from '@/components/inbox/unmatched-message-card'
import { Card } from '@/components/ui/card'
import { Inbox as InboxIcon } from 'lucide-react'

export function InboxPage() {
  const { unmatchedMessages } = useClaims()

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Unmatched Inbound {unmatchedMessages.length > 0 && `(${unmatchedMessages.length})`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Messages that arrived in <code className="text-xs">claims@rtusa.co.za</code> without a recognisable{' '}
          <code className="text-xs">[CP-{`{ClaimID}`}]</code> token. Assign each to a claim or mark as not claim-related.
        </p>
      </div>

      {unmatchedMessages.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <InboxIcon className="size-8 text-muted-foreground mb-3" />
          <div className="text-sm font-medium text-foreground">All inbound is threaded</div>
          <div className="text-xs text-muted-foreground mt-1">Nothing to triage.</div>
        </Card>
      ) : (
        <div>
          {unmatchedMessages.map(msg => (
            <UnmatchedMessageCard key={msg.id} message={msg} />
          ))}
        </div>
      )}
    </div>
  )
}
