## Phase 5 Content Infrastructure — Validated ✅

All structural work for Phase 5 is **live and validated**. The site is ready for author content inputs.

### Gates Status (All Green)

| Gate                       | Status                                         |
| -------------------------- | ---------------------------------------------- |
| `npm run typecheck`        | ✅                                             |
| `npm run lint`             | ✅                                             |
| `npm run format:check`     | ✅                                             |
| `npm test` (403 tests)     | ✅                                             |
| `npm run build`            | ✅                                             |
| `npm run photos:check`     | ✅ (0 referenced, 1 committed)                 |
| `npm run deploy:check`     | ✅ (9 static files)                            |
| `npm run bundle:check`     | ✅ (entry 144KB/165KB, total 204KB/225KB)      |
| `npm run e2e` (Playwright) | ✅ 83/83 passed (5 viewports × reduced-motion) |

### Tonal Signature Validated

- Both crossfades (climb paper→night, descent night→paper) render and hold
- Scene text follows live backdrop tone (ADR-0011) — no ink-family text on night half
- Equal-legibility flip lines per direction (ADR-0012) — body clears 4.5:1 at every instant
- Reduced-motion discrete switches at same per-direction lines
- Stacking contract (`-z-10` backdrop) verified via element screenshot compositing

### Case Studies Published (5/5 routes live)

1. `/ai/transformer-italian-corpus` — professional draft
2. `/ai/grokking-modular-addition` — manifest-backed research
3. `/ai/physics-of-flight` — flight manual from first principles
4. `/work/the-ascent` — this portfolio as engineered artifact
5. `/sky/vds-licence` — VDS licence as decision hygiene

Archive route `/archive` live (ADR-0019) with dedupe across studies/projects/experiences.

### Remaining: Author Inputs Only (Phase 5 → 6)

| Input                        | Location                                                    | Blocker                                                                                           |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **5-8 real photos**          | `photos-src/` → pipeline → `public/photos/`                 | Who portrait + Sky & Sport grid                                                                   |
| **Corpus run-log numbers**   | `transformer-italian-corpus.mdx` lines 40/42/64/87/89/90/91 | Total tokens, dedupe threshold, model config, held-out perplexity, compression ratio, param count |
| **Physics POH figures**      | `physics-of-flight.mdx` lines 52/70/107/110/111/112         | Wing area, MTOW, C_L,max, glide data, stall/best-glide/Vy/Vx, gust-adjusted approach band         |
| **Logbook go/no-go example** | `physics-of-flight.mdx` line 93                             | Date, wind, gust, decision number                                                                 |
| **Personal reflection**      | `work-the-ascent.mdx` line 106                              | What building this changed about approach                                                         |

### KNOWN_DEBT Ledger (Self-Expiring)

Registry contract (`registry.test.ts`) exact-matches markers against `KNOWN_DEBT` entries. When author fills real data:

1. Replace markers in MDX
2. Delete corresponding `KNOWN_DEBT` entry
3. Test fails → confirms debt cleared

### Deploy Readiness (Phase 6 Groundwork Live)

- Static OG card (`public/og-image.png` from `docs/design/og-image.svg`)
- `robots.txt` with allow-all (Sitemap line waits for domain)
- Vercel SPA fallback excludes all static assets + photos (contract-tested)
- Bundle budget enforced (ADR-0018)
- CSP/HSTS/security headers strict (ADR-0009)
- Domain runbook: `docs/domain-runbook.md` — only env config, no code changes

### Next Steps

1. Author provides photos → run `npm run images -- --src photos-src --prune` → paste asset blocks into `who.ts`, `sky.ts`
2. Author fills KNOWN_DEBT markers → delete ledger entries → tests pass
3. Set `VITE_SITE_URL` → canonical links + sitemap + absolute og:image activate
4. Configure Plausible env vars → analytics live
5. `npm run e2e:preview` against production build → merge → deploy

**No code changes required** — this PR documents the validated infrastructure state.
