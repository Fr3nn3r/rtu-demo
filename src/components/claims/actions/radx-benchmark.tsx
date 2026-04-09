import { TrendingDown } from 'lucide-react'
import { formatZAR } from '@/lib/utils'

interface BenchmarkPart {
  name: string
  assessorQuote: number
  radxBenchmark: number
}

const mockParts: BenchmarkPart[] = [
  { name: 'Front bumper', assessorQuote: 4200, radxBenchmark: 3680 },
  { name: 'Headlight LH', assessorQuote: 2800, radxBenchmark: 2450 },
  { name: 'Bonnet', assessorQuote: 5100, radxBenchmark: 4890 },
  { name: 'Fender RH', assessorQuote: 1900, radxBenchmark: 1650 },
]

export function RadxBenchmark() {
  const totalAssessor = mockParts.reduce((sum, p) => sum + p.assessorQuote, 0)
  const totalRadx = mockParts.reduce((sum, p) => sum + p.radxBenchmark, 0)
  const totalSaving = totalAssessor - totalRadx
  const totalPercent = Math.round((totalSaving / totalAssessor) * 100)

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="size-4 text-primary-600" />
        <h4 className="text-sm font-semibold text-primary-700">Radx Parts Benchmark</h4>
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-600 uppercase">
          Preview
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-primary-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary-50/50">
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-text-secondary uppercase">Part</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Assessor</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Radx</th>
              <th className="px-3 py-1.5 text-right text-[11px] font-medium text-text-secondary uppercase">Variance</th>
            </tr>
          </thead>
          <tbody>
            {mockParts.map(part => {
              const saving = part.assessorQuote - part.radxBenchmark
              const percent = Math.round((saving / part.assessorQuote) * 100)
              return (
                <tr key={part.name} className="border-t border-primary-100">
                  <td className="px-3 py-1.5 text-text-primary">{part.name}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">{formatZAR(part.assessorQuote)}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">{formatZAR(part.radxBenchmark)}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-success-600">
                    -{formatZAR(saving)} ({percent}%)
                  </td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-primary-200 bg-primary-50/30 font-semibold">
              <td className="px-3 py-2 text-text-primary">Total</td>
              <td className="px-3 py-2 text-right">{formatZAR(totalAssessor)}</td>
              <td className="px-3 py-2 text-right">{formatZAR(totalRadx)}</td>
              <td className="px-3 py-2 text-right text-success-600">
                -{formatZAR(totalSaving)} ({totalPercent}%)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Potential saving: {formatZAR(totalSaving)} ({totalPercent}%) based on Radx OEM pricing database.
      </p>
    </div>
  )
}
