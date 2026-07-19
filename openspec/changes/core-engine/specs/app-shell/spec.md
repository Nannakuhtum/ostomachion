## MODIFIED Requirements

### Requirement: One-screen app shell with mode tabs
The app SHALL render a single screen: a quiet header containing the title and three mode tabs (Classic, Figures, Collection), and a centered game world area.

#### Scenario: Mode switching
- **WHEN** the user activates a mode tab
- **THEN** the active tab is underlined in terracotta and the board area reflects the selected mode, with no page navigation

#### Scenario: Game world
- **WHEN** any mode is active
- **THEN** the board area shows a single SVG world whose viewBox contains the 12×12 target square (ink border, terracotta field, stone/terracotta styling) plus a surrounding scatter margin, sized to fit the viewport on both desktop and mobile
