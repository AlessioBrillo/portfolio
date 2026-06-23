# Color — "Terra -> Cielo -> Notte"

> Decision record: [ADR-0008](../adr/0008-visual-identity-palette.md).

Six named values. Orange is the signature and the only true accent; olive enters
sparingly for the nature/outdoor theme.

| Token  | Hex       | Tailwind | Role                                                                 |
| ------ | --------- | -------- | -------------------------------------------------------------------- |
| Orange | `#E9622E` | `orange` | Signature accent. Links, CTA, details, the thread through the climb. |
| Paper  | `#F4EFE6` | `paper`  | Background of light bands (ground/day). Warm, tailored.              |
| Night  | `#14161D` | `night`  | Background of dark bands (cruise/night). Blue-black, not brown.      |
| Olive  | `#5E6B4F` | `olive`  | Natural accent, used rarely (outdoor sport, nature).                 |
| Ink    | `#2A2722` | `ink`    | Body text on Paper.                                                  |
| Cream  | `#FBF8F2` | `cream`  | Text on Night + light surfaces.                                      |

Neutrals for captions/metadata: `#8A8377` (`muted-light`, on light) and `#7B8190`
(`muted-dark`, on dark).

## The golden rule

Orange is never diluted across a hundred uses. It is the heartbeat you keep
finding from ground to night, and it is what holds the puzzle together. The one
place orange is purely _functional_ is the current-position marker on the
altitude gauge.

## Contrast

Ink-on-Paper and Cream-on-Night pass AA comfortably. Orange is an **accent, not
body text** — use it for large titles and details, never for small paragraphs.
The orange CTA button uses **ink** text (4.42:1), not cream (3.14:1, fails).
Verify every pair with an AA checker (see
[ADR-0009](../adr/0009-accessibility-performance-floor.md)).

> **Known a11y finding (2026-06-22, fix scheduled for the a11y/Phase-6 pass).**
> The muted neutrals are _tone-specific_: `muted-light` (`#8A8377`) is ~3.27:1 on
> Paper — below the 4.5:1 AA floor for body/caption text — while `muted-dark`
> (`#7B8190`) is fine on Night, and vice-versa. Today `Eyebrow` and
> `SectionHeader` hardcode `muted-light` regardless of band tone, so muted text
> fails AA on the light bands. The fix is to make those components **tone-aware**
> (pick the muted neutral from the band tone), not to darken a single token
> (which would then fail on the dark bands). The Hero already side-steps this by
> using `ink/70` for its eyebrow and `ink` for its manifesto.

## Where tokens live

Color tokens are declared CSS-first in the `@theme` block of `src/index.css`, so
they are available as Tailwind utilities (`bg-night`, `text-orange`, ...).
