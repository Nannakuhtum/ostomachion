## Why

The ostomachion repo is empty (no commits). Product and design direction are already settled (PRODUCT.md, DESIGN.md): a single-player Ostomachion puzzle in Svelte 5 + TypeScript + Vite, deployed as a GitHub Pages project site at `games.aakkagam.com/ostomachion/`. Before any gameplay work can start, the project needs a working scaffold, the design-token foundation, and the deploy pipeline that every sibling game repo follows.

## What Changes

- Scaffold a Svelte 5 + TypeScript + Vite project (matching the align3 repo's stack and conventions), with `--base=/ostomachion/` for project-site deployment.
- Establish the design foundation from DESIGN.md as CSS custom properties: OKLCH pottery palette, Marcellus + Alegreya Sans fonts (self-hosted), type scale, motion tokens, `prefers-reduced-motion` handling.
- Build the one-screen app shell: quiet header with mode tabs (Classic / Figures / Collection), centered square board area (empty placeholder SVG for now), stone-ground page styling.
- Add the GitHub Pages deploy workflow (build on push to main, deploy `dist/`).
- Standard repo hygiene: `.gitignore`, `README.md`, basic HTML metadata (title, description, favicon, og tags pointing at games.aakkagam.com conventions).
- SEO baseline in `index.html`: JSON-LD `VideoGame` structured data and a static og:image share asset (family pattern from nannakuhtum.github.io). Domain-root SEO (sitemap.xml, robots.txt, llms.txt, landing-page entry) stays in the user-site repo as a follow-up change after first deploy.

Out of scope: piece geometry, drag/rotate/flip interaction, win detection, any game logic. Those come in later changes.

## Capabilities

### New Capabilities

- `app-shell`: One-screen layout with mode tabs, board placeholder, and the ceramic design-token foundation applied site-wide.
- `deployment`: Automated build and GitHub Pages deployment under the `/ostomachion/` base path on push to main.

### Modified Capabilities

(none — no existing specs)

## Impact

- New files across the whole repo: Vite/Svelte/TS config, `src/` app shell, `static`/`public` assets, `.github/workflows/deploy.yml`.
- New dev dependencies: `svelte`, `vite`, `@sveltejs/vite-plugin-svelte`, `typescript`, `svelte-check`.
- External: `nannakuhtum.github.io` landing page, sitemap, and structured data will need an ostomachion entry once the site is live (separate repo, separate change).
