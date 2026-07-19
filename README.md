# Ostomachion

A free browser version of the Ostomachion (Stomachion), the ancient Greek 14-piece dissection puzzle attributed to Archimedes. Single player. Part of [Aakkagam Games](https://games.aakkagam.com).

Live at **https://games.aakkagam.com/ostomachion/**

## Develop

```sh
npm install
npm run dev      # dev server
npm run check    # svelte-check (strict TS)
npm test         # vitest
npm run build    # production build (base /ostomachion/)
npm run preview  # serve the build locally
```

## Stack

Svelte 5 + TypeScript + Vite. SVG board. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to main.

Design context lives in `PRODUCT.md` and `DESIGN.md`. Change proposals live in `openspec/changes/`.
