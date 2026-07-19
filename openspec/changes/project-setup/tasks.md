## 1. Scaffold

- [x] 1.1 Init Vite + Svelte 5 + TypeScript project (`package.json`, `vite.config.ts` with `base: '/ostomachion/'`, `tsconfig` strict, `svelte.config.js`, `index.html`, `.gitignore`)
- [x] 1.2 Add npm scripts: `dev`, `build`, `preview`, `check` (svelte-check); verify `npm run dev` and `npm run check` pass on the empty app
- [x] 1.3 Add `@fontsource/marcellus` and `@fontsource/alegreya-sans`; import weights in the app entry

## 2. Design tokens

- [x] 2.1 Create `src/styles/tokens.css` with the eight OKLCH palette roles, type scale (ratio ≥ 1.25), font stacks, and motion duration/easing tokens from DESIGN.md
- [x] 2.2 Create `src/styles/base.css`: stone page ground, ink text, selection color, `prefers-reduced-motion` global override, no #000/#fff anywhere

## 3. App shell

- [x] 3.1 Create `src/lib/state.svelte.ts` with the `mode` rune (`classic | figures | collection`)
- [x] 3.2 Build `ModeTabs.svelte`: three text tabs in Marcellus, terracotta underline on active, keyboard-accessible (tab/arrow/enter), no page navigation
- [x] 3.3 Build `Board.svelte`: responsive square SVG, viewBox `0 0 12 12`, ink border, stone/terracotta field, fits viewport on mobile and desktop
- [x] 3.4 Build `App.svelte`: header (title + tabs), centered board area, one-line footer note (Archimedes attribution); wire mode switching
- [x] 3.5 Verify shell against app-shell spec scenarios (dev server clean, tabs switch, reduced motion honored)

## 4. Metadata

- [x] 4.1 Fill `index.html` head: title, meta description, canonical `https://games.aakkagam.com/ostomachion/`, og:title/og:description/og:url, theme-color (stone)
- [x] 4.2 Add placeholder SVG favicon (single terracotta glyph)
- [x] 4.3 Add JSON-LD `VideoGame` structured data block to `index.html` (name, description, url, genre, playMode SinglePlayer, isAccessibleForFree, author/publisher per family convention); validate with a schema checker
- [x] 4.4 Create static og.png share image (1200×630, pottery palette, title + piece silhouette); wire og:image + twitter:card tags

## 5. Deploy

- [x] 5.1 Add `.github/workflows/deploy.yml`: on push to main → npm ci, `npm run check`, `npm run build`, upload `dist/`, deploy via `actions/deploy-pages` (mirror align3's workflow shape)
- [x] 5.2 Verify `npm run build` output references `/ostomachion/` paths and `npm run preview` works
- [ ] 5.3 Initial commit + push to main; switch repo Pages settings to GitHub Actions source (one-time manual step)
- [ ] 5.4 Confirm site live at `https://games.aakkagam.com/ostomachion/` with correct fonts, palette, and metadata
