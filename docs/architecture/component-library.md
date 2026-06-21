# Component Library (UI Inventory)

Keep the set small and disciplined — that is what makes the site feel "Apple /
Loro Piana" rather than crowded.

| Component       | File                   | Specification                                                                                            |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Primary button  | `ui/Button.tsx`        | Solid orange, cream text, 8px radius, hover: slight darken + 2px lift. Reserved for the final CTA.       |
| Ghost link      | `ui/GhostLink.tsx`     | Ink/cream text with an orange underline that draws in from the left on hover. The standard link.         |
| Eyebrow / label | `ui/Eyebrow.tsx`       | Geist Mono, uppercase, tracked, neutral. Carries real data (dates, coordinates, altitude).               |
| Mosaic tile     | `ui/MosaicTile.tsx`    | Puzzle card: title (Fraunces) + one line. Hover: micro-lift, 1px orange border. Click -> case study.     |
| Section header  | `ui/SectionHeader.tsx` | Mono eyebrow + H2 (Fraunces) + optional one-line intro. Consistent across bands.                         |
| Image block     | `ui/ImageBlock.tsx`    | Hairline frame, 12px radius, lazy-load, mono caption beneath. Photos are protagonists: no heavy filters. |
| Pull quote      | `ui/PullQuote.tsx`     | Large Fraunces, orange on the opening mark. For impact moments in case studies.                          |
| Band            | `ui/Band.tsx`          | The tonal section wrapper (background tone + section rhythm + max-width container).                      |
| Footer          | `ui/Footer.tsx`        | Minimal: name, one line, essential links, year. On the night band.                                       |

All components consume the design tokens and the `cn()` helper
(`src/lib/utils.ts`). They ship as typed, compile-clean stubs; visual polish and
motion are added in later roadmap phases.
