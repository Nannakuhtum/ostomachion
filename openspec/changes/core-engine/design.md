## Context

Shell, tokens, and deploy are live (archived `project-setup`). Main specs exist for `app-shell` and `deployment`. This change builds the game engine beneath all three tabs and makes Classic winnable. Design decisions were settled in explore mode with the user; this document records them.

## Goals / Non-Goals

**Goals:**
- Integer-exact core with zero floating-point in game logic; floats exist only in the animation/visual layer.
- The 14 pieces derived from the Suter construction, validated by invariant tests, not transcribed as a vertex table.
- Classic playable: scatter → manipulate → win detected → solution recorded.
- Groundwork reused untouched by Figures (different target polygon) and Collection (render stored placements).

**Non-Goals:**
- Figure content, Collection UI, difficulty options, hints, sound, tutorials.
- Physics simulation: no collision resolution during play; the engine evaluates, never forbids.

## Decisions

1. **Construction-derived pieces.** `core/construction.ts` implements exact point ops — `midpoint`, `intersect(line, line)` — over rationals (small-int numerator/denominator pairs; assert denominator 1 for all final vertices), executing the ~12 Suter steps on the 12×12 square to yield 14 convex lattice polygons. Alternative (copy coordinates from literature) rejected in explore: transcription errors are silent; construction errors trip invariant tests.

2. **Pose model.** Logical pose = `{piece, flipped, rot (0-3), tx, ty}` with integer translation; vertices derived as flip → rotate k·90° → translate, all integer-preserving. Visual pose (x, y, angle floats) is a spring target chasing the logical pose; interaction writes visual pose continuously and commits a logical pose on settle.

3. **Overlap = SAT with open interiors.** All 14 pieces are convex, so separating-axis over edge normals with integer cross products. Separation test uses ≥/≤ so shared edges and vertices do NOT count as overlap — tilings require pieces to touch.

4. **Containment.** Target region interface supports the square now and arbitrary lattice polygons later. For the (convex) square: all piece vertices inside suffices. Interface shape anticipates non-convex figures (vertex-in-polygon + edge-crossing test) without implementing them yet.

5. **Win check** = every placed piece contained ∧ no pair overlaps ∧ Σ piece areas = region area (constants). Runs on every settle; 91 SAT pairs worst case, microseconds. No coverage scan needed (pigeonhole).

6. **Canonical signature.** For each of the 8 D4 board symmetries: transform all 14 polygons, canonicalize each polygon's vertex ring (lexicographically smallest rotation, fixed winding), sort polygons, serialize to a string; signature = smallest of the 8. Piece identity is discarded, so congruent-piece swaps dedupe automatically — matching Cutler's 536 (= 17,152 / 32).

7. **One SVG world.** Single coordinate space (board square at 0..12 inside a larger viewBox with a scatter margin; exact extents and mobile scatter placement are implementation-tuned). Pieces off the board float at free positions; on drag-end near the board, translation rounds to the nearest lattice offset (magnet radius ~0.5 units). One pointer system, Pointer Events with `setPointerCapture`.

8. **Rotation UX.** Selecting a piece shows a knob outside its bounding box and a flip button (per DESIGN.md). Dragging the knob rotates the visual pose freely with a ~30%-opacity ghost at the nearest 90° snap; release commits the snapped logical rotation. Wheel and `R`/`F` keys as secondary paths. Rotation pivots the piece's bbox center; commit re-rounds translation so vertices stay integer.

9. **Persistence.** `localStorage`: `ostomachion.classic.layout` (current placements, resume on reload), `ostomachion.solutions` (array of `{signature, placements, foundAt}` — placements kept so Collection can render later). Versioned envelope (`v: 1`) for future migration.

10. **Win moment.** Per DESIGN.md: outlines unify to a single ink stroke, restrained burst, laurel confirmation; reduced-motion → fade to laurel outline. Repeat solutions (signature already stored) get a quieter acknowledgment than new discoveries.

## Risks / Trade-offs

- [Suter construction steps mistranscribed] → Invariant tests: all vertices integer in [0,12], 14 convex polygons, Σareas = 144, pairwise non-overlap in reference layout, reference layout passes our own win check.
- [Signature scheme miscounts vs 536] → Geometry-only signatures + D4 minimization is exactly Cutler's equivalence; congruence test included (swapping the two congruent pairs must not change the signature). A second independent solution fixture can be added later if doubts arise.
- [Spring layer drifting from logical state] → Single source of truth: logical pose; visual pose is always a derived target, reset on commit. Never read visual pose in rules code.
- [Touch ergonomics: knob too small on mobile] → Knob hit target ≥ 44px screen-space regardless of SVG scale; sized in screen units via `getScreenCTM` or non-scaling techniques. Tune during implementation.
- [Existing app-shell board test breaks] → Updated alongside the spec delta in the same change.

## Open Questions

- Exact world viewBox extents and scatter layout portrait vs landscape (tune visually during implementation).
- Whether wheel-rotate needs a modifier key to avoid scroll hijacking (decide in implementation; default: rotate only when a piece is selected and pointer is over it).
