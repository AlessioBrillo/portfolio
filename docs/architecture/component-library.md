# Component Library (UI Inventory)

Keep the set small and disciplined. Hazard red is the only accent and is never
diluted; every component consumes the `@theme` tokens and `cn()` from
`src/lib/utils.ts`.

| Component       | File                       | Specification                                                                                                                                                                                                          |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary button  | `ui/Button.tsx`            | Hazard-red solid, ink text, zero radius, hover lift. Reserved for the final CTA.                                                                                                                                       |
| Ghost link      | `ui/GhostLink.tsx`         | Ink/phosphor text with an accent underline that draws in from the left on hover.                                                                                                                                       |
| Eyebrow / label | `ui/Eyebrow.tsx`           | JetBrains Mono, uppercase, tracked, neutral. Carries real data (dates, coordinates, altitude). Tone derives from the live scene's muted tone (ADR-0012) unless pinned.                                                 |
| Mosaic tile     | `ui/MosaicTile.tsx`        | Puzzle card: title (Archivo Black) + one line, zero radius, hairline border. Hover: micro-lift, accent edge. Click → case study.                                                                                       |
| Section header  | `ui/SectionHeader.tsx`     | Mono eyebrow + H2 (Archivo Black) + optional one-line intro. The eyebrow derives from the scene (ADR-0012).                                                                                                            |
| Image block     | `ui/ImageBlock.tsx`        | Hairline frame, zero radius, lazy-load, mono caption beneath. Renders an honest labelled slot until a real `src` is provided.                                                                                          |
| Pull quote      | `ui/PullQuote.tsx`         | Large Archivo Black, accent on the opening mark. For impact moments in case studies.                                                                                                                                   |
| Band            | `ui/Band.tsx`              | The tonal section wrapper (section rhythm + max-width container). `surface="solid"` paints its own tone; `surface="scene"` stays transparent so `TonalScene` crossfades behind it.                                     |
| Tonal scene     | `ascent/TonalScene.tsx`    | Fixed backdrop crossfading `paper → night` on scroll (the signature), driven by `useSceneTonePublisher` (ADR-0026, ADR-0010) and publishing both text tones (`tone` + `softTone`, ADR-0012) through the scene context. |
| Legal document  | `ui/LegalDocumentView.tsx` | Renders the Italian and English versions of a legal document on one route, with stable anchors and a precedence note.                                                                                                  |
| Footer          | `ui/Footer.tsx`            | Minimal: name, one line, GitHub, resume, Privacy and Legal links, year. On the night band.                                                                                                                             |

The components are implemented, typed and tested; this inventory is an index,
not a second specification. The source is the authority when they disagree.
