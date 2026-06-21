# ADR-0002: Frontend Stack — React + Vite + Tailwind + TypeScript

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-06-21                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | N/A                          |
| **Relates to** | ADR-0003, ADR-0005, ADR-0007 |
| **Project**    | The Ascent                   |

## Context

The site is a content-driven, animation-rich static site. It needs a fast dev
loop, a disciplined styling system with design tokens, type safety as a quality
signal (the repo is itself part of the portfolio), and a frictionless path to a
static host. The author already works in this stack across sibling projects.

## Decision Drivers

1. **Zero backend** — the portfolio is static; no server runtime required.
2. **Token-first styling** — a small, disciplined design system (Apple/Loro
   Piana restraint), not ad-hoc CSS.
3. **Type safety as craft** — the code is on display; strict typing is a feature.
4. **Static deploy** — build to static assets for Vercel/Cloudflare/Netlify.
5. **Consistency with existing projects** — reuse known-good conventions.

## Considered Options

### Option A: React 19 + Vite 6 + Tailwind 4 + TypeScript (CHOSEN)

Strict TS, Vite for speed, Tailwind 4 CSS-first tokens via `@theme`.

### Option B: Next.js (App Router)

SSR/SSG and routing built in. Rejected: SSR is unnecessary for a static personal
site and adds framework weight; static export of Next is heavier than a plain
Vite SPA for this scope.

### Option C: Astro

Excellent for content sites. Rejected: the signature interaction is a JS-driven
scroll engine across the whole page; an island-first model adds friction for
what is essentially one cohesive interactive document.

## Decision

Adopt React 19 + Vite 6 + Tailwind CSS 4 + strict TypeScript. Tailwind tokens are
declared CSS-first in `src/index.css` (`@theme`); the `@/*` path alias maps to
`src/`. Routing uses `react-router-dom` for the case-study routes (ADR-0005).

## Consequences

- **Positive:** fast iteration, strict types, token-driven UI, trivial static
  deploy, stack familiarity.
- **Negative:** a client-rendered SPA must be deliberate about initial payload
  and SEO/meta (addressed in ADR-0009 and the roadmap).
