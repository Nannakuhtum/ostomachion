## Context

Empty repo. PRODUCT.md and DESIGN.md at the repo root define the product (single-player Ostomachion, three modes, purist tone) and the visual system (light ceramic theme, OKLCH pottery palette, Marcellus + Alegreya Sans, spring motion). The sibling repo `align3/` establishes the family conventions: Svelte 5 + TypeScript + Vite, GitHub Pages project site under `games.aakkagam.com/<repo>/`, deploy workflow on push to main. This change delivers scaffold + tokens + shell + deploy, no game logic.

## Goals / Non-Goals

**Goals:**
- A running `npm run dev` app with the app shell and full design-token foundation.
- Green deploy pipeline: push to main → live at `games.aakkagam.com/ostomachion/`.
- Conventions consistent enough with align3 that working across both repos feels the same.

**Non-Goals:**
- Piece geometry, interaction, game state, win detection, persistence.
- Dark mode (DESIGN.md: single light theme is the identity).
- Landing-page/sitemap updates in `nannakuhtum.github.io` (separate repo, done after first deploy).

## Decisions

1. **Vite + `@sveltejs/vite-plugin-svelte`, not SvelteKit.** Static single-screen app with no routing (mode tabs are in-page state). SvelteKit adds an adapter and directory conventions for zero benefit here; align3 already uses plain Vite, so the family stays consistent. Alternative considered: SvelteKit static adapter — rejected as overhead.

2. **Design tokens as plain CSS custom properties in a single `src/styles/tokens.css`.** No Tailwind, no CSS-in-JS. The token set is small (8 colors, 2 fonts, a type scale, 2–3 motion durations) and DESIGN.md is the source of truth; custom properties keep the mapping 1:1 and inspectable. Alternative: Tailwind theme — rejected, adds a build dialect for a game whose styling is mostly SVG attributes anyway.

3. **Self-hosted fonts via `@fontsource/marcellus` and `@fontsource/alegreya-sans`.** GitHub Pages + no third-party requests (privacy, offline dev, no layout shift from remote CSS). `font-display: swap` with metric-compatible system serif fallback. Alternative: Google Fonts CDN — rejected per no-external-requests preference.

4. **App shell as three Svelte components**: `App.svelte` (page grid: header / board area / footer note), `ModeTabs.svelte` (Classic / Figures / Collection, in-page state via a `mode` rune in `src/lib/state.svelte.ts`), `Board.svelte` (responsive square SVG with viewBox `0 0 12 12` — empty except the stone texture and ink border for now). Establishes the 12-unit coordinate system that all future game code will use, so later changes never rescale.

5. **Deploy via `actions/deploy-pages` (official Pages workflow)**, same shape as align3: build job (npm ci, vite build with `base: '/ostomachion/'`), upload `dist/`, deploy job. Base path set permanently in `vite.config.ts`, not per-invocation flags, so local `npm run build` matches CI.

6. **TypeScript strict, `svelte-check` in CI** before build, so type rot is caught from commit one.

## Risks / Trade-offs

- [Marcellus has one weight (400)] → Hierarchy must come from size + letter-spacing for display text; body weights come from Alegreya Sans. Accepted; noted in tokens.
- [Empty Board.svelte could bake in wrong assumptions] → Keep it to viewBox + border only; no layout math beyond "responsive square".
- [Pages project site 404s until first successful workflow run + Pages settings switched to GitHub Actions source] → Task list includes the one-time repo settings step explicitly.
- [Custom domain subpath (CNAME lives in the user site repo)] → No CNAME file here; project sites inherit the user-site domain automatically. Verified pattern from align3.

## Open Questions

- Favicon/og image art (a piece silhouette in terracotta?) — placeholder single-glyph SVG favicon for now; real art in a later polish change.
