import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface StageErrorBoundaryProps {
  children: React.ReactNode
  stageName?: string
}

interface StageErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class StageErrorBoundary extends React.Component<
  StageErrorBoundaryProps,
  StageErrorBoundaryState
> {
  constructor(props: StageErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): StageErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[V3 Stage Error] ${this.props.stageName || 'Unknown stage'}:`,
      error,
      errorInfo
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Stage failed to load
          </h3>
          <p className="text-sm text-gray-500 max-w-md mb-4">
            {this.props.stageName
              ? `The "${this.props.stageName}" stage encountered an error.`
              : 'This stage encountered an error.'}{' '}
            Try navigating back and forward, or select a different scenario.
          </p>
          {this.state.error && (
            <pre className="text-xs text-red-600 bg-red-50 rounded-lg p-3 max-w-lg overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
