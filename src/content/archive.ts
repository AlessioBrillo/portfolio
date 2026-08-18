import { getExperienceEntries } from '@/content/experiences';
import { getProjectEntries } from '@/content/projects';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';
import type { ArchiveEntry, CaseStudyMeta, ExperienceEntry, ProjectEntry } from '@/types/domain';

function toStudyEntry(meta: CaseStudyMeta): ArchiveEntry {
  return {
    kind: 'study',
    title: meta.title,
    line: meta.summary,
    year: meta.year,
    href: `/${meta.domain}/${meta.slug}`,
  };
}

function toProjectEntry(project: ProjectEntry): ArchiveEntry {
  return {
    kind: 'project',
    title: project.title,
    line: project.line,
    year: project.year,
    href: project.href,
  };
}

function toExperienceEntry(story: ExperienceEntry): ArchiveEntry {
  return {
    kind: 'experience',
    title: story.title,
    line: story.line,
    year: story.year,
  };
}

/**
 * The archive projection (ADR-0019): studies, projects and experiences into
 * rows, deduplicated — a project whose route already resolves to one of the
 * given studies is represented by the study entry alone (the archive never
 * shows the same record twice). Pure, so the exact rules are unit-tested
 * with synthetic inputs; `getArchiveEntries` wires it to the live content.
 */
export function composeArchive(
  studies: readonly CaseStudyMeta[],
  projects: readonly ProjectEntry[],
  experiences: readonly ExperienceEntry[],
): readonly ArchiveEntry[] {
  const publishedHrefs = new Set(studies.map((meta) => `/${meta.domain}/${meta.slug}`));
  return [
    ...studies.map(toStudyEntry),
    ...projects
      .filter((project) => project.href === undefined || !publishedHrefs.has(project.href))
      .map(toProjectEntry),
    ...experiences.map(toExperienceEntry),
  ];
}

/** Year as a sort key: `undefined` ranks below any dated year. */
function yearRank(entry: ArchiveEntry): number {
  return entry.year === undefined ? -1 : Number(entry.year);
}

/**
 * The archive rows over the live content, newest first — an immutable
 * snapshot: registering, publishing or editing a study, project or
 * experience changes the archive without an archive-side edit.
 */
export function getArchiveEntries(): readonly ArchiveEntry[] {
  return Object.freeze(
    composeArchive(getPublishedCaseStudies(), getProjectEntries(), getExperienceEntries())
      .map((entry) => Object.freeze({ ...entry }))
      .sort((a, b) => yearRank(b) - yearRank(a)),
  );
}
