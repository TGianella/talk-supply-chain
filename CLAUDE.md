# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Slides for a talk about supply chain security in the npm ecosystem, built with [Slidev](https://sli.dev). Package manager: pnpm.

## Commands

- `pnpm dev`: start the Slidev dev server (hot reload) and open the deck
- `pnpm build`: build a static SPA into `dist/`
- `pnpm export`: export the deck to PDF (needs `playwright-chromium` installed as a dev dependency)
- `pnpm showcase`: open `showcase.md`, the catalogue of every layout and component of the theme

## Content

- The slides are in French only. Labels and defaults in the theme are in French too.
- The user writes all slide content in `slides.md`. Don't write or rewrite slide content unless asked; the job is the theme, layouts and components.

## Structure

- `slides.md`: the deck. The first frontmatter block sets the deck config (theme, title, transition, `themeConfig`). Each `---` starts a new slide, and an optional YAML block right after it sets per-slide options such as `layout`. HTML comments at the end of a slide are speaker notes.
- `showcase.md`: reference deck that demonstrates each layout and component. Keep it in sync when the theme changes.
- `theme/`: local Slidev theme "dossier", from design.pen. `theme: ./theme` in the headmatter. Light "lab" register (forensic HUD). The only dark layout left is scene-shot, for the opening sequence.
  - `package.json` → `slidev.defaults`: 1920×1080 canvas, light only, `lang="fr"`, fonts (self-hosted through `@fontsource/*`, no Google Fonts).
  - `styles/tokens.css`: colors, fonts and slide geometry as CSS variables (`--hud-*`), mirroring the variables in design.pen.
  - `layouts/`: lab layouts cover (optional `meta` facts at the bottom right), investigator (speaker introduction: name, `fields` listed under it, portrait in corner brackets), default, section (big part number, title, agenda of themeConfig.parts), fact, statement, two-cols, case (one attack on one slide: package card, short timeline, mode opératoire told step by step: focus on the timeline, window `::window-n::`, row), defense (one actor of a series: chain of actors from a themeConfig key, `defenses` by default, set with `series`, a markdown list of bold measures numbered M-01…, centered under the title), cards (changes told one by one: each presented in a window `::window-n::` that flies onto its card, 2 to 5 cards on two rows, two per row up to four, same header and chain as defense), center, blank, end (optional `qrcodes`, large and centered under a smaller title, in place of the fingerprint and the stamp) (all render the status bar through `components/HudFrame.vue`); scene-shot (dark: full-screen greyscale photo with a slow zoom and an on-screen locator, for the opening sequence); `video` (full-screen video, plays only in the audience view).
  - `components/`: reusable components, auto-imported in slides: Kicker, SeriesChain (chain of actors of a series, at the top right of defense and cards), Tag, Stamp, Redact, Readout, Segments, HudCorners, Fingerprint, Crosshair, SubjectCard, Verdict, Timeline, DepGraph, CodeEvidence, Protocol, Connector (self-drawing right-angled line between two elements, with the `after-draw` class for what appears once it is drawn).
  - `setup/shiki.ts`: code highlighting theme.
  - `setup/shortcuts.ts`: up/down step through clicks like left/right (the remote controller sends up/down).
  - `themeConfig` keys read by the theme: `dossier` (status bar prefix), `speaker`, `org` (cover), `parts` (agenda on section slides, current part in the status bar), `defenses` and `platforms` (actors of the series shown as a chain on `defense` slides).
- `components/`: project-level Vue components, auto-imported and usable directly in `slides.md`.
- `public/`: static assets, referenced from slides with absolute paths (`/image.png`). The deck is deployed under a base (`/talk-supply-chain/` on GitHub Pages): static `src="/…"` in templates get it through `transformAssetUrls.includeAbsolute` in `vite.config.ts`, and a component or layout binding such a path from a prop wraps it in `withBase` (`theme/utils/base.ts`).
- `patches/@slidev__client.patch` (pnpm `patchedDependencies`): a click inside a slide no longer changes the view-transition mode of the slideshow. Without it, every click on a slide with `transition: view-transition` remounts the slide (the container switches between a div and a TransitionGroup), so v-click elements flash and lose their transitions. Check it still applies when upgrading Slidev.
- `design.pen`: Pencil design file where slide designs are drafted before being implemented in Slidev. It is encrypted: access it only through the Pencil MCP tools, never with Read/Grep. Draft slides as 1920×1080 frames (16:9, the same ratio as the Slidev canvas).
