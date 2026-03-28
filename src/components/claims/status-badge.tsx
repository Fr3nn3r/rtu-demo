import type { WorkflowState } from '@/types'
import { stateLabels } from '@/data/workflow-definitions'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className }: { status: WorkflowState; className?: string }) {
  const isClosed = status === 'CLOSED'
  const isRejected = status === 'REJECTED' || status === 'INVALID'

  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      isClosed && 'bg-success-50 text-success-700 border-success-500/30',
      isRejected && 'bg-danger-50 text-danger-700 border-danger-500/30',
      !isClosed && !isRejected && 'bg-surface-secondary text-text-secondary border-border-strong',
      className,
    )}>
      {stateLabels[status]}
    </span>
  )
}
