import { describe, expect, it } from 'vitest';
import { composeArchive, getArchiveEntries } from '@/content/archive';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import { getProjectEntries } from '@/content/projects';
import { getExperienceEntries } from '@/content/experiences';

/** The route keys of a study list, as a set for dedupe/link assertions. */
function publishedHrefsOf(studies: readonly { domain: string; slug: string }[]): Set<string> {
  return new Set(studies.map((meta) => `/${meta.domain}/${meta.slug}`));
}

/**
 * Contract tests for the archive module (ADR-0019): the archive is a
 * projection over the existing content modules — every published study and
 * every experience appears, projects already covered by a published study are
 * skipped (no duplicates), order is reverse-chronological with undated
 * entries last, and every link resolves to a published study route.
 */
describe('archive module', () => {
  it('lists every published study as a study entry with its route and year', () => {
    const entries = getArchiveEntries();
    for (const study of getPublishedCaseStudies()) {
      const match = entries.find((entry) => entry.href === `/${study.domain}/${study.slug}`);
      expect(match).toBeDefined();
      expect(match?.kind).toBe('study');
      expect(match?.title).toBe(study.title);
      expect(match?.line).toBe(study.summary);
      expect(match?.year).toBe(study.year);
    }
  });

  it('lists every experience story', () => {
    const entries = getArchiveEntries();
    for (const story of getExperienceEntries()) {
      const match = entries.find(
        (entry) => entry.kind === 'experience' && entry.title === story.title,
      );
      expect(match).toBeDefined();
      expect(match?.line).toBe(story.line);
      expect(match?.year).toBe(story.year);
    }
  });

  it('skips projects already represented by a published study (no duplicates)', () => {
    const entries = getArchiveEntries();
    const publishedHrefs = publishedHrefsOf(getPublishedCaseStudies());
    const duplicated = getProjectEntries().filter((project) =>
      project.href ? publishedHrefs.has(project.href) : false,
    );
    for (const project of duplicated) {
      expect(
        entries.some((entry) => entry.kind === 'project' && entry.title === project.title),
      ).toBe(false);
    }
  });

  it('lists projects that have no published study behind them', () => {
    const entries = composeArchive(getPublishedCaseStudies(), getProjectEntries(), []);
    const standalone = getProjectEntries().filter(
      (project) =>
        project.href === undefined ||
        !publishedHrefsOf(getPublishedCaseStudies()).has(project.href),
    );
    for (const project of standalone) {
      const match = entries.find(
        (entry) => entry.kind === 'project' && entry.title === project.title,
      );
      expect(match).toBeDefined();
      expect(match?.line).toBe(project.line);
      expect(match?.year).toBe(project.year);
      expect(match?.href).toBe(project.href);
    }
  });

  it('composeArchive projects standalone entries — with and without a route', () => {
    const entries = composeArchive(
      getPublishedCaseStudies(),
      [
        {
          id: 'standalone',
          title: 'Standalone Project',
          line: 'A project with no study behind it.',
          year: '2024',
        },
        {
          id: 'archived-thing',
          title: 'Archived Thing',
          line: 'Not linked from anywhere else.',
          year: '2023',
          href: '/work/archived-thing',
        },
      ],
      [],
    );
    const projects = entries.filter((entry) => entry.kind === 'project');
    expect(projects).toHaveLength(2);
    expect(projects[0]).toMatchObject({
      title: 'Standalone Project',
      line: 'A project with no study behind it.',
      year: '2024',
      href: undefined,
    });
    expect(projects[1]).toMatchObject({
      title: 'Archived Thing',
      href: '/work/archived-thing',
    });
  });

  it('sorts reverse-chronologically with undated entries last', () => {
    const entries = getArchiveEntries();
    const dated = entries.filter((entry) => entry.year !== undefined);
    const undated = entries.filter((entry) => entry.year === undefined);
    expect(entries).toEqual([...dated, ...undated]);
    for (let index = 1; index < dated.length; index += 1) {
      const previous = Number(dated[index - 1]?.year);
      const current = Number(dated[index]?.year);
      expect(previous).toBeGreaterThanOrEqual(current);
    }
  });

  it('keeps every link resolvable to a published study route', () => {
    const publishedHrefs = publishedHrefsOf(getPublishedCaseStudies());
    for (const entry of getArchiveEntries()) {
      if (entry.href === undefined) continue;
      if (entry.kind === 'experience') {
        expect(entry.href).toBeUndefined();
      } else {
        expect(publishedHrefs.has(entry.href)).toBe(true);
      }
    }
  });

  it('returns immutable snapshots', () => {
    const entries = getArchiveEntries();
    expect(Object.isFrozen(entries)).toBe(true);
    expect(entries.every((entry) => Object.isFrozen(entry))).toBe(true);
  });

  it('emits at least one entry', () => {
    expect(getArchiveEntries().length).toBeGreaterThan(0);
  });
});
