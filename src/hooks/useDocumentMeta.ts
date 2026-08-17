import { useEffect } from 'react';
import { SITE } from '@/lib/site';

export interface DocumentMeta {
  /** Full page title, e.g. "A transformer on an Italian-language corpus". */
  readonly title: string;
  readonly description?: string;
  readonly canonical?: string;
  /**
   * Ask search engines to keep the route out of their index — set for
   * unpublished draft studies (ADR-0017), absent on every published surface.
   */
  readonly robots?: 'noindex';
}

function titled(title: string): string {
  return `${title} — ${SITE.name}`;
}

function metaNode(selector: string): HTMLMetaElement | null {
  return document.head.querySelector<HTMLMetaElement>(selector);
}

function linkNode(selector: string): HTMLLinkElement | null {
  return document.head.querySelector<HTMLLinkElement>(selector);
}

/**
 * Keeps the document head honest for each route (ADR-0005: case studies are
 * shareable, indexable URLs): sets title, meta description, Open Graph tags,
 * canonical and — for drafts (ADR-0017) — robots noindex, then restores
 * whatever the previous route had on unmount — removing nodes it created if
 * there was nothing to restore.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  useEffect(() => {
    const previousTitle = document.title;

    const existingDescription = metaNode('meta[name="description"]');
    const previousDescription = existingDescription?.getAttribute('content') ?? null;
    const existingOgTitle = metaNode('meta[property="og:title"]');
    const previousOgTitle = existingOgTitle?.getAttribute('content') ?? null;
    const existingOgDescription = metaNode('meta[property="og:description"]');
    const previousOgDescription = existingOgDescription?.getAttribute('content') ?? null;
    const existingCanonical = linkNode('link[rel="canonical"]');
    const previousCanonical = existingCanonical?.getAttribute('href') ?? null;
    const existingRobots = metaNode('meta[name="robots"]');
    const previousRobots = existingRobots?.getAttribute('content') ?? null;

    // The nodes this effect actually writes — the queried node when one was
    // already there, otherwise a fresh one the cleanup will remove. Previous
    // values are captured above, before anything is written.
    const descriptionNode = meta.description
      ? (existingDescription ?? createMeta('name', 'description'))
      : null;
    const ogTitleNode = existingOgTitle ?? createMeta('property', 'og:title');
    const ogDescriptionNode = meta.description
      ? (existingOgDescription ?? createMeta('property', 'og:description'))
      : null;
    const canonicalNode = meta.canonical ? (existingCanonical ?? createCanonical()) : null;
    const robotsNode = meta.robots ? (existingRobots ?? createMeta('name', 'robots')) : null;

    document.title = titled(meta.title);
    ogTitleNode.setAttribute('content', titled(meta.title));
    if (descriptionNode && meta.description)
      descriptionNode.setAttribute('content', meta.description);
    if (ogDescriptionNode && meta.description)
      ogDescriptionNode.setAttribute('content', meta.description);
    if (canonicalNode && meta.canonical) canonicalNode.setAttribute('href', meta.canonical);
    if (robotsNode && meta.robots) robotsNode.setAttribute('content', meta.robots);

    return () => {
      document.title = previousTitle;
      restoreOrRemove(descriptionNode, previousDescription, 'content');
      restoreOrRemove(ogTitleNode, previousOgTitle, 'content');
      restoreOrRemove(ogDescriptionNode, previousOgDescription, 'content');
      restoreOrRemove(canonicalNode, previousCanonical, 'href');
      restoreOrRemove(robotsNode, previousRobots, 'content');
    };
  }, [meta.title, meta.description, meta.canonical, meta.robots]);
}

function createMeta(attr: 'name' | 'property', value: string): HTMLMetaElement {
  const el = document.createElement('meta');
  el.setAttribute(attr, value);
  document.head.appendChild(el);
  return el;
}

function createCanonical(): HTMLLinkElement {
  const el = document.createElement('link');
  el.setAttribute('rel', 'canonical');
  document.head.appendChild(el);
  return el;
}

function restoreOrRemove(node: Element | null, previous: string | null, attr: string): void {
  if (!node) return;
  if (previous === null) {
    node.remove();
  } else {
    node.setAttribute(attr, previous);
  }
}
