import { Component, type ErrorInfo, type ReactNode, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/ui/Eyebrow';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center text-ink">
          <Eyebrow>Error</Eyebrow>
          <h1 className="font-display text-[length:var(--text-h2)] font-medium">
            Something went wrong.
          </h1>
          <p className="max-w-md text-muted-light">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest text-orange no-underline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Return to ground &rarr;
          </Link>
        </main>
      );
    }

    return this.props.children as ReactElement;
  }
}
