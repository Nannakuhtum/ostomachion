## ADDED Requirements

### Requirement: Classic starts scattered and is playable
The Classic tab SHALL start with all 14 pieces scattered irregularly in the scatter zone (empty board) and SHALL be winnable by tiling the 12×12 square through direct manipulation.

#### Scenario: Fresh start
- **WHEN** the user opens Classic with no saved layout
- **THEN** all 14 pieces lie in the scatter zone in an irregular arrangement, none on the board

#### Scenario: Playable to completion
- **WHEN** the user places all 14 pieces to exactly tile the square
- **THEN** the win state triggers on the final settle

### Requirement: Win moment and solution recording
On a win, the app SHALL play the restrained DESIGN.md win moment (outlines unify, brief burst, laurel confirmation; fade-only under reduced motion) and SHALL record the solution signature with its placements to localStorage. A win whose signature is already recorded SHALL be acknowledged more quietly than a new discovery.

#### Scenario: New solution recorded
- **WHEN** the user completes a tiling whose signature is not yet stored
- **THEN** the win moment plays and the solution (signature, placements, timestamp) is persisted

#### Scenario: Repeat solution
- **WHEN** the user completes a tiling whose signature is already stored
- **THEN** a quieter confirmation shows and no duplicate entry is stored

### Requirement: Layout persistence
The Classic tab SHALL persist the current arrangement to localStorage on every settle and restore it on reload, under a versioned storage format.

#### Scenario: Resume after reload
- **WHEN** the user arranges pieces, reloads the page, and reopens Classic
- **THEN** the arrangement is exactly as left, including floating scatter positions
