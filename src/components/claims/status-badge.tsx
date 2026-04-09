import type { WorkflowState } from '@/types'
import { stateLabels } from '@/data/workflow-definitions'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className }: { status: WorkflowState; className?: string }) {
  const isClosed = status === 'CLOSED'
  const isRejected = status === 'REJECTED' || status === 'INVALID'

  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      isClosed && 'bg-primary/10 text-primary border-primary/30',
      isRejected && 'bg-destructive/10 text-destructive border-destructive/30',
      !isClosed && !isRejected && 'bg-muted text-muted-foreground border-border',
      className,
    )}>
      {stateLabels[status]}
    </span>
  )
}
