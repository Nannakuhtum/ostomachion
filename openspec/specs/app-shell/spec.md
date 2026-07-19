# app-shell Specification

## Purpose
The Ostomachion app shell: a Svelte 5 + TypeScript + Vite single-screen application implementing the DESIGN.md visual system, with a collection view reached from an in-panel counter control and a responsive board area.

## Requirements

### Requirement: Project scaffold runs locally
The project SHALL be a Svelte 5 + TypeScript + Vite application that installs and runs with standard npm commands.

#### Scenario: Dev server
- **WHEN** a developer runs `npm install` then `npm run dev`
- **THEN** the app shell renders at the local dev URL with no console errors

#### Scenario: Type checking
- **WHEN** a developer runs `npm run check`
- **THEN** `svelte-check` completes with zero errors under strict TypeScript settings

### Requirement: Design tokens implement DESIGN.md
The app SHALL define the DESIGN.md visual system as CSS custom properties in a single tokens stylesheet: the nine OKLCH palette roles (stone, ink, terracotta, terracotta-deep, cream-slip, ochre, umber, clay-well, laurel), the type scale (ratio ≥ 1.25), and motion durations/easings.

#### Scenario: Palette applied
- **WHEN** the app loads
- **THEN** the page background is the stone token, text is the ink token, and no element uses pure `#000` or `#fff`

#### Scenario: Fonts self-hosted
- **WHEN** the app loads
- **THEN** Marcellus renders display text and Alegreya Sans renders UI text, with zero requests to third-party font hosts

### Requirement: One-screen app shell with an in-panel collection control
The app SHALL render a single screen: a quiet header containing only the title; below it the centered responsive game world, with the collection counter ("n / 536", laurel, tabular numerals) at the top-left of the play panel acting as the only navigation. There are no tabs and no other modes.

#### Scenario: Opening the collection
- **WHEN** the user activates the collection counter
- **THEN** the game world is replaced inline by the collection view (count heading, a one-line explanation of the 536 total, and a plain grid of mini-SVG solution tiles or an empty-state line when no solutions exist), with no page navigation and no modal

#### Scenario: Returning to the board
- **WHEN** the collection view is open and the user activates the "← Board" control at the top-left of the collection panel
- **THEN** the game world returns with the player's piece layout intact

#### Scenario: Game world
- **WHEN** the play view is active
- **THEN** the board area shows the game world SVG (the 12×12 target square plus scatter zone), sized to fit the viewport on both desktop and mobile

### Requirement: Reduced motion honored
The app SHALL honor `prefers-reduced-motion: reduce` for all animation, from the first shipped transition onward.

#### Scenario: Reduced motion
- **WHEN** the OS reports reduced motion and the user switches views or manipulates pieces
- **THEN** state changes apply without transition animation
