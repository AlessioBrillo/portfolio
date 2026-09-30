import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initAnalytics } from '@/lib/analytics';
import { verifyMiddlewareSync } from '@/lib/middleware-sync';
import { App } from '@/App';
import '@/index.css';

// Privacy-first telemetry (ADR-0013): a no-op until the deploy sets the
// VITE_PLAUSIBLE_* pair, so dev, tests and pre-domain builds stay clean.
initAnalytics();

// Verify client/middleware sync for Plausible proxy (ADR-0024)
// Runs after initAnalytics so env vars are already read
verifyMiddlewareSync();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
