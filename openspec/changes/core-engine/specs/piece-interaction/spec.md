## ADDED Requirements

### Requirement: Direct drag in one SVG world
Pieces SHALL be draggable with pointer events within a single SVG coordinate world containing the target square and a surrounding scatter zone. Dropping near the board SHALL snap the piece translation to the nearest lattice offset; dropping elsewhere SHALL leave the piece floating freely. Overlapping placements SHALL always be permitted during play.

#### Scenario: Lattice snap near the board
- **WHEN** the user drops a piece with its position within the magnet radius of a lattice-aligned position on or beside the board
- **THEN** the piece settles at integer translation with a brief spring settle animation

#### Scenario: Free float in the scatter zone
- **WHEN** the user drops a piece away from the board
- **THEN** the piece stays where dropped without snapping

#### Scenario: Overlap permitted
- **WHEN** the user drops a piece on top of another piece
- **THEN** the drop is accepted; no rejection or push-back occurs

### Requirement: Visible rotate and flip affordances
Selecting a piece SHALL show a rotation knob outside the piece and a flip control. Dragging the knob SHALL rotate the piece freely with a ghost preview of the nearest quarter-turn; releasing SHALL commit the snapped rotation. The flip control SHALL mirror the piece. `R` and `F` keys and the scroll wheel over a selected piece SHALL act as secondary shortcuts.

#### Scenario: Free rotate then snap
- **WHEN** the user drags the rotation knob and releases
- **THEN** during the drag the piece follows the pointer angle with a ghost showing the snap orientation, and on release the piece animates to the nearest quarter-turn with integer vertices

#### Scenario: Flip
- **WHEN** the user activates the flip control on a selected piece
- **THEN** the piece mirrors, remaining lattice-exact after settle

#### Scenario: Touch target size
- **WHEN** the app runs on a touch device at any viewport size
- **THEN** the rotation knob and flip control hit targets are at least 44 CSS pixels

### Requirement: Motion respects logical state and reduced motion
Visual piece motion SHALL be spring-driven toward the exact logical pose, the logical pose SHALL be the single source of truth for rules evaluation, and `prefers-reduced-motion` SHALL collapse springs to direct placement.

#### Scenario: Reduced motion drag
- **WHEN** the OS reports reduced motion and the user drops a piece near the board
- **THEN** the piece appears at its snapped position without spring animation

#### Scenario: Rules read logical pose only
- **WHEN** a win check runs while a settle animation is still in flight
- **THEN** the result is computed from committed logical poses, unaffected by visual positions
