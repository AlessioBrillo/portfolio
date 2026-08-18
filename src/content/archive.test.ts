import { describe, expect, it } from 'vitest';
import { getArchiveEntries } from '@/content/archive';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import { getProjectEntries } from '@/content/projects';
import { getExperienceEntries } from '@/content/experiences';

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
    const publishedHrefs = new Set(
      getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
    );
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
    const entries = getArchiveEntries();
    const publishedHrefs = new Set(
      getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
    );
    const standalone = getProjectEntries().filter(
      (project) => project.href === undefined || !publishedHrefs.has(project.href),
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
    const publishedHrefs = new Set(
      getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
    );
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
