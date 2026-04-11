import type { OutboundMessage } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useClaims } from '@/context/ClaimContext'
import { buildGmailComposeUrl } from '@/lib/messages'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'

interface DraftModalProps {
  message: OutboundMessage | null
  claimId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DraftModal({ message, claimId, open, onOpenChange }: DraftModalProps) {
  const { dispatch } = useClaims()

  if (!message) return null

  function handleOpenInGmail() {
    if (!message) return
    const url = buildGmailComposeUrl(message)
    window.open(url, '_blank', 'noopener,noreferrer')
    dispatch({ type: 'MARK_MESSAGE_SENT', claimId, messageId: message.id })
    onOpenChange(false)
    toast.success('Opened in Gmail. Draft marked as sent.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Draft email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1.5">
            <div className="text-muted-foreground">From:</div>
            <div className="text-foreground">{message.from.name} &lt;{message.from.email}&gt;</div>
            <div className="text-muted-foreground">To:</div>
            <div className="text-foreground break-all">{message.to.join(', ')}</div>
            {message.cc && message.cc.length > 0 && (
              <>
                <div className="text-muted-foreground">Cc:</div>
                <div className="text-foreground break-all">{message.cc.join(', ')}</div>
              </>
            )}
            <div className="text-muted-foreground">Bcc:</div>
            <div className="text-foreground break-all">{message.bcc.join(', ')}</div>
            <div className="text-muted-foreground">Subject:</div>
            <div className="text-foreground">{message.subject}</div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {message.body}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleOpenInGmail}>
            <ExternalLink className="size-4 mr-1.5" />
            Open in Gmail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
