import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BridgeStepBannerProps {
  system: 'nimbis' | 'roc'
  instruction: string
  className?: string
}

const systemNames = {
  nimbis: 'Nimbis',
  roc: 'ROC',
}

export function BridgeStepBanner({ system, instruction, className }: BridgeStepBannerProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border-l-4 border-l-primary/50 bg-primary/5 px-4 py-3',
      className,
    )}>
      <ExternalLink className="mt-0.5 size-4 flex-shrink-0 text-primary" />
      <div>
        <div className="text-xs font-semibold text-primary uppercase tracking-wide">
          Bridge Step — {systemNames[system]}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{instruction}</p>
      </div>
    </div>
  )
}
