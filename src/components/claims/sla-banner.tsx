import type { Claim } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'

export function SlaBanner({ claim }: { claim: Claim }) {
  const sla = getClaimSLAStatus(claim)

  if (!sla || !sla.isActive) return null

  if (sla.status === 'breached') {
    return (
      <div className="animate-pulse rounded-lg border-2 border-danger-500/60 bg-danger-50 px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-danger-500 text-white">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-danger-700 uppercase tracking-wide">SLA Breached</div>
          <p className="text-sm text-danger-600">{sla.timeRemaining} — immediate action required</p>
        </div>
      </div>
    )
  }

  if (sla.status === 'approaching') {
    return (
      <div className="rounded-lg border border-warning-300 bg-warning-50 px-4 py-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-warning-500 text-white">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-warning-700">SLA Approaching</div>
          <p className="text-sm text-warning-600">{sla.timeRemaining} remaining — act now</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-success-500/30 bg-success-50/50 px-4 py-2.5 flex items-center gap-3">
      <Clock className="size-4 text-success-600" />
      <span className="text-sm text-success-700">SLA: {sla.timeRemaining} remaining</span>
    </div>
  )
}
