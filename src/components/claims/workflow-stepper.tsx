import { Fragment } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import type { Claim } from '@/types'
import { getStepperSteps, type StepperStep } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'

export function WorkflowStepper({ claim }: { claim: Claim }) {
  const steps = getStepperSteps(claim)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start min-w-max">
        {steps.map((step, i) => (
          <Fragment key={step.definition.state}>
            <StepNode step={step} />
            {i < steps.length - 1 && (
              <div className={cn(
                'mt-4 h-0.5 min-w-[24px] flex-1',
                step.status === 'completed' ? 'bg-success-500' : 'bg-border',
              )} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function StepNode({ step }: { step: StepperStep }) {
  const { definition, status, stepNumber } = step
  const isBridge = definition.isBridgeStep

  return (
    <div className="flex flex-col items-center" style={{ minWidth: 72 }}>
      {/* Circle */}
      <div className="relative">
        <div className={cn(
          'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
          status === 'completed' && 'border-success-500 bg-success-500 text-white',
          status === 'current' && 'border-primary-500 bg-primary-500 text-white animate-[step-pulse_2s_infinite]',
          status === 'upcoming' && 'border-border-strong bg-white text-text-muted',
        )}>
          {status === 'completed' ? (
            <Check className="size-4" />
          ) : (
            stepNumber
          )}
        </div>
        {isBridge && status !== 'completed' && (
          <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <ExternalLink className="size-2.5" />
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        'mt-1.5 max-w-[72px] text-center text-[11px] leading-tight',
        status === 'current' ? 'font-semibold text-primary-700' : 'text-text-secondary',
      )}>
        {definition.shortLabel}
      </span>
    </div>
  )
}
