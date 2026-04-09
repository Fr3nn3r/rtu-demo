import { useState } from 'react'
import type { Claim } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClaims } from '@/context/ClaimContext'
import { resolveAutoRoute } from '@/lib/workflow-engine'
import { formatZAR } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { RadxBenchmark } from './radx-benchmark'
import { DocumentDropZone } from '@/components/document-drop-zone'

const routeLabels = {
  WITHIN_EXCESS: 'Within Excess — claim will be closed',
  INTERNAL_APPROVAL: 'Internal Approval — operator review required',
  QA_APPOINTED: 'QA Review — claim exceeds R50,000 threshold',
} as const

export function AssessmentReceived({ claim }: { claim: Claim }) {
  const { dispatch } = useClaims()
  const [amount, setAmount] = useState(claim.workflow.assessedAmount?.toString() ?? '')
  const excess = claim.workflow.excessAmount ?? 0
  const assessedNum = Number(amount) || 0

  const route = assessedNum > 0 ? resolveAutoRoute(assessedNum, excess) : null

  function handleSubmit() {
    if (!route) return
    dispatch({
      type: 'ADVANCE_WORKFLOW',
      claimId: claim.id,
      toState: route,
      data: { assessedAmount: assessedNum },
    })
  }

  const isInvestigation = claim.status === 'INVESTIGATION_RECEIVED'

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter the assessed amount from the {isInvestigation ? 'investigation' : 'assessment'} report.
        The system will auto-route the claim based on the amount.
      </p>

      <DocumentDropZone
        label={`Upload ${isInvestigation ? 'Investigation' : 'Assessment'} Report`}
        onProcessed={() => {
          const randomAmount = 8000 + Math.floor(Math.random() * 37000)
          setAmount(String(randomAmount))
        }}
      />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-muted p-3">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Excess Amount</div>
          <div className="text-lg font-semibold">{formatZAR(excess)}</div>
        </div>
        <div>
          <Label htmlFor="assessedAmount">Assessed Amount (ZAR)</Label>
          <Input
            id="assessedAmount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 35000"
            className="mt-1"
          />
        </div>
      </div>

      {route && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <ArrowRight className="size-4 text-primary flex-shrink-0" />
          <div>
            <span className="font-medium text-primary">Auto-route: </span>
            <span className="text-muted-foreground">{routeLabels[route]}</span>
          </div>
        </div>
      )}

      {claim.type === 'accident' && <RadxBenchmark />}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!amount || assessedNum <= 0}>
          Submit {isInvestigation ? 'Investigation' : 'Assessment'} & Route
        </Button>
      </div>
    </div>
  )
}
