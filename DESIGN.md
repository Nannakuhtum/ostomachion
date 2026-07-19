# Design

Seed version, written pre-implementation. Re-run `/impeccable document` once real code exists to capture actual tokens.

## Theme

Light, warm, materials-driven. Scene: a player at a desk or on a couch in ordinary daylight, turning a hard puzzle over in their head; the surface should feel like warm fired clay and cut stone, not a screen. Single theme for v1 (no dark mode); the pottery palette is the identity and inverting it would break it.

Register: product. Color strategy: **committed**. Terracotta is not an accent, it is the material: the board ground and piece bodies carry it across most of the surface. UI chrome around the board stays quiet tinted-neutral.

## Color Palette

All OKLCH. No pure black or white anywhere; every neutral is tinted toward the clay hue (~50–80).

| Role | Value | Use |
|---|---|---|
| Stone (page ground) | `oklch(0.94 0.012 80)` | Page background; warm limestone |
| Ink | `oklch(0.26 0.02 50)` | Text, outlines; black-glaze, never #000 |
| Terracotta (board) | `oklch(0.64 0.13 45)` | Board field, primary actions |
| Terracotta deep | `oklch(0.5 0.13 40)` | Hover/active, board border |
| Cream slip | `oklch(0.9 0.035 85)` | Piece fill (light set), raised surfaces |
| Ochre | `oklch(0.72 0.11 75)` | Piece fill (mid set) |
| Umber | `oklch(0.42 0.06 55)` | Piece fill (dark set) |
| Laurel | `oklch(0.55 0.06 130)` | Success: valid snap, solved state, collection count |

Piece coloring: pieces draw from the cream/ochre/umber/terracotta family so the solved board reads as one ceramic object. Piece identity never depends on hue alone; each piece also carries its ink outline and subtle per-piece surface grain (SVG noise/texture at low opacity).

## Typography

- **Display**: Marcellus (Trajan-inscription flavor without kitsch). Mode tabs, headings, win moments. Letter-spaced slightly, never all-caps shouting.
- **Body/UI**: Alegreya Sans. Labels, counters, settings.
- Scale ratio ≥ 1.25 between steps; hierarchy via size + weight, not color.
- Numerals (solution counter "12 / 536") use tabular figures.
- Body line length ≤ 70ch (relevant only for the about/history note).

## Layout

- One screen. Board is the protagonist: centered, max practical size, square aspect. Mode tabs (Classic / Figures / Collection) in a quiet header; settings tucked in a corner.
- Unplaced pieces live in an irregular scatter zone around/below the board, not a neat tray grid; the scatter is part of the artifact feel.
- No cards. Collection gallery is a plain grid of mini-SVG solutions on the stone ground, separated by spacing alone.
- Spacing rhythm varies: generous around the board, tight within controls.

## Components

- **Board**: SVG, subtle stone texture, hairline lattice hint only while dragging (fades in), ink border.
- **Piece**: SVG polygon, ceramic fill + grain, ink outline (1.5px), soft drop shadow that grows while dragged (lifted off the surface).
- **Rotation knob**: small circular handle offset outside the selected piece; drag to free-rotate, ghost preview of snap orientation at ~30% opacity.
- **Flip control**: labeled button near the knob. Both affordances visible on selection, no hidden gestures.
- **Mode tabs**: text-only, Marcellus, ink; active tab underlined in terracotta.
- **Win state**: pieces settle flush (outlines briefly unify to one ink stroke), then a restrained burst; laurel-colored confirmation. In Collection, the new solution tile draws itself into the gallery.

## Motion

- Springs (Svelte spring/Tween) for drag lag, rotation inertia, snap settle. Ease-out-expo for everything non-interactive. No bounce, no elastic on UI chrome.
- Snap settle is the signature feel: a short, damped "clunk" (~150ms) with a 1px shadow drop.
- `prefers-reduced-motion`: all springs become direct placement; win burst becomes a fade-to-laurel outline.
- Never animate layout properties; transforms and opacity only.
