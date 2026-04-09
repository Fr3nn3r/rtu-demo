import { useState, useMemo } from 'react'
import { useClaims } from '@/context/ClaimContext'
import { getClaimSLAStatus } from '@/lib/workflow-engine'
import type { SLAStatus } from '@/types'
import { Card } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  Cell, AreaChart, Area, LineChart, Line, ReferenceLine,
} from 'recharts'
import { historicalClaims } from '@/data/seed-historical-claims'
import {
  filterByPeriod,
  aggregateVolume,
  aggregateByType,
  aggregateAvgClose,
  aggregateSettlements,
  aggregateSlaCompliance,
  aggregateHandlerWorkload,
  formatZAR,
} from '@/lib/trend-utils'
import type { TimePeriod } from '@/types'

const SLA_COLORS: Record<SLAStatus, string> = {
  within: 'var(--chart-1)',
  approaching: 'var(--chart-3)',
  breached: 'var(--chart-2)',
}

export function DashboardPage() {
  const { claims } = useClaims()

  const activeClaims = useMemo(() => claims.filter(c => c.status !== 'CLOSED'), [claims])

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

  // ── Portfolio Trends ───────────────────────────────────────
  const [period, setPeriod] = useState<TimePeriod>('1M')

  const volumeData = useMemo(
    () => aggregateVolume(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )
  const typeOverTimeData = useMemo(
    () => aggregateByType(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )
  const avgCloseData = useMemo(
    () => aggregateAvgClose(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const settlementData = useMemo(
    () => aggregateSettlements(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const slaComplianceData = useMemo(
    () => aggregateSlaCompliance(filterByPeriod(historicalClaims, period, 'closedAt'), period),
    [period],
  )
  const handlerWorkloadData = useMemo(
    () => aggregateHandlerWorkload(filterByPeriod(historicalClaims, period, 'createdAt'), period),
    [period],
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* ── Portfolio Trends ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Portfolio Trends</h2>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['1W', '1M', '1Y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Claims Volume */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Claims Volume</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 2: Claims by Type */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Claims by Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={typeOverTimeData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="accident" stackId="1" fill="var(--chart-1)" stroke="var(--chart-1)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="glass" stackId="1" fill="var(--chart-2)" stroke="var(--chart-2)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="theft" stackId="1" fill="var(--chart-3)" stroke="var(--chart-3)" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 3: Avg Days to Close */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Avg Days to Close</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={avgCloseData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} unit="d" />
              <RechartsTooltip />
              <Line type="monotone" dataKey="accident" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="glass" stroke="var(--chart-2)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="theft" stroke="var(--chart-3)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 4: Settlement Amounts */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Settlement Amounts</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={settlementData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatZAR} />
              <RechartsTooltip formatter={(value: unknown) => formatZAR(Number(value))} />
              <Bar dataKey="amount" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 5: SLA Compliance Rate */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">SLA Compliance Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={slaComplianceData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <RechartsTooltip formatter={(value: unknown) => typeof value === 'number' ? `${value}%` : '—'} />
              <ReferenceLine y={80} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="rate" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 6: Handler Workload */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Handler Workload</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={handlerWorkloadData.data}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              {handlerWorkloadData.handlers.map((handler, i) => (
                <Bar
                  key={handler}
                  dataKey={handler}
                  stackId="handlers"
                  fill={`var(--chart-${(i % 5) + 1})`}
                  radius={i === handlerWorkloadData.handlers.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Live SLA Status ────────────────────────────────── */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Live SLA Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={slaPerformance} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
            <RechartsTooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {slaPerformance.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  )
}
