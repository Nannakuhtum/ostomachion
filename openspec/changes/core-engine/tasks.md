## 1. Core geometry

- [x] 1.1 Research and document the Suter construction steps (sources, step list) in a comment/doc block; identify the reference solution arrangement
- [x] 1.2 Implement `src/core/construction.ts`: exact rational point ops (midpoint, line–line intersection), execute construction, export 14 canonical polygons with integer vertices
- [x] 1.3 Implement `src/core/geometry.ts`: pose type (flip, rot, tx, ty), integer vertex transform, polygon area, SAT overlap with open interiors, square containment behind a region interface
- [x] 1.4 Invariant tests: 14 convex polygons, integer vertices in [0,12], areas positive multiples of 3 summing to 144, lattice preserved under random poses, touch-vs-overlap cases

## 2. Rules and signatures

- [x] 2.1 Implement `src/core/rules.ts`: win check (containment ∧ no overlap ∧ area sum)
- [x] 2.2 Reference solution fixture passes win check; near-miss and incomplete fixtures fail
- [x] 2.3 Implement `src/core/canonical.ts`: polygon ring canonicalization, D4 minimization, signature string
- [x] 2.4 Signature tests: D4 invariance, congruent-pair swap invariance, perturbed arrangement yields different signature

## 3. Interaction

- [x] 3.1 World coordinate setup: Board.svelte becomes the SVG world (viewBox with scatter margin, board square at 0..12); update app-shell test for the new world
- [x] 3.2 `Piece.svelte`: renders a placed piece (ceramic fill by piece group, ink outline, grain), spring visual pose chasing logical pose, reduced-motion collapse
- [x] 3.3 Pointer drag with capture: pick up, move in world coords, drop with lattice magnet-snap near board / free float in scatter; z-order raise while dragging
- [x] 3.4 Selection affordances: rotation knob outside bbox (free rotate, ghost preview at nearest quarter-turn, snap on release) and flip button; ≥44px hit targets
- [x] 3.5 Keyboard/wheel shortcuts: R rotate, F flip, wheel-rotate over selected piece
- [x] 3.6 Interaction tests: snap rounding, free-float drop, overlap permitted, logical-pose-only rules evaluation

## 4. Classic mode

- [x] 4.1 Scatter-start layout generator (irregular, deterministic seed acceptable) and mode wiring in App.svelte
- [x] 4.2 Win check on every settle; win moment (outline unify, restrained burst, laurel; reduced-motion fade)
- [x] 4.3 Persistence module: versioned localStorage envelope; save layout on settle, restore on load; record solutions (signature, placements, timestamp), dedupe repeats with quieter acknowledgment
- [x] 4.4 Tests: persistence round-trip, solution dedupe, fresh-start scatter has no pieces on board

## 5. Verify and ship

- [x] 5.1 Full suite green: `npm run check`, `npm test`; manually solve on desktop and mobile viewport (reference solution) to confirm end-to-end win
- [x] 5.2 Reduced-motion pass: drag, rotate, win moment all collapse correctly
- [ ] 5.3 Commit, push, confirm deploy green and live site playable
