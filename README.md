# The Ascent — Personal Portfolio

> Student of AI and physics. I build things, fly small aircraft, and chase the
> next hard problem.

A single-page, scroll-driven portfolio built on one idea: **scrolling flies a
flight profile.** The page opens at ground level in full daylight and moves
through bands — ground, climb, cruise, descent, night — each a domain of the
author's life. Cruise sits above the cloud deck, where the sky is dark even by
day; the descent breaks back into daylight before the night landing. Light and
dark are not a toggle; they are the journey. (See
[ADR-0010](docs/adr/0010-flight-profile-tonal-bands.md).)

This repository is part of the portfolio: it is meant to read as carefully as
the site itself. Code, docs and commits are English-only; the public legal pages
are Italian (binding) with an English courtesy translation.

## Tech stack

| Concern           | Choice                                                        |
| ----------------- | ------------------------------------------------------------- |
| Framework / build | React 19 · Vite 8 · TypeScript 5 (strict)                     |
| Styling           | Tailwind CSS 4 (CSS-first tokens via `@theme`)                |
| Tonal engine      | Layout-driven scroll handler + pure state function (ADR-0026) |
| Long-form content | MDX, code-split per case study                                |
| Routing           | React Router (shareable `/{domain}/{slug}` case-study routes) |
| Tests             | Vitest + Testing Library + Playwright                         |
| Quality           | ESLint · Prettier · Husky · commitlint · Woodpecker gate      |

See [`docs/adr/`](docs/adr/) for the reasoning behind each choice.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

### Scripts

| Script                               | What it does                                 |
| ------------------------------------ | -------------------------------------------- |
| `npm run dev`                        | Vite dev server                              |
| `npm run build`                      | Typecheck then production build to `dist/`   |
| `npm run preview`                    | Preview the production build                 |
| `npm run typecheck`                  | `tsc --noEmit`                               |
| `npm run lint`                       | ESLint over `src/`                           |
| `npm run format` / `format:check`    | Prettier write / check                       |
| `npm test` / `npm run test:coverage` | Vitest, once / with coverage thresholds      |
| `npm run e2e` / `e2e:preview`        | Playwright signature harness (dev / preview) |
| `npm run images`                     | Optimize raw photos into `public/photos/`    |
| `npm run og`                         | Re-render the social card PNG from its SVG   |
| `npm run ci` / `ci:domain`           | Local gate / domain-mode artifact check      |

## Project structure

```
src/
├─ sections/        # the eight bands of the page (Hero ... Contact)
├─ components/      # small disciplined component set + navigation
├─ pages/           # Home, Archive, Privacy, Legal, CaseStudy, NotFound
├─ content/         # case studies (MDX), legal copy, content modules
├─ hooks/           # scroll, altitude, tone and document-head hooks
├─ lib/             # pure logic: tone, sitemap, legal routes, site identity
├─ styles/          # tokens.css, typography.css, flight.css
└─ types/           # domain model
```

## Documentation

| Area                                       | Where                                        |
| ------------------------------------------ | -------------------------------------------- |
| Architecture decisions (ADRs)              | [`docs/adr/`](docs/adr/)                     |
| Design system (color, type, space, motion) | [`docs/design-system/`](docs/design-system/) |
| Page architecture, navigation, components  | [`docs/architecture/`](docs/architecture/)   |
| Content direction and pipelines            | [`docs/content/`](docs/content/)             |
| Status and open inputs                     | [`docs/roadmap.md`](docs/roadmap.md)         |
| Legal / privacy assessment (internal)      | [`docs/legal/`](docs/legal/)                 |

## Status

Phase 6 complete. All eight bands, five long-form case studies, the
experiences archive and the public legal pages are live; the tonal signature is
validated in-browser by the Playwright harness in both motion modes. The site
is launch-ready on a Vercel preview domain; the domain, the `privacy@` alias,
the CV PDF and sign-off of the aviation figures remain owner inputs.

The single source of truth for CI is `.woodpecker/ci.yml`. Locally, run the same
commands on a throwaway copy (`ci-local` where available). See
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licence

Source code, configuration and build scripts: [MIT](LICENSE). Site content,
case studies and images: all rights reserved ([CONTENT-LICENSE](CONTENT-LICENSE)).
Fonts: SIL OFL 1.1 ([public/fonts/OFL.txt](public/fonts/OFL.txt)). Credits are in
[NOTICE](NOTICE) and on the site's Legal page.
