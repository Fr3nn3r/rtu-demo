import type { Claim, AuditActionType } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  PlusCircle, ArrowRightLeft, Edit, FileText, UserPlus, Send, Mail, AlertTriangle, AlertCircle, MessageSquare,
} from 'lucide-react'

const iconMap: Record<AuditActionType, typeof PlusCircle> = {
  claim_created: PlusCircle,
  status_changed: ArrowRightLeft,
  field_updated: Edit,
  document_updated: FileText,
  contact_assigned: UserPlus,
  communication_sent: Send,
  communication_generated: Mail,
  sla_warning: AlertTriangle,
  sla_breached: AlertCircle,
  note_added: MessageSquare,
}

export function AuditTrailPanel({ claim }: { claim: Claim }) {
  const entries = [...claim.auditTrail].reverse()

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center text-xs text-text-muted">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, i) => {
        const Icon = iconMap[entry.actionType] ?? MessageSquare
        const isLast = i === entries.length - 1

        return (
          <div key={entry.id} className="flex gap-2">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className="flex size-5 items-center justify-center rounded-full bg-surface-secondary">
                <Icon className="size-3 text-text-muted" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className={cn('pb-3 min-w-0', isLast && 'pb-0')}>
              <div className="text-xs text-text-primary">{entry.description}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                {entry.user} &middot; {format(new Date(entry.timestamp), 'dd MMM HH:mm')}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
