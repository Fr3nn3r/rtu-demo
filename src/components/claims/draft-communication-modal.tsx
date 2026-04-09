import type { DraftCommunication } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'
import { useClaims } from '@/context/ClaimContext'
import { Copy, Send, Mail, User, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface DraftCommunicationModalProps {
  communication: DraftCommunication | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DraftCommunicationModal({ communication, open, onOpenChange }: DraftCommunicationModalProps) {
  const { dispatch } = useClaims()

  if (!communication) return null

  async function handleCopy() {
    const text = `To: ${communication!.to}\nSubject: ${communication!.subject}\n\n${communication!.body}`
    const ok = await copyToClipboard(text)
    if (ok) toast.success('Copied to clipboard')
  }

  function handleMarkSent() {
    dispatch({
      type: 'MARK_COMMUNICATION_SENT',
      claimId: communication!.claimId,
      communicationId: communication!.id,
    })
    toast.success('Marked as sent')
    onOpenChange(false)
  }

  const isSent = !!communication.sentAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Draft Communication
            {isSent && (
              <Badge variant="outline" className="ml-2">Sent</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Email-style layout */}
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Email header */}
          <div className="bg-muted px-5 py-3 space-y-2 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-16 text-xs font-medium text-muted-foreground">
                <User className="size-3.5" />
                To
              </div>
              <span className="text-sm font-medium">{communication.to}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-16 text-xs font-medium text-muted-foreground">
                <FileText className="size-3.5" />
                Subject
              </div>
              <span className="text-sm font-semibold">{communication.subject}</span>
            </div>
            {communication.sentAt && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-16 text-xs font-medium text-muted-foreground">
                  <Send className="size-3.5" />
                  Sent
                </div>
                <span className="text-xs text-primary font-medium">
                  {format(new Date(communication.sentAt), 'dd MMM yyyy, HH:mm')}
                </span>
              </div>
            )}
          </div>

          {/* Email body */}
          <ScrollArea className="px-5 py-4 bg-card min-h-[200px] max-h-[400px]">
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {communication.body}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(communication.createdAt), 'dd MMM yyyy, HH:mm')}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="size-4" data-icon="inline-start" />
              Copy to Clipboard
            </Button>
            {!isSent && (
              <Button onClick={handleMarkSent}>
                <Send className="size-4" data-icon="inline-start" />
                Mark as Sent
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
