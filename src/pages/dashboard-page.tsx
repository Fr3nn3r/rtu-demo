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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']
const SLA_COLORS: Record<SLAStatus, string> = {
  within: 'var(--chart-1)',
  approaching: 'var(--chart-3)',
  breached: 'var(--chart-2)',
}

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
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Active Claims by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
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
        </Card>

        <Card className="p-4">
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
        </Card>
      </div>

      {/* ── Operator Workload + Assessor Performance ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="px-4 py-3 bg-muted flex-row items-center gap-2 space-y-0">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Operator Workload</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Operator</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Active</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operatorWorkload.map(op => (
                  <TableRow key={op.name}>
                    <TableCell className="px-4 py-2.5 text-sm">{op.name}</TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-center font-medium">{op.active}</TableCell>
                    <TableCell className="px-4 py-2.5 text-center">
                      {op.overdue > 0 ? (
                        <Badge variant="destructive" className="font-bold">{op.overdue}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="px-4 py-3 bg-muted flex-row items-center gap-2 space-y-0">
            <BarChart3 className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Assessor / Investigator Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Name</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Role</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Active</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessorPerformance.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="px-4 py-4 text-center text-sm text-muted-foreground">No assignments yet</TableCell></TableRow>
                ) : (
                  assessorPerformance.map(a => (
                    <TableRow key={a.name}>
                      <TableCell className="px-4 py-2.5 text-sm font-medium">{a.name}</TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-muted-foreground capitalize">{a.role}</TableCell>
                      <TableCell className="px-4 py-2.5 text-sm text-center">{a.active}</TableCell>
                      <TableCell className="px-4 py-2.5 text-sm text-center">{a.completed}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Time to Close + Breached SLAs ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="px-4 py-3 bg-muted flex-row items-center gap-2 space-y-0">
            <Clock className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Average Time to Close</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Claim Type</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Avg Days</TableHead>
                  <TableHead className="px-4 text-[11px] text-muted-foreground uppercase text-center">Closed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeToClose.map(t => (
                  <TableRow key={t.type}>
                    <TableCell className="px-4 py-2.5"><ClaimTypeBadge type={t.type} /></TableCell>
                    <TableCell className="px-4 py-2.5 text-center text-sm font-semibold">{t.count > 0 ? `${t.avg}d` : '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-center text-sm text-muted-foreground">{t.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {breachedClaims.length > 0 && (
          <Card className="overflow-hidden border-destructive/20">
            <CardHeader className="px-4 py-3 bg-destructive/10 flex-row items-center gap-2 space-y-0">
              <AlertCircle className="size-4 text-destructive" />
              <CardTitle className="text-sm text-destructive">Breached SLAs ({breachedClaims.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Claim</TableHead>
                    <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Type</TableHead>
                    <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Status</TableHead>
                    <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">SLA</TableHead>
                    <TableHead className="px-4 text-[11px] text-muted-foreground uppercase">Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breachedClaims.map(claim => (
                    <TableRow key={claim.id} className="bg-destructive/5">
                      <TableCell className="px-4 py-2">
                        <Link to={`/claims/${claim.id}`} className="text-sm font-medium text-primary hover:underline">
                          {claim.id}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-2"><ClaimTypeBadge type={claim.type} /></TableCell>
                      <TableCell className="px-4 py-2"><StatusBadge status={claim.status} /></TableCell>
                      <TableCell className="px-4 py-2"><SlaIndicator claim={claim} /></TableCell>
                      <TableCell className="px-4 py-2 text-sm text-muted-foreground">{claim.assignedTo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
    primary: 'bg-primary/10 text-primary',
    danger: 'bg-destructive/10 text-destructive',
    success: 'bg-primary/10 text-primary',
    warning: 'bg-accent text-accent-foreground',
  }

  return (
    <Card className="p-4 bg-gradient-to-t from-primary/5 to-card">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </Card>
  )
}
