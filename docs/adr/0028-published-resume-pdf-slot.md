# ADR-0028: Published Resume PDF Behind a Contract-Gated Slot

## Metadata

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| **Status**     | Accepted                                  |
| **Date**       | 2026-10-08                                |
| **Authors**    | AlessioBrillo                             |
| **Deciders**   | AlessioBrillo                             |
| **Supersedes** | ADR-0014 (the resume-on-request decision) |
| **Relates to** | ADR-0014, ADR-0005, `vercel.json`         |
| **Project**    | The Ascent                                |

## Context

ADR-0014 chose a pre-filled mailto ("Resume — on request") over a committed PDF
so the resume could never go stale in public, and noted that switching to a
published file is a one-line change in `SITE.resumeUrl`. The author now wants a
downloadable PDF, but the file does not exist yet. A link to a missing file
would be a permanent 404 on the footer of every page.

## Decision Drivers

- The site must be launchable today, before the PDF exists.
- Adding the PDF later must be one edit, with no structural change.
- A typo or a forgotten file must fail a gate, never reach production.

## Considered Options

### Option A: Commit a placeholder PDF now

Rejected. A fake or empty document is published content nobody wrote.

### Option B: Link `/cv/...pdf` now and add the file later

Rejected. Until the file lands the footer link 404s, and nothing fails.

### Option C: A `RESUME_PDF` slot in `lib/site.ts`, gated by a test (chosen)

`RESUME_PDF` is `null` until the file exists. `resumeLink()` returns the mailto
hook while it is `null` and the file link once it is set. A unit test asserts
that a non-null path matches `/cv/<name>.pdf` and exists under `public/`.

## Decision

Adopt Option C.

- Empty slot: behaviour is exactly ADR-0014 (footer shows "Resume — on request").
- Filled slot: the footer shows "Resume — PDF", opening the file in a new tab
  with `rel="noreferrer"`.
- The SPA-fallback rewrite already excludes `*.pdf` (`vercel.json`), so a
  committed file is served as bytes, not rewritten to `index.html`; the existing
  `deploy:check` contract keeps holding.
- The mailto stays reachable: the Contact CTA remains the email.

## Consequences

- **Positive:** launch is unblocked; publishing the CV is one file plus one
  constant; the 404 failure mode is closed by a test.
- **Negative:** a published PDF can go stale. That risk was ADR-0014's reason
  for the mailto; it is now accepted, and the mitigation is to re-commit the
  file whenever the CV changes.
