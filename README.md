# The Ascent — Personal Portfolio

> Student of AI and physics. I build things, fly small aircraft, and chase the
> next hard problem.

A single-page, scroll-driven portfolio built on one idea: **scrolling is gaining
altitude.** The page opens at ground level in full daylight and climbs through
tonal bands — haze, clear, altitude, night — each a domain of the author's life.
Light and dark are not a toggle; they are the journey.

This repository is also part of the portfolio: it is meant to read as carefully as
the site itself.

## Tech stack

| Concern                | Choice                                                        |
| ---------------------- | ------------------------------------------------------------- |
| Framework / build      | React 19 · Vite 6 · TypeScript 5 (strict)                     |
| Styling                | Tailwind CSS 4 (CSS-first tokens via `@theme`)                |
| Reveal motion          | Framer Motion                                                 |
| Scroll / tonal engine  | GSAP + ScrollTrigger                                          |
| Long-form case studies | MDX                                                           |
| Routing                | React Router (shareable `/{domain}/{slug}` case-study routes) |
| Testing                | Vitest + Testing Library                                      |
| Quality                | ESLint · Prettier · Husky · commitlint · GitHub Actions       |

See [`docs/adr/`](docs/adr/) for the reasoning behind each choice.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

### Scripts

| Script                            | What it does                                |
| --------------------------------- | ------------------------------------------- |
| `npm run dev`                     | Vite dev server                             |
| `npm run build`                   | Type-check then production build to `dist/` |
| `npm run preview`                 | Preview the production build                |
| `npm run typecheck`               | `tsc --noEmit`                              |
| `npm run lint`                    | ESLint over `src/`                          |
| `npm run format` / `format:check` | Prettier write / check                      |
| `npm test`                        | Vitest (run once)                           |
| `npm run test:coverage`           | Vitest with coverage                        |

## Project structure

```
src/
├─ sections/        # the eight bands of the page (Hero ... Contact)
├─ components/
│  ├─ ui/           # small disciplined component set (Button, Eyebrow, MosaicTile, ...)
│  └─ navigation/   # AltitudeGauge, TopBar
├─ pages/           # HomePage, CaseStudyPage, NotFoundPage
├─ content/case-studies/  # MDX case studies + registry
├─ hooks/           # useReducedMotion, useScrollProgress
├─ lib/             # cn(), motion + altitude constants
├─ styles/          # tokens.css, typography.css
└─ types/           # domain model
```

## Documentation

| Area                                       | Where                                        |
| ------------------------------------------ | -------------------------------------------- |
| Architecture decisions (ADRs)              | [`docs/adr/`](docs/adr/)                     |
| Design system (color, type, space, motion) | [`docs/design-system/`](docs/design-system/) |
| Page architecture, navigation, components  | [`docs/architecture/`](docs/architecture/)   |
| Content direction & case-study template    | [`docs/content/`](docs/content/)             |
| Build roadmap                              | [`docs/roadmap.md`](docs/roadmap.md)         |

## Status

End of Phase 1 — **scaffold**. Sections, components, and the navigation are typed,
compile-clean stubs; the GSAP tonal engine and real content arrive in later phases
(see the [roadmap](docs/roadmap.md)).

## License

[MIT](LICENSE) © Alessio Brillo
