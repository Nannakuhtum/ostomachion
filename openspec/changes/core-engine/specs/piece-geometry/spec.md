## ADDED Requirements

### Requirement: Pieces derived from the Suter construction
The core SHALL derive the 14 canonical Ostomachion pieces by executing the Suter construction on the 12×12 square using exact arithmetic, and SHALL NOT hard-code piece vertex tables.

#### Scenario: Construction yields lattice pieces
- **WHEN** the construction module executes
- **THEN** it produces exactly 14 convex polygons whose vertices are all integers within [0,12]

#### Scenario: Areas are exact
- **WHEN** piece areas are computed
- **THEN** each area is a positive integer multiple of 3 (in 144-unit terms) and the areas sum to exactly 144

### Requirement: Integer-exact pose transforms
The core SHALL represent a piece placement as flip, quarter-turn rotation (0–3), and integer translation, and SHALL compute transformed vertices in integer arithmetic only.

#### Scenario: Lattice preserved under all poses
- **WHEN** any piece is transformed by any combination of flip, rotation, and integer translation
- **THEN** every resulting vertex has integer coordinates and the polygon's area is unchanged

### Requirement: Exact overlap and containment tests
The core SHALL provide an overlap test between placed pieces and a containment test against a target region, both exact, where shared edges and vertices do not count as overlap.

#### Scenario: Touching pieces do not overlap
- **WHEN** two placed pieces share an edge or vertex but have disjoint interiors
- **THEN** the overlap test reports no overlap

#### Scenario: Interior intersection detected
- **WHEN** two placed pieces have intersecting interiors
- **THEN** the overlap test reports overlap

#### Scenario: Containment in the square
- **WHEN** a placed piece has all vertices within the 12×12 target square
- **THEN** the containment test reports contained; a piece with any vertex outside reports not contained

### Requirement: Core is framework-free
Core geometry modules SHALL contain no Svelte, DOM, or browser API imports so they are testable in isolation and reusable by all modes.

#### Scenario: Node-only test run
- **WHEN** core module tests run
- **THEN** they execute without a DOM environment
