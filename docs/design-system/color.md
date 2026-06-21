# Color — "Terra -> Cielo -> Notte"

> Decision record: [ADR-0008](../adr/0008-visual-identity-palette.md).

Six named values. Orange is the signature and the only true accent; olive enters
sparingly for the nature/outdoor theme.

| Token  | Hex       | Tailwind | Role                                                                 |
| ------ | --------- | -------- | -------------------------------------------------------------------- |
| Orange | `#E9622E` | `orange` | Signature accent. Links, CTA, details, the thread through the climb. |
| Paper  | `#F4EFE6` | `paper`  | Background of light bands (ground/day). Warm, tailored.              |
| Night  | `#14161D` | `night`  | Background of dark bands (altitude/night). Blue-black, not brown.    |
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
Verify every pair with an AA checker (see
[ADR-0009](../adr/0009-accessibility-performance-floor.md)).

## Where tokens live

Color tokens are declared CSS-first in the `@theme` block of `src/index.css`, so
they are available as Tailwind utilities (`bg-night`, `text-orange`, ...).
