import type { ClaimType } from '@/types'
import { cn } from '@/lib/utils'

const typeStyles: Record<ClaimType, string> = {
  accident: 'bg-primary-50 text-primary-700 border-primary-200',
  theft: 'bg-danger-50 text-danger-700 border-danger-200',
  glass: 'bg-warning-50 text-warning-600 border-warning-200',
}

const typeLabels: Record<ClaimType, string> = {
  accident: 'Accident',
  theft: 'Theft',
  glass: 'Glass',
}

export function ClaimTypeBadge({ type, className }: { type: ClaimType; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      typeStyles[type],
      className,
    )}>
      {typeLabels[type]}
    </span>
  )
}
