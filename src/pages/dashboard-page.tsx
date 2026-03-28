import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useClaims } from '@/context/ClaimContext'
import { useContacts } from '@/context/ContactContext'
import { ClaimTypeBadge } from '@/components/claims/claim-type-badge'
import { StatusBadge } from '@/components/claims/status-badge'
import { SlaIndicator } from '@/components/claims/sla-indicator'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import { stateLabels } from '@/data/workflow-definitions'
import type { Claim, ClaimType, WorkflowState, SLAStatus } from '@/types'
import { FileText, AlertCircle, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PIE_COLORS = ['#0ea5e9', '#ef4444', '#f59e0b']
const SLA_COLORS: Record<SLAStatus, string> = { within: '#22c55e', approaching: '#f59e0b', breached: '#ef4444' }

export function DashboardPage() {
  const { claims, getDashboardStats } = useClaims()
  const { contacts } = useContacts()
  const stats = getDashboardStats()

  const activeClaims = useMemo(() => claims.filter(c => c.status !== 'CLOSED'), [claims])

  const statusData = useMemo(() => {
    const counts: Partial<Record<WorkflowState, number>> = {}
    activeClaims.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1 })
    return Object.entries(counts)
      .map(([state, count]) => ({ name: stateLabels[state as WorkflowState], count }))
      .sort((a, b) => b.count - a.count)
  }, [activeClaims])

  const typeData = useMemo(() => {
    const counts = { accident: 0, theft: 0, glass: 0 }
    claims.forEach(c => { counts[c.type]++ })
    return [
      { name: 'Accident', value: counts.accident },
      { name: 'Theft', value: counts.theft },
      { name: 'Glass', value: counts.glass },
    ]
  }, [claims])

  // ── SLA Performance ────────────────────────────────────────
  const slaPerformance = useMemo(() => {
    const byStatus: Record<SLAStatus, number> = { within: 0, approaching: 0, breached: 0 }
    activeClaims.forEach(c => {
      const sla = getClaimSLAStatus(c)
      if (sla?.isActive) byStatus[sla.status]++
    })
    return [
      { name: 'Within SLA', value: byStatus.within, fill: SLA_COLORS.within },
      { name: 'Approaching', value: byStatus.approaching, fill: SLA_COLORS.approaching },
      { name: 'Breached', value: byStatus.breached, fill: SLA_COLORS.breached },
    ]
  }, [activeClaims])

  const breachedClaims = useMemo(() =>
    claims.filter(c => {
      const sla = getClaimSLAStatus(c)
      return sla?.status === 'breached'
    }).sort((a, b) => {
      const slaA = getClaimSLAStatus(a)
      const slaB = getClaimSLAStatus(b)
      return (slaB?.percentElapsed ?? 0) - (slaA?.percentElapsed ?? 0)
    }),
  [claims])

  // ── Operator Workload ──────────────────────────────────────
  const operatorWorkload = useMemo(() => {
    const operators: Record<string, { active: number; overdue: number }> = {}
    activeClaims.forEach(c => {
      if (!operators[c.assignedTo]) operators[c.assignedTo] = { active: 0, overdue: 0 }
      operators[c.assignedTo].active++
      const sla = getClaimSLAStatus(c)
      if (sla?.status === 'breached') operators[c.assignedTo].overdue++
    })
    return Object.entries(operators).map(([name, data]) => ({ name, ...data }))
  }, [activeClaims])

  // ── Assessor/Investigator Performance ──────────────────────
  const assessorPerformance = useMemo(() => {
    const assessors = contacts.filter(c => c.role === 'assessor' || c.role === 'investigator')
    return assessors.map(assessor => {
      const assigned = claims.filter(c =>
        c.workflow.assessorId === assessor.id || c.workflow.investigatorId === assessor.id
      )
      const active = assigned.filter(c => c.status !== 'CLOSED').length
      const completed = assigned.filter(c => c.status === 'CLOSED').length
      return { name: assessor.name, role: assessor.role, active, completed, total: assigned.length }
    }).filter(a => a.total > 0)
  }, [claims, contacts])

  // ── Time to Close ──────────────────────────────────────────
  const timeToClose = useMemo(() => {
    const closedClaims = claims.filter(c => c.status === 'CLOSED')
    const byType: Record<ClaimType, number[]> = { accident: [], theft: [], glass: [] }
    closedClaims.forEach(c => {
      const days = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      byType[c.type].push(days)
    })
    return Object.entries(byType).map(([type, days]) => ({
      type: type as ClaimType,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      avg: days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length * 10) / 10 : 0,
      count: days.length,
    }))
  }, [claims])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Active Claims" value={stats.activeClaims} color="primary" />
        <StatCard icon={AlertCircle} label="Breached SLAs" value={stats.breachedSLAs} color="danger" />
        <StatCard icon={TrendingUp} label="New This Month" value={stats.newThisMonth} color="success" />
        <StatCard icon={Clock} label="Avg Days to Close" value={stats.avgDaysToClose} color="warning" />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Active Claims by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Claims by Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">SLA Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={slaPerformance} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {slaPerformance.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Operator Workload + Assessor Performance ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-secondary flex items-center gap-2">
            <Users className="size-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Operator Workload</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Operator</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Active</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {operatorWorkload.map(op => (
                <tr key={op.name} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 text-sm">{op.name}</td>
                  <td className="px-4 py-2.5 text-sm text-center font-medium">{op.active}</td>
                  <td className="px-4 py-2.5 text-center">
                    {op.overdue > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-danger-50 px-2 py-0.5 text-xs font-bold text-danger-700">{op.overdue}</span>
                    ) : (
                      <span className="text-sm text-text-muted">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-secondary flex items-center gap-2">
            <BarChart3 className="size-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Assessor / Investigator Performance</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Name</th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Role</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Active</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Completed</th>
              </tr>
            </thead>
            <tbody>
              {assessorPerformance.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-text-muted">No assignments yet</td></tr>
              ) : (
                assessorPerformance.map(a => (
                  <tr key={a.name} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 text-sm font-medium">{a.name}</td>
                    <td className="px-4 py-2.5 text-xs text-text-secondary capitalize">{a.role}</td>
                    <td className="px-4 py-2.5 text-sm text-center">{a.active}</td>
                    <td className="px-4 py-2.5 text-sm text-center">{a.completed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Time to Close + Breached SLAs ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-secondary flex items-center gap-2">
            <Clock className="size-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Average Time to Close</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Claim Type</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Avg Days</th>
                <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-secondary uppercase">Closed</th>
              </tr>
            </thead>
            <tbody>
              {timeToClose.map(t => (
                <tr key={t.type} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5"><ClaimTypeBadge type={t.type} /></td>
                  <td className="px-4 py-2.5 text-center text-sm font-semibold">{t.count > 0 ? `${t.avg}d` : '—'}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-text-secondary">{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {breachedClaims.length > 0 && (
          <div className="rounded-xl border border-danger-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-danger-50 border-b border-danger-200 flex items-center gap-2">
              <AlertCircle className="size-4 text-danger-600" />
              <h3 className="text-sm font-semibold text-danger-700">Breached SLAs ({breachedClaims.length})</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Claim</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">SLA</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {breachedClaims.map(claim => (
                  <tr key={claim.id} className="border-b border-border last:border-b-0 bg-danger-50/30">
                    <td className="px-4 py-2">
                      <Link to={`/claims/${claim.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                        {claim.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2"><ClaimTypeBadge type={claim.type} /></td>
                    <td className="px-4 py-2"><StatusBadge status={claim.status} /></td>
                    <td className="px-4 py-2"><SlaIndicator claim={claim} /></td>
                    <td className="px-4 py-2 text-sm text-text-secondary">{claim.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof FileText
  label: string
  value: number
  color: 'primary' | 'danger' | 'success' | 'warning'
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    danger: 'bg-danger-50 text-danger-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  )
}
