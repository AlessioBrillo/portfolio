import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function body(slug: string): string {
  return readFileSync(join(process.cwd(), 'src', 'content', 'case-studies', `${slug}.mdx`), 'utf8');
}

describe('public claims in case studies', () => {
  it.each(['physics-of-flight', 'vds-licence'])(
    '%s carries the shared aviation disclaimer',
    (slug) => {
      const text = body(slug);
      expect(text).toContain("from '@/components/ui/StudyDisclaimer'");
      expect(text).toContain('<StudyDisclaimer />');
    },
  );

  it('the self-referential study no longer states stale facts about the repo', () => {
    const text = body('work-the-ascent');
    for (const stale of ['12 immutable ADRs', 'Geist', '80%', 'native CSS', 'useTonalEngine']) {
      expect(text).not.toContain(stale);
    }
    expect(text).toContain('ADR-0026');
  });
});
