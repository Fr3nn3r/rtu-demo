import type { Claim } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'

const statusStyles = {
  within: 'bg-success-50 text-success-700 border-success-500/30',
  approaching: 'bg-warning-50 text-warning-600 border-warning-500/30',
  breached: 'bg-danger-50 text-danger-700 border-danger-500/30',
}

const statusIcons = {
  within: Clock,
  approaching: AlertTriangle,
  breached: AlertCircle,
}

export function SlaIndicator({ claim, className }: { claim: Claim; className?: string }) {
  const sla = getClaimSLAStatus(claim)

  if (!sla || !sla.isActive) return null

  const Icon = statusIcons[sla.status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
      statusStyles[sla.status],
      sla.status === 'breached' && 'animate-pulse font-bold',
      className,
    )}>
      <Icon className="size-3" />
      {sla.timeRemaining}
    </span>
  )
}
