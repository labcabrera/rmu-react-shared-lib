import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorState from '../ui/states/ErrorState';

type Props = {
  children: ReactNode;
  /** When it changes (for example the route), a caught error is cleared. */
  resetKey?: unknown;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = { error: Error | null };

/** Catches render errors so a failing page does not take down the shell and the other MFEs. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error caught by ErrorBoundary', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback ? (
        this.props.fallback(error, this.reset)
      ) : (
        <ErrorState error={error} onRetry={this.reset} />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
