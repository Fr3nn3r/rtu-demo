import type { Claim } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'

export function SlaBanner({ claim }: { claim: Claim }) {
  const sla = getClaimSLAStatus(claim)
  if (!sla || !sla.isActive) return null

  if (sla.status === 'breached') {
    return (
      <div className="animate-pulse rounded-lg border-2 border-destructive/60 bg-destructive/10 px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-destructive uppercase tracking-wide">SLA Breached</div>
          <p className="text-sm text-destructive">{sla.timeRemaining} — immediate action required</p>
        </div>
      </div>
    )
  }

  if (sla.status === 'approaching') {
    return (
      <div className="rounded-lg border border-accent-foreground/30 bg-accent px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-accent-foreground text-accent">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-accent-foreground">SLA Approaching</div>
          <p className="text-sm text-accent-foreground">{sla.timeRemaining} remaining — act now</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex items-center gap-3">
      <Clock className="size-4 text-primary" />
      <span className="text-sm text-primary">SLA: {sla.timeRemaining} remaining</span>
    </div>
  )
}
