import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClaims } from '@/context/ClaimContext'
import { ClaimTypeBadge } from '@/components/claims/claim-type-badge'
import { SlaIndicator } from '@/components/claims/sla-indicator'
import { MiniWorkflowBar } from '@/components/claims/mini-workflow-bar'
import { NewClaimDialog } from '@/components/claims-list/new-claim-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Claim, ClaimType, SLAStatus } from '@/types'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { stateLabels } from '@/data/workflow-definitions'
import { format } from 'date-fns'
import { Search, Filter, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type FilterTab = 'all' | 'my_queue' | ClaimType

export function ClaimsListPage() {
  const { claims, dispatch } = useClaims()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [newClaimType, setNewClaimType] = useState<ClaimType | null>(null)

  const currentUser = 'Nikki Pearmain'

  const filtered = useMemo(() => {
    let result = [...claims]

    if (activeTab === 'my_queue') {
      result = result.filter(c => c.assignedTo === currentUser)
    } else if (activeTab !== 'all') {
      result = result.filter(c => c.type === activeTab)
    }

    if (statusFilter === 'active') result = result.filter(c => c.status !== 'CLOSED')
    if (statusFilter === 'closed') result = result.filter(c => c.status === 'CLOSED')

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.insured.name.toLowerCase().includes(q) ||
        c.vehicle.registration.toLowerCase().includes(q) ||
        (c.workflow.policyNumber?.toLowerCase().includes(q)) ||
        (c.workflow.spmClaimNumber?.toLowerCase().includes(q))
      )
    }

    return result.sort((a, b) => {
      const slaA = getClaimSLAStatus(a)
      const slaB = getClaimSLAStatus(b)
      const order: Record<SLAStatus, number> = { breached: 0, approaching: 1, within: 2 }

      if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1
      if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1

      const orderA = slaA ? order[slaA.status] : 3
      const orderB = slaB ? order[slaB.status] : 3
      if (orderA !== orderB) return orderA - orderB

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [claims, activeTab, search, statusFilter])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Claims' },
    { key: 'my_queue', label: 'My Queue' },
    { key: 'accident', label: 'Accident' },
    { key: 'theft', label: 'Theft' },
    { key: 'glass', label: 'Glass' },
  ]

  function handleFastForward(hours: number) {
    dispatch({ type: 'FAST_FORWARD', hours })
    toast.info(`Clock advanced by ${hours}h`)
  }

  function handleClaimCreated(claimId: string) {
    setNewClaimType(null)
    navigate(`/claims/${claimId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Claims Work Queue</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{filtered.length} claims</span>
          {[1, 3, 6, 12, 24].map(h => (
            <Button key={h} size="xs" variant="ghost" onClick={() => handleFastForward(h)} title={`Fast-forward SLAs by ${h} hours`}>
              +{h}h
            </Button>
          ))}
          <Button size="xs" variant="ghost" onClick={() => handleFastForward(168)} title="Fast-forward SLAs by 7 days">
            +7d
          </Button>
          <div className="h-5 w-px bg-border" />
          <Button size="sm" onClick={() => setNewClaimType('accident')}>
            <Plus className="size-3.5" data-icon="inline-start" />
            New Accident
          </Button>
          <Button size="sm" onClick={() => setNewClaimType('theft')}>
            <Plus className="size-3.5" data-icon="inline-start" />
            New Theft
          </Button>
          <Button size="sm" onClick={() => setNewClaimType('glass')}>
            <Plus className="size-3.5" data-icon="inline-start" />
            New Glass
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by SPM #, name, registration, policy..."
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="size-4 text-text-muted" />
          {(['all', 'active', 'closed'] as const).map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Closed'}
            </Button>
          ))}
        </div>
      </div>

      {/* Claims table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-surface-secondary">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">SPM #</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Type</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Policyholder</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Progress</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">SLA</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Assigned</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Updated</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(claim => (
                <ClaimRow key={claim.id} claim={claim} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-text-muted">
                    No claims match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Claim Dialog */}
      <NewClaimDialog
        type={newClaimType}
        open={newClaimType !== null}
        onOpenChange={open => { if (!open) setNewClaimType(null) }}
        onCreated={handleClaimCreated}
      />
    </div>
  )
}

function ClaimRow({ claim }: { claim: Claim }) {
  const sla = getClaimSLAStatus(claim)

  const rowTint = sla?.status === 'breached'
    ? 'bg-danger-50/40'
    : sla?.status === 'approaching'
      ? 'bg-warning-50/40'
      : ''

  return (
    <tr className={cn(
      'border-b border-border last:border-b-0 hover:bg-surface-secondary/50 transition-colors',
      rowTint,
    )}>
      <td className="px-4 py-2.5">
        <Link to={`/claims/${claim.id}`} className="text-sm font-medium text-primary-600 hover:underline">
          {claim.workflow.spmClaimNumber || claim.id}
        </Link>
        {claim.workflow.spmClaimNumber && (
          <div className="text-[11px] text-text-muted">{claim.id}</div>
        )}
      </td>
      <td className="px-4 py-2.5">
        <ClaimTypeBadge type={claim.type} />
      </td>
      <td className="px-4 py-2.5 text-sm">{claim.insured.name}</td>
      <td className="px-4 py-2.5 text-sm text-text-secondary">
        {claim.vehicle.registration}
      </td>
      <td className="px-4 py-2.5">
        <MiniWorkflowBar claim={claim} />
      </td>
      <td className="px-4 py-2.5">
        <span className="text-xs text-text-secondary">{stateLabels[claim.status]}</span>
      </td>
      <td className="px-4 py-2.5">
        <SlaIndicator claim={claim} />
      </td>
      <td className="px-4 py-2.5 text-sm text-text-secondary">{claim.assignedTo}</td>
      <td className="px-4 py-2.5 text-xs text-text-secondary">
        {format(new Date(claim.updatedAt), 'dd MMM HH:mm')}
      </td>
      <td className="px-4 py-2.5">
        <Link to={`/claims/${claim.id}`}>
          <ChevronRight className="size-4 text-text-muted" />
        </Link>
      </td>
    </tr>
  )
}
