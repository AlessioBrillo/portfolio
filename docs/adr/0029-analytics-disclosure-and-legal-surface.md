# ADR-0029: Truthful Analytics Disclosure and a Public Legal Surface

## Metadata

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| **Status**     | Accepted                                                            |
| **Date**       | 2026-11-23                                                          |
| **Authors**    | AlessioBrillo                                                       |
| **Deciders**   | AlessioBrillo                                                       |
| **Relates to** | ADR-0013, ADR-0005, ADR-0024, `middleware.ts`, `src/content/legal/` |
| **Supersedes** | The "no personal data" claim in ADR-0013 (decision unchanged)       |
| **Project**    | The Ascent                                                          |

## Context

ADR-0013 chose cookieless, env-gated Plausible analytics and stated that the
site processes "no personal data". That claim is not accurate: the Proxy in
`middleware.ts` forwards `X-Forwarded-For` / `X-Real-IP` to Plausible so unique
visitors can be counted. An IP address is personal data even when the processor
discards it immediately and returns only aggregates. Vercel also receives the
usual request metadata in runtime logs.

A personal site still has to explain that processing. Before this decision the
repository had no privacy notice, no legal notice, no content licence and no
credits — and `SECURITY.md` repeated the same inaccurate "no user data
collection" claim. The MIT licence at the repository root also appeared to
cover the authored content, which was never intended.

## Decision Drivers

- The public copy must describe what this site actually does, not a template.
- The GDPR Article 13 notice must be findable; a cookieless site needs no
  banner but still needs a notice.
- The repository remains English-only for code and docs; public legal copy is
  a separate surface with its own language decision.
- The MIT licence must not silently grant rights over case studies and photos.
- Accepted ADRs are immutable: a factual correction needs a new record.

## Considered Options

### Option A: Correct the claim and publish two legal routes (chosen)

`/privacy` carries the Article 13 notice; `/legal` carries the terms, content
licence, credits and cookie statement. Both are bilingual on the same page,
with the Italian version binding and the English one as a courtesy translation.
The root `LICENSE` is scoped to code; `CONTENT-LICENSE` reserves authored
material; `NOTICE` records credits. ADR-0013 stays untouched and this ADR
corrects its factual claim.

### Option B: Edit ADR-0013 and SECURITY.md in place

Rejected: ADRs are immutable by repository convention. Silently rewriting an
accepted record would undermine the ADR system the portfolio showcases.

### Option C: A single `/legal` page with anchored sections

Rejected: it makes the privacy notice URL `/legal#privacy`, which is a weak
address for the one document users and authorities look for by name. Two short
routes are easier to cite and keep the English translation from becoming a wall.

### Option D: Italian-only legal pages

Rejected: the site is deliberately English for an international audience. A
full Italian/English pair costs one translation and removes the language risk.

## Decision

Adopt Option A.

- The privacy notice discloses the transient IP forwarding, the two processors
  (Vercel and Plausible), the legal basis (legitimate interest), retention, the
  rights and the complaint route to the Garante.
- The notice uses `privacy@<canonical domain>` once `VITE_SITE_URL` is set, and
  the existing public mailbox before that; the alias must exist before launch.
- Both legal routes are indexable and in the sitemap; `lastmod` comes from the
  shared `LEGAL_UPDATED` constant so the sitemap and the pages cannot disagree.
- `SECURITY.md` and this ADR are the authoritative internal correction of the
  "no personal data" claim; ADR-0013 is not edited.

## Consequences

- **Positive:** the site can launch without a misleading claim or a missing
  notice; the legal text and the sitemap share one source of truth; the content
  licence is explicit without changing the code licence.
- **Positive:** the correction is visible in the ADR log instead of rewritten,
  which is consistent with the repository's decision hygiene.
- **Negative:** two bilingual pages need maintenance when providers or purposes
  change; `LEGAL_UPDATED` and both language versions must move together.
- **Negative:** the `privacy@` alias is a launch dependency on the domain owner.
