/**
 * Case Studies — Public API
 *
 * This is the single import point for all case study functionality.
 * It runs a consistency check on import so any registry desync fails fast
 * at module load time (dev server, build, test) rather than at runtime.
 */

export * from './registry';

/**
 * Validates the registry on import. Called immediately when this module
 * is evaluated — if the registry is inconsistent, the process fails
 * with a clear error message instead of producing silent runtime bugs.
 */
import { ensureRegistryConsistency } from './registry';

ensureRegistryConsistency();
