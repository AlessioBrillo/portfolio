import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';

interface CaseStudyErrorBoundaryProps {
  children: ReactNode;
}

interface CaseStudyErrorBoundaryState {
  hasError: boolean;
}

/**
 * Route-level containment for the lazy MDX body (ADR-0005): a chunk-load or
 * compile failure in one case study must not reach the root boundary and
 * take down the whole app. The fallback stays inside the page layout, so the
 * back link remains usable; the technical detail goes to the console only.
 */
export class CaseStudyErrorBoundary extends Component<
  CaseStudyErrorBoundaryProps,
  CaseStudyErrorBoundaryState
> {
  constructor(props: CaseStudyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): CaseStudyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('CaseStudyErrorBoundary caught:', error, info.componentStack);
  }

  retry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-ink/10 bg-ink/5 p-6"
        >
          <Eyebrow>Error</Eyebrow>
          <h2 className="font-display text-[length:var(--text-h3)] font-medium text-ink">
            This case study failed to load.
          </h2>
          <p className="text-ink-soft">
            The study may be temporarily unavailable. The rest of the flight is unaffected.
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
