import type { ImageAsset } from '@/types/domain';
import { getWhoPortrait } from './who.ts';
import { getSportEntries } from './sky.ts';

/**
 * Every photo slot the site renders, aggregated for the photo-asset contract
 * (`src/lib/photo-assets.ts`, `npm run photos:check`): the Who portrait and
 * the Sky & Sport grid. A new photo slot must be registered here or the
 * contract cannot see it — the same single-source-of-truth role the
 * case-study registry plays for studies.
 *
 * Explicit `.ts`-extension imports keep this module loadable by Node's native
 * type stripping (the check scripts import it), by Vite, and by Vitest alike.
 */
export function getAllImageAssets(): readonly ImageAsset[] {
  return [getWhoPortrait(), ...getSportEntries().map((entry) => entry.image)];
}
