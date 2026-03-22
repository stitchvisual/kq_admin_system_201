'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SentryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SentryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * React Error Boundary component that captures errors in Sentry
 * and displays a user-friendly fallback UI
 */
export class SentryErrorBoundary extends React.Component<
  SentryErrorBoundaryProps,
  SentryErrorBoundaryState
> {
  constructor(props: SentryErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SentryErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture the error in Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({ eventId });

    // Log to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      eventId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-sm text-muted-foreground">
                  We're sorry, but something unexpected happened
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                An error has been reported to our team. If this problem persists,
                please contact support.
              </p>
              {this.state.eventId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {this.state.eventId}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                Try again
              </Button>
              <Button
                onClick={this.handleReload}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with Sentry error boundary
 */
export function withSentryErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithSentryErrorBoundary(props: P) {
    return (
      <SentryErrorBoundary fallback={fallback}>
        <Component {...props} />
      </SentryErrorBoundary>
    );
  };
}