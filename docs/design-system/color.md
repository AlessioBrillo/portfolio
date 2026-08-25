# Color — Swiss Industrial Print (Brutalist)

> Decision record: [ADR-0021](../adr/0021-palette-shift-brutalist.md).

**Single archetype commitment**: Swiss Industrial Print applied consistently across both light (paper) and dark (night) substrates. No olive, no second accent.

| Token              | Hex         | Tailwind         | Role                                                                                                    |
| ------------------ | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| **Accent**         | `#E61919`   | `accent`         | Aviation/Hazard Red — sole accent. Structural hairlines, critical highlights, final CTA. Never diluted. |
| **Paper**          | `#F4F4F0`   | `paper`          | Background of light bands. Matte newsprint / unbleached documentation paper.                            |
| **Paper Elevated** | `#FFFFFF`   | `paper-elevated` | Cards, modals on paper bands.                                                                           |
| **Ink**            | `#000000`   | `ink`            | Primary text on Paper. Full black — maximum contrast, deepens crossfade floor (ADR-0012).               |
| **Ink Soft**       | `#48453F`   | `ink-soft`       | Muted text on Paper. Captions, metadata (8.3:1 AA).                                                     |
| **Muted**          | `#8A8377`   | `muted`          | Legacy neutral — being phased out in favor of `ink-soft`.                                               |
| **Hairline Light** | `#0000001A` | `hairline-light` | 1px structural lines on paper bands.                                                                    |
| **Night**          | `#0A0A0A`   | `night`          | Background of dark bands. Deactivated CRT — deeper than blue-black.                                     |
| **Night Elevated** | `#121212`   | `night-elevated` | Cards, modals on night bands.                                                                           |
| **Phosphor**       | `#FFFFFF`   | `phosphor`       | Primary text on Night. White phosphor emission.                                                         |
| **Phosphor Dim**   | `#9E9E9E`   | `phosphor-dim`   | Muted text on Night. Captions, metadata (4.8:1 AA).                                                     |
| **Hairline Dark**  | `#FFFFFF1A` | `hairline-dark`  | 1px structural lines on night bands.                                                                    |

## The Single Accent Rule

Red (`#E61919`) appears on a small fraction of any view; its rarity is the signal. If red is doing decoration, remove it. **No olive, no terracotta, no second accent.**

## The True Substrate Rule

- **Paper** is `#F4F4F0` (newsprint), not warm cream (`#F4EFE6`).
- **Night** is `#0A0A0A` (deactivated CRT), not blue-black (`#14161D`).
- The generic AI-generator palette is explicitly avoided.

## The Phosphor Rule

Text on night is white phosphor (`#FFFFFF`), never cream (`#FFFDF6`). The equal-legibility flip lines (ADR-0012) are computed against these exact values.

## Contrast Guarantees (ADR-0012)

| Pair                 | Surface | Contrast | Status             |
| -------------------- | ------- | -------- | ------------------ |
| Ink / Paper          | Light   | 18.3:1   | AA ✅              |
| Phosphor / Night     | Dark    | 17.8:1   | AA ✅              |
| Ink Soft / Paper     | Light   | 8.3:1    | AA ✅              |
| Phosphor Dim / Night | Dark    | 4.8:1    | AA ✅              |
| Accent / Paper       | Light   | 4.5:1    | AA ✅ (large text) |
| Accent / Night       | Dark    | 4.5:1    | AA ✅ (large text) |
| Ink / Accent (CTA)   | Both    | 4.83:1   | AA ✅              |

**Body text family** (ink/phosphor) clears **≥ 4.54:1** at every instant of both crossfades (climb & descent), both directions, both motion preferences — verified by unit sweep (0.01 steps) and Playwright e2e harness.

**Muted text family** (ink-soft/phosphor-dim) bounded at documented floor **≥ 1.57:1** at flip lines — improves on the 1.03:1 midpoint defect of the prior palette.

## Where tokens live

Color tokens are declared CSS-first in the `@theme` block of `src/styles/tokens.css` (imported by `src/index.css`), available as Tailwind utilities (`bg-night`, `text-accent`, `text-phosphor`, `text-ink-soft`, ...).

JS mirrors live in `src/lib/tone.ts` (`TONE`, `TEXT_TONE`, `SOFT_TEXT_TONE`) — kept in sync by `src/lib/tokens.test.ts`.

## Deprecated (removed post-migration)

| Legacy Token              | Replacement                | Status  |
| ------------------------- | -------------------------- | ------- |
| `orange` (`#E9622E`)      | `accent` (`#E61919`)       | Removed |
| `olive` (`#5E6B4F`)       | — (no replacement)         | Removed |
| `cream` (`#FFFDF6`)       | `phosphor` (`#FFFFFF`)     | Removed |
| `muted-light` (`#8A8377`) | `ink-soft` (`#48453F`)     | Removed |
| `muted-dark` (`#7B8190`)  | `phosphor-dim` (`#9E9E9E`) | Removed |
| `ink-deep` (`#221E19`)    | — (unused)                 | Removed |

---

**Reference**: [ADR-0021](../adr/0021-palette-shift-brutalist.md), [ADR-0012](../adr/0012-equal-legibility-flip-lines.md), [ADR-0009](../adr/0009-accessibility-performance-floor.md).
