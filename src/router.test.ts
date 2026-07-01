import { describe, expect, it } from 'vitest';
import { router } from '@/router';

describe('router', () => {
  it('defines the three expected routes', () => {
    const paths = router.routes.map((r) => r.path);
    expect(paths).toEqual(['/', '/:domain/:slug', '*']);
  });
});
