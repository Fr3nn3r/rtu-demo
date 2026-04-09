import { useState, useEffect, useCallback } from 'react'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentDropZoneProps {
  label: string
  onProcessed: () => void
}

type DropZoneState = 'idle' | 'processing' | 'complete'

function getStageLabel(progress: number): string {
  if (progress < 30) return 'Uploading document...'
  if (progress < 70) return 'Extracting fields...'
  return 'Populating data...'
}

export function DocumentDropZone({ label, onProcessed }: DocumentDropZoneProps) {
  const [state, setState] = useState<DropZoneState>('idle')
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  const startProcessing = useCallback(() => {
    if (state !== 'idle') return
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
          onProcessed()
          return 100
        }
        return prev + 1
      })
    }, 35)
    return () => clearInterval(interval)
  }, [state, onProcessed])

  // Auto-collapse after complete
  useEffect(() => {
    if (state !== 'complete') return
    const timeout = setTimeout(() => setCollapsed(true), 1500)
    return () => clearTimeout(timeout)
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
    startProcessing()
  }

  if (collapsed) return null

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
          onClick={startProcessing}
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
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 transition-all duration-500">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-sm font-medium text-primary">Document processed</span>
          </div>
        </div>
      )}
    </div>
  )
}
