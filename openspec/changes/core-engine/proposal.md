## Why

The app shell is live but the board is an empty placeholder. Everything the three tabs will ever do rests on one foundation: exact piece geometry, tiling rules, and direct manipulation. Explore-mode settled the design (integer-exact core, pieces derived from the Suter construction, overlap-permissive play, one SVG world); this change builds that engine and proves it by making Classic winnable end-to-end.

## What Changes

- Pure-TS core (no Svelte imports): exact rational/integer point ops executing the Suter construction of the 12×12 square, producing the 14 canonical lattice polygons; pose transforms (flip · rot90ᵏ · integer translate); convex overlap (SAT) and region containment; win detection (inside ∧ no-overlap ∧ Σareas = region area); canonical solution signature (geometry-only, D4-normalized, matching Cutler's 536 counting).
- Interaction layer in one SVG coordinate world: board region plus surrounding scatter zone; pointer drag with spring-animated visual pose chasing the exact logical pose; selection with visible rotation knob (free rotate, ghost preview, snap to 90°) and flip button; lattice magnet-snap near the board, free float elsewhere; overlap always allowed during play.
- Classic mode playable end-to-end: scattered start, manipulation, win detected on settle, restrained win moment (per DESIGN.md), solution signature recorded to localStorage (groundwork for Collection).
- Invariant test suite: construction yields integer vertices summing to area 144; reference solution passes win check; signature invariant under D4; congruent-piece swaps produce identical signatures.
- Board area in the shell becomes the game world (larger viewBox containing the 12×12 target); reduced-motion collapses springs to direct placement.

Out of scope: Figures content (figure polygons/authoring), Collection gallery UI, starter-placement difficulty, sound.

## Capabilities

### New Capabilities

- `piece-geometry`: Construction-derived canonical pieces and exact geometric operations (transforms, area, overlap, containment).
- `tiling-rules`: Win detection over a target region and canonical solution signatures for dedup up to symmetry.
- `piece-interaction`: Direct manipulation — drag, rotate, flip, snap — in one SVG world with spring motion and reduced-motion support.
- `classic-mode`: The playable Classic tab: scatter start, win moment, solution recording.

### Modified Capabilities

- `app-shell`: The board area requirement changes from an empty 12×12 placeholder SVG to the game world (larger viewBox hosting the target square and scatter zone).

## Impact

- New: `src/core/` (construction, geometry, rules, canonical, targets), `src/state/` additions, interaction components (`Piece.svelte`, transform knob), persistence module; substantial new test files.
- Modified: `Board.svelte` (becomes the world), `App.svelte` wiring, possibly `state.svelte.ts` split.
- No new runtime dependencies. No changes to deployment or metadata.
- Existing app-shell tests for the board placeholder will need updating alongside the spec delta.
