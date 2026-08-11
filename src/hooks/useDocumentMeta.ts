import { useEffect } from 'react';
import { SITE } from '@/lib/site';

export interface DocumentMeta {
  /** Full page title, e.g. "A transformer on an Italian-language corpus". */
  readonly title: string;
  readonly description?: string;
  readonly canonical?: string;
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
 * shareable, indexable URLs): sets title, meta description, Open Graph tags
 * and canonical, then restores whatever the previous route had on unmount —
 * removing nodes it created if there was nothing to restore.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    const description = metaNode('meta[name="description"]');
    const previousDescription = description?.getAttribute('content') ?? null;
    const ogTitle = metaNode('meta[property="og:title"]');
    const previousOgTitle = ogTitle?.getAttribute('content') ?? null;
    const ogDescription = metaNode('meta[property="og:description"]');
    const previousOgDescription = ogDescription?.getAttribute('content') ?? null;
    const canonical = linkNode('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute('href') ?? null;

    document.title = titled(meta.title);

    const titleNode = ogTitle ?? createMeta('property', 'og:title');
    titleNode.setAttribute('content', titled(meta.title));

    if (meta.description) {
      const descriptionNode = description ?? createMeta('name', 'description');
      descriptionNode.setAttribute('content', meta.description);
      const ogDescriptionNode = ogDescription ?? createMeta('property', 'og:description');
      ogDescriptionNode.setAttribute('content', meta.description);
    }

    if (meta.canonical) {
      const canonicalNode = canonical ?? createCanonical();
      canonicalNode.setAttribute('href', meta.canonical);
    }

    return () => {
      document.title = previousTitle;
      restoreOrRemove(description, previousDescription, 'content');
      restoreOrRemove(ogTitle, previousOgTitle, 'content');
      restoreOrRemove(ogDescription, previousOgDescription, 'content');
      restoreOrRemove(canonical, previousCanonical, 'href');
    };
  }, [meta.title, meta.description, meta.canonical]);
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
