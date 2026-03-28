import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BridgeStepBannerProps {
  system: 'nimbus' | 'rock'
  instruction: string
  className?: string
}

const systemNames = {
  nimbus: 'Nimbus',
  rock: 'Rock',
}

export function BridgeStepBanner({ system, instruction, className }: BridgeStepBannerProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border-l-4 border-l-primary-400 bg-primary-50/50 px-4 py-3',
      className,
    )}>
      <ExternalLink className="mt-0.5 size-4 flex-shrink-0 text-primary-500" />
      <div>
        <div className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
          Bridge Step — {systemNames[system]}
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">{instruction}</p>
      </div>
    </div>
  )
}
