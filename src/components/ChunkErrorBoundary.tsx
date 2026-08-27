import React, { Component, type ErrorInfo, type ReactNode } from 'react';
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

/**
 * Creates a safe lazy component that handles chunk load errors gracefully.
 * The returned component can be used directly in JSX and will work with
 * ChunkErrorBoundary to show a user-friendly fallback.
 */
export function safeLazy(
  importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
): React.FC<Record<string, unknown>> {
  // Wrapper component that catches chunk load errors via the lazy import promise
  const SafeLazyComponent: React.FC<Record<string, unknown>> = (props) => {
    const [error, setError] = React.useState<Error | null>(null);
    const mountedRef = React.useRef(true);

    React.useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    // Create a stable lazy component that wraps the import with error handling
    const WrappedLazy = React.useMemo(() => {
      return React.lazy(async () => {
        try {
          const module = await importFn();
          return module;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          error.name = 'ChunkLoadError';
          if (mountedRef.current) {
            setError(error);
          }
          throw error;
        }
      });
    }, [importFn]);

    if (error) throw error;

    return <WrappedLazy {...props} />;
  };

  SafeLazyComponent.displayName = 'SafeLazyComponent';
  return SafeLazyComponent;
}
