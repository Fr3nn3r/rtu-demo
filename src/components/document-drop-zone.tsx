import { useState, useEffect, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentDropZoneProps {
  label: string
  onProcessed: () => void
  fileName?: string
}

type DropZoneState = 'idle' | 'processing' | 'complete'

function getStageLabel(progress: number): string {
  if (progress < 30) return 'Uploading document...'
  if (progress < 70) return 'Extracting fields...'
  return 'Populating data...'
}

export function DocumentDropZone({ label, onProcessed, fileName }: DocumentDropZoneProps) {
  const [state, setState] = useState<DropZoneState>('idle')
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null)

  const displayName = droppedFileName || fileName || label

  const startProcessing = useCallback((name?: string) => {
    if (state !== 'idle') return
    if (name) setDroppedFileName(name)
    setState('processing')
    setProgress(0)
  }, [state])

  // Progress animation
  useEffect(() => {
    if (state !== 'processing') return
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setState('complete')
          return 100
        }
        return prev + 1
      })
    }, 35)
    return () => clearInterval(interval)
  }, [state])

  // React 19 flags calling setState inside a functional state updater as
  // "setState during render". The previous code called onProcessed() inside
  // setProgress(prev => { ... setState('complete') ... onProcessed() ... }),
  // which triggered the warning because onProcessed dispatches into context.
  // This effect moves the call to after the 'complete' render is committed.
  //
  // onProcessed identity may change each render (inline arrow in parent);
  // omitting it from deps prevents re-firing when state is already 'complete'.
  // Safe here because callers always mount a fresh DropZone per workflow step.
  useEffect(() => {
    if (state === 'complete') {
      onProcessed()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    startProcessing(file?.name)
  }

  return (
    <div>
      {state === 'idle' && (
        <div
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-lg border border-dashed p-4 cursor-pointer transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted',
          )}
          onClick={() => startProcessing()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">Drop file here or click to start</span>
        </div>
      )}

      {state === 'processing' && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <FileText className="size-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              {getStageLabel(progress)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {state === 'complete' && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <CheckCircle2 className="size-4 text-primary flex-shrink-0" />
          <span className="flex-1 text-sm text-foreground truncate">{displayName}</span>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={() => {/* mock view action */}}
          >
            <ExternalLink className="size-3" />
            View
          </button>
        </div>
      )}
    </div>
  )
}
