import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  isolate?: boolean;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Technical logging without exposing details to visitors
    console.error('[MSC ErrorBoundary caught an unhandled render error]:', error, errorInfo);

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch {
        // Prevent secondary errors in logging callback
      }
    }
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch {
        // Prevent secondary errors in reset callback
      }
    }
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error || new Error('Unknown error');

      // 1. Custom fallback render prop
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error, this.resetErrorBoundary);
      }

      // 2. Custom fallback ReactNode
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 3. Isolated / Widget error fallback (does not disrupt entire page layout)
      if (this.props.isolate) {
        return (
          <div
            role="alert"
            className="p-6 my-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left max-w-lg mx-auto"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-charcoal-900 font-display">
                  Section Temporarily Unavailable
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  An unexpected issue occurred while displaying this section. Other parts of the page remain active.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={this.resetErrorBoundary}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="bg-white text-xs font-semibold"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 4. Default Full-Page Friendly Error Screen (Safe for visitors: no stack trace or SQL leaks)
      return (
        <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 text-center">
          <Container size="sm">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-card max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                <ShieldAlert className="w-8 h-8 text-amber-700" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  Service Notice
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
                  Something Went Wrong
                </h1>
                <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-md mx-auto">
                  We encountered an unexpected display issue on this page. Our team has logged this occurrence. Please try refreshing or return to the home page.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={this.resetErrorBoundary}
                  icon={<RefreshCw className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold"
                >
                  Reload Page Component
                </Button>
                <Button
                  to="/"
                  variant="outline"
                  size="md"
                  icon={<Home className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Return to Home
                </Button>
              </div>

              <div className="pt-6 border-t border-warm-100 text-xs text-charcoal-500">
                <span>If this problem persists, please </span>
                <a href="/contact" className="text-forest-800 font-bold hover:underline">
                  contact our Secretariat Desk
                </a>
              </div>
            </div>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}
