import { Link } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import type { Claim } from '@/types'
import { ClaimTypeBadge } from './claim-type-badge'
import { StatusBadge } from './status-badge'
import { SlaIndicator } from './sla-indicator'
import { format } from 'date-fns'

export function ClaimHeader({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-2">
      <Link
        to="/claims"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Claims
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{claim.id}</h1>
            <ClaimTypeBadge type={claim.type} />
            <StatusBadge status={claim.status} />
            <SlaIndicator claim={claim} />
          </div>
          <p className="text-sm text-text-secondary">
            {claim.insured.name} — {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model} ({claim.vehicle.registration})
          </p>
        </div>

        <div className="text-right text-sm text-text-secondary space-y-0.5">
          <div className="flex items-center justify-end gap-1.5">
            <User className="size-3.5" />
            <span>{claim.assignedTo}</span>
          </div>
          <div>Created: {format(new Date(claim.createdAt), 'dd MMM yyyy, HH:mm')}</div>
          <div>Updated: {format(new Date(claim.updatedAt), 'dd MMM yyyy, HH:mm')}</div>
        </div>
      </div>
    </div>
  )
}
