## ADDED Requirements

### Requirement: Build produces a base-path-correct static bundle
The build SHALL emit a static bundle to `dist/` with all asset URLs prefixed for the `/ostomachion/` base path, configured permanently in `vite.config.ts`.

#### Scenario: Local build
- **WHEN** a developer runs `npm run build`
- **THEN** `dist/index.html` references assets under `/ostomachion/` and `npm run preview` serves a working app

### Requirement: Push to main deploys to GitHub Pages
The repo SHALL contain a GitHub Actions workflow that, on push to main, type-checks, builds, and deploys `dist/` to GitHub Pages via the official Pages actions.

#### Scenario: Successful deploy
- **WHEN** a commit is pushed to main
- **THEN** the workflow runs check + build + deploy and the site is reachable at `https://games.aakkagam.com/ostomachion/`

#### Scenario: Failing check blocks deploy
- **WHEN** `svelte-check` or the build fails
- **THEN** no deployment occurs and the previous deployment stays live

### Requirement: Page metadata identifies the game
The deployed `index.html` SHALL include title, meta description, canonical URL, favicon, and Open Graph tags consistent with the games.aakkagam.com family.

#### Scenario: Metadata present
- **WHEN** the deployed page is fetched
- **THEN** it contains a descriptive `<title>`, meta description mentioning the Ostomachion puzzle, canonical `https://games.aakkagam.com/ostomachion/`, and og:title/og:description/og:url tags

### Requirement: Structured data and share image
The deployed `index.html` SHALL include a JSON-LD `VideoGame` structured data block (name, description, url, genre, playMode SinglePlayer, isAccessibleForFree, author/publisher matching the games.aakkagam.com family) and an `og:image` (with `twitter:card`) pointing to a static share image in the pottery palette.

#### Scenario: Structured data valid
- **WHEN** the deployed page is checked with a schema validator
- **THEN** the JSON-LD parses as a valid `VideoGame` entity with no errors

#### Scenario: Share preview
- **WHEN** the URL is shared on a platform that reads Open Graph tags
- **THEN** the preview shows the game title, description, and the share image
