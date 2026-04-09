import type { ClaimType } from '@/types'
import { cn } from '@/lib/utils'

const typeStyles: Record<ClaimType, string> = {
  accident: 'bg-primary/10 text-primary border-primary/20',
  theft: 'bg-destructive/10 text-destructive border-destructive/20',
  glass: 'bg-accent text-accent-foreground border-accent-foreground/20',
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
