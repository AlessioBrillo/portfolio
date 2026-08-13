# ADR-0014: Identity Surface — Public Repo Link and Resume on Request

## Metadata

| Field          | Value                                                     |
| -------------- | --------------------------------------------------------- |
| **Status**     | Accepted                                                  |
| **Date**       | 2026-08-13                                                |
| **Authors**    | AlessioBrillo                                             |
| **Deciders**   | AlessioBrillo                                             |
| **Relates to** | ADR-0005, ADR-0009                                        |
| **Supersedes** | The "CV excluded" note in docs/content/personalization.md |
| **Project**    | The Ascent                                                |

## Context

Two identity gaps existed between the site's claims and its surface:

1. The repository README states that _"this repository is also part of the
   portfolio"_, yet no page or component linked to it. The engineering
   showcase was invisible from the artifact that exhibits it.
2. The contact band promised a single clear invitation (email + LinkedIn) and
   `docs/content/personalization.md` reserved a hidden footer hook
   (`Resume — on request`) for later activation — the hook was never
   activated, so recruiters had no first-click path to a CV.

## Decision Drivers

1. **The repo is a first-class artifact** (ADR-0005's spirit): it must be
   reachable from the site itself, in one click, with correct link hygiene.
2. **The resume must never go stale in public.** A committed PDF is a
   maintenance liability: it drifts from reality and looks outdated the day
   after a change. An on-request path keeps the claim current by construction.
3. **Quietness is a design rule** (personalization.md: one flourish per area).
   The activation must not disturb the Contact band's single invitation.
4. **AA and link hygiene remain floors** (ADR-0009): new links follow the
   existing muted-on-night footer style and `noreferrer` for external targets.

## Considered Options

### Option A: Public repo link + resume-on-request mailto (CHOSEN)

Add `githubUrl` and `resumeUrl` to `src/lib/site.ts` (single source of truth)
and render both in the footer's new external-links row, keeping the Contact
band untouched.

- Pros: zero maintenance surface; the resume is always current because it is
  requested fresh; the repo — the strongest engineering artifact — gets the
  lightest possible click path; no design surface changes.
- Cons: a recruiter cannot download the resume without sending an email (an
  intentional friction — it gates on human contact, which is the goal).

### Option B: Publish a committed `public/cv.pdf`

- Pros: instant download for recruiters.
- Cons: stale-in-public risk, requires the author to keep a second artifact in
  sync, and adds a document the author is not ready to publish; rejected for
  the same reason the paper design is excluded — private by default, public on
  request.

### Option C: Do nothing (status quo)

- Pros: no work.
- Cons: the repo link claim stays hollow and the reserved hook stays reserved
  forever; rejected because the hook was explicitly designed to be activated
  later without rework — "later" is now.

## Decision

The footer grows a muted external-links row with the public GitHub repository
(new tab, `rel="noreferrer"`) and a `Resume — on request` link that opens a
pre-filled email (`mailto:alessio@ilcassero.it?subject=Resume request`).
`SITE.githubUrl` and `SITE.resumeUrl` are the only sources of truth; the
Contact band is unchanged.

## Consequences

- The repository's own claim becomes verifiable from the rendered site.
- The resume-on-request hook documented in `docs/content/personalization.md`
  is now active; the documentation is updated accordingly.
- A future switch to a published PDF is a one-line change in `SITE.resumeUrl`
  plus the file — no rework, exactly as the original hook promised.
- The footer stays within the established muted-on-night pattern; no motion,
  no accent dilution (ADR-0008), no new tokens.
