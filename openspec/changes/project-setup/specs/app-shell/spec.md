## ADDED Requirements

### Requirement: Project scaffold runs locally
The project SHALL be a Svelte 5 + TypeScript + Vite application that installs and runs with standard npm commands.

#### Scenario: Dev server
- **WHEN** a developer runs `npm install` then `npm run dev`
- **THEN** the app shell renders at the local dev URL with no console errors

#### Scenario: Type checking
- **WHEN** a developer runs `npm run check`
- **THEN** `svelte-check` completes with zero errors under strict TypeScript settings

### Requirement: Design tokens implement DESIGN.md
The app SHALL define the DESIGN.md visual system as CSS custom properties in a single tokens stylesheet: the eight OKLCH palette roles (stone, ink, terracotta, terracotta-deep, cream-slip, ochre, umber, laurel), the type scale (ratio ≥ 1.25), and motion durations/easings.

#### Scenario: Palette applied
- **WHEN** the app loads
- **THEN** the page background is the stone token, text is the ink token, and no element uses pure `#000` or `#fff`

#### Scenario: Fonts self-hosted
- **WHEN** the app loads
- **THEN** Marcellus renders display text and Alegreya Sans renders UI text, with zero requests to third-party font hosts

### Requirement: One-screen app shell with mode tabs
The app SHALL render a single screen: a quiet header containing the title and three mode tabs (Classic, Figures, Collection), and a centered responsive square board area.

#### Scenario: Mode switching
- **WHEN** the user activates a mode tab
- **THEN** the active tab is underlined in terracotta and the board area reflects the selected mode, with no page navigation

#### Scenario: Board placeholder
- **WHEN** any mode is active
- **THEN** the board area shows a square SVG with viewBox `0 0 12 12`, ink border, and stone/terracotta styling, sized to fit the viewport on both desktop and mobile

### Requirement: Reduced motion honored
The app SHALL honor `prefers-reduced-motion: reduce` for all animation, from the first shipped transition onward.

#### Scenario: Reduced motion
- **WHEN** the OS reports reduced motion and the user switches tabs
- **THEN** state changes apply without transition animation
