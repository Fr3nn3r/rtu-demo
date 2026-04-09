import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard, cn } from '@/lib/utils'

interface CopyableFieldProps {
  label: string
  value: string
  className?: string
}

export function CopyableField({ label, value, className }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-2 rounded-lg border border-border bg-muted px-3 py-2', className)}>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value || '—'}</div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-shrink-0 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  )
}
