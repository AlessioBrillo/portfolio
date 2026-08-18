import { getExperienceEntries } from '@/content/experiences';
import { getProjectEntries } from '@/content/projects';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import type { ArchiveEntry } from '@/types/domain';

/**
 * The experiences archive (`/archive`, ADR-0019): a projection over the
 * existing content modules — never a parallel data store. Registering,
 * publishing or editing a study, project or experience changes the archive
 * without an archive-side edit.
 *
 * Order is reverse-chronological (newest first, the portfolio convention);
 * entries without a year sort last in stable registration order.
 */
function buildArchive(): readonly ArchiveEntry[] {
  const publishedHrefs = new Set(
    getPublishedCaseStudies().map((meta) => `/${meta.domain}/${meta.slug}`),
  );

  const studies: readonly ArchiveEntry[] = getPublishedCaseStudies().map((meta) => ({
    kind: 'study',
    title: meta.title,
    line: meta.summary,
    year: meta.year,
    href: `/${meta.domain}/${meta.slug}`,
  }));

  // A project whose href already resolves to a published study is represented
  // by the study entry alone — the archive never shows the same record twice
  // (ADR-0019 driver 4). The rule is self-maintaining: the day a project
  // grows into a study, its duplicate disappears without editing this file.
  const projects: readonly ArchiveEntry[] = getProjectEntries()
    .filter((project) => project.href === undefined || !publishedHrefs.has(project.href))
    .map((project) => ({
      kind: 'project',
      title: project.title,
      line: project.line,
      year: project.year,
      href: project.href,
    }));

  const experiences: readonly ArchiveEntry[] = getExperienceEntries().map((story) => ({
    kind: 'experience',
    title: story.title,
    line: story.line,
    year: story.year,
  }));

  return [...studies, ...projects, ...experiences];
}

/** Year as a sort key: `undefined` ranks below any dated year. */
function yearRank(entry: ArchiveEntry): number {
  return entry.year === undefined ? -1 : Number(entry.year);
}

/** The archive rows, newest first — an immutable snapshot of the live content. */
export function getArchiveEntries(): readonly ArchiveEntry[] {
  return Object.freeze(
    buildArchive()
      .map((entry) => Object.freeze({ ...entry }))
      .sort((a, b) => yearRank(b) - yearRank(a)),
  );
}
