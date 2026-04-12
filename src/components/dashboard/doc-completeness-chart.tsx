import { Card } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts'
import { seedDocCompleteness } from '@/data/seed-doc-completeness'

export function DocCompletenessChart() {
  // Format dates for display (dd/MM)
  const data = seedDocCompleteness.map(d => ({
    ...d,
    label: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
  }))

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Outstanding Document Packs</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <RechartsTooltip
            formatter={(value: unknown) => [`${value} claims`, 'Incomplete']}
            labelFormatter={(label: unknown) => `Date: ${label}`}
          />
          <Bar dataKey="claimsWithIncomplete" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
