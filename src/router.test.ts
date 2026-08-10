import { describe, expect, it } from 'vitest';
import { router } from '@/router';

describe('router', () => {
  it('wraps the three expected routes in the scroll-restoring layout', () => {
    const layout = router.routes[0];
    expect(layout).toBeDefined();
    expect(layout!.children?.map((r) => r.path)).toEqual(['/', '/:domain/:slug', '*']);
  });
});
