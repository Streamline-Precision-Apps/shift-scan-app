// React Error Boundary for client components.
// Reports errors to Sentry and displays a fallback UI.
"use client";

import * as Sentry from "@sentry/nextjs";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary component for catching and reporting errors in client-side React components.
 * Reports errors to Sentry and displays a fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            <h2 className="font-bold">Something went wrong.</h2>
            <p>Our team has been notified.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
