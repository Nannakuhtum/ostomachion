## ADDED Requirements

### Requirement: Win detection by exact tiling
The rules module SHALL report a win exactly when every piece is contained in the target region, no two pieces overlap, and the sum of piece areas equals the region area.

#### Scenario: Reference solution wins
- **WHEN** the pieces are placed in the reference (Suter construction) arrangement
- **THEN** the win check reports a win

#### Scenario: Near-miss does not win
- **WHEN** all pieces are inside the region but any two pieces overlap
- **THEN** the win check reports no win

#### Scenario: Incomplete placement does not win
- **WHEN** any piece lies outside the target region
- **THEN** the win check reports no win

### Requirement: Canonical solution signatures
The rules module SHALL compute a canonical signature for a winning arrangement that is identical for arrangements equivalent under the 8 square symmetries or under swaps of congruent pieces, and distinct otherwise.

#### Scenario: Symmetry invariance
- **WHEN** a winning arrangement is rotated or reflected by any of the 8 square symmetries
- **THEN** its signature is unchanged

#### Scenario: Congruent-piece swap invariance
- **WHEN** two congruent pieces exchange places in a winning arrangement
- **THEN** the signature is unchanged

#### Scenario: Distinct solutions distinguished
- **WHEN** two winning arrangements are not related by symmetry or congruent swaps
- **THEN** their signatures differ
