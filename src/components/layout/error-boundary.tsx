import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console so it shows up in dev tools and Playwright's console listener.
    console.error('[ErrorBoundary] caught render error', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <Card className="mx-auto mt-8 max-w-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-6 flex-shrink-0 text-destructive" />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This page hit an unexpected error. The navigation sidebar still works — pick a different page or reset below.
              </p>
            </div>

            <div className="rounded-md border border-border bg-muted p-3 font-mono text-xs">
              <div className="font-semibold text-destructive">{error.name}: {error.message}</div>
              {import.meta.env.DEV && error.stack && (
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-muted-foreground">
                  {error.stack}
                </pre>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RotateCcw className="size-3.5" data-icon="inline-start" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }
}
