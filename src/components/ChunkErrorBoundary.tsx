import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Error boundary that catches both render errors AND chunk load errors (ChunkLoadError).
 * Wraps the Suspense boundary to intercept failed lazy chunk loads.
 * Converts rejected chunk-load promises into thrown errors for getDerivedStateFromError.
 */
export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ChunkErrorBoundary caught:', error, info.componentStack);
  }

  retry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.name === 'ChunkLoadError';
      return (
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-ink/10 bg-ink/5 p-6"
        >
          <Eyebrow>Error</Eyebrow>
          <h2 className="font-display text-[length:var(--text-h3)] font-medium text-ink">
            {isChunkError
              ? 'This case study failed to load.'
              : 'This case study encountered an error.'}
          </h2>
          <p className="text-ink-soft">
            {isChunkError
              ? 'The study may be temporarily unavailable. The rest of the flight is unaffected.'
              : 'Please try again or navigate back to the ascent.'}
          </p>
          <button
            type="button"
            onClick={this.retry}
            className="font-mono text-xs uppercase tracking-widest text-accent"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
