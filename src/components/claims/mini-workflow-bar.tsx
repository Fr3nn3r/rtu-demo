import type { Claim } from '@/types'
import { getStepperSteps } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function MiniWorkflowBar({ claim }: { claim: Claim }) {
  const steps = getStepperSteps(claim)
  const currentStep = steps.find(s => s.status === 'current')
  const currentIdx = steps.findIndex(s => s.status === 'current')

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-0.5">
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  step.status === 'completed' && 'bg-primary w-2.5',
                  step.status === 'current' && 'bg-primary w-3.5 h-2',
                  step.status === 'upcoming' && 'bg-border w-2',
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {currentStep?.definition.label ?? 'Closed'}
          {' — '}Step {currentIdx + 1} of {steps.length}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
