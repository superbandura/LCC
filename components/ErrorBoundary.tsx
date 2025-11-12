import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-gray-800 border-2 border-red-600 rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-3xl font-mono font-bold text-red-400 uppercase tracking-wider mb-2">
                APPLICATION ERROR
              </h1>
              <p className="font-mono text-sm text-gray-400 tracking-wide">
                SOMETHING WENT WRONG
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-6">
                <p className="font-mono text-xs text-gray-300 mb-2 uppercase tracking-wide">
                  Error Details:
                </p>
                <p className="font-mono text-xs text-red-300 mb-2 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="font-mono text-xs text-gray-400 cursor-pointer hover:text-gray-300 uppercase tracking-wide">
                      Component Stack (Click to expand)
                    </summary>
                    <pre className="font-mono text-xs text-gray-500 mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
              >
                RELOAD APPLICATION
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="font-mono text-xs text-gray-500 tracking-wide">
                If this error persists, please report it with the details above
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
