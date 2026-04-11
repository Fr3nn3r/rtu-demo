import type { Claim, AuditActionType } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  PlusCircle, ArrowRightLeft, Edit, FileText, UserPlus, Send, Mail, AlertTriangle, AlertCircle, MessageSquare, Download, Inbox,
} from 'lucide-react'

const iconMap: Record<AuditActionType, typeof PlusCircle> = {
  claim_created: PlusCircle,
  status_changed: ArrowRightLeft,
  field_updated: Edit,
  document_updated: FileText,
  contact_assigned: UserPlus,
  message_generated: Mail,
  message_sent: Send,
  message_received: Inbox,
  message_assigned: ArrowRightLeft,
  sla_warning: AlertTriangle,
  sla_breached: AlertCircle,
  note_added: MessageSquare,
}

function exportAuditLog(claim: Claim) {
  const entries = [...claim.auditTrail].reverse()
  const lines = [
    `# Audit Trail — ${claim.workflow.spmClaimNumber || claim.id}`,
    ``,
    `**Claim:** ${claim.id}`,
    `**Type:** ${claim.type}`,
    `**Insured:** ${claim.insured.name}`,
    `**Exported:** ${format(new Date(), 'dd MMM yyyy, HH:mm')}`,
    ``,
    `---`,
    ``,
    ...entries.map(entry =>
      `- **${format(new Date(entry.timestamp), 'dd MMM yyyy, HH:mm')}** — ${entry.description}  \n  _${entry.user}_${entry.oldValue ? ` | ${entry.oldValue} → ${entry.newValue}` : ''}`
    ),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-trail-${claim.workflow.spmClaimNumber || claim.id}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditTrailPanel({ claim }: { claim: Claim }) {
  const entries = [...claim.auditTrail].reverse()

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center text-xs text-muted-foreground">
        No activity yet
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-0 overflow-y-auto max-h-[450px] pr-1">
        {entries.map((entry, i) => {
          const Icon = iconMap[entry.actionType] ?? MessageSquare
          const isLast = i === entries.length - 1

          return (
            <div key={entry.id} className="flex gap-2">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div className="flex size-5 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-3 text-muted-foreground" />
                </div>
                {!isLast && <div className="w-px flex-1 bg-border" />}
              </div>

              {/* Content */}
              <div className={cn('pb-3 min-w-0', isLast && 'pb-0')}>
                <div className="text-xs text-foreground">{entry.description}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {entry.user} &middot; {format(new Date(entry.timestamp), 'dd MMM HH:mm')}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border pt-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => exportAuditLog(claim)}
        >
          <Download className="size-3 mr-1.5" />
          Export Audit Trail
        </Button>
      </div>
    </div>
  )
}
