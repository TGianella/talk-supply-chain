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
- `theme/`: local Slidev theme "dossier", from design.pen. `theme: ./theme` in the headmatter. Two registers: the light "lab" (forensic HUD, used for explanations) and the dark "scene" (crime scene: asphalt photos, police tape, evidence markers, white schematics; used for the opening, section breaks and closing).
  - `package.json` → `slidev.defaults`: 1920×1080 canvas, light only, `lang="fr"`, fonts (self-hosted through `@fontsource/*`, no Google Fonts).
  - `styles/tokens.css`: colors, fonts and slide geometry as CSS variables (`--hud-*`), mirroring the variables in design.pen.
  - `layouts/`: lab layouts cover, default, section, fact, statement, two-cols, center, blank, end (all render the status bar through `components/HudFrame.vue`); scene layouts scene-cover, scene-credits (opening credits, three shots), scene-investigator, scene-section, scene-evidence, scene-end, scene (free placement); `video` (full-screen video, plays only in the audience view).
  - `components/`: reusable components, auto-imported in slides. Lab: Kicker, Tag, Stamp, Redact, Readout, Segments, HudCorners, Fingerprint, Crosshair, SubjectCard, Verdict, Timeline, DepGraph, CodeEvidence, Protocol, Connector (self-drawing right-angled line between two elements, with the `after-draw` class for what appears once it is drawn). Scene: Tape, EvidenceMarker, Schematic, ForensicScale, EvidenceSheet, InvestigatorBadge, ScenePhoto.
  - `assets/`: scene background photos (AI-generated in Pencil), imported by `ScenePhoto.vue`.
  - `setup/shiki.ts`: code highlighting theme.
  - `themeConfig` keys read by the theme: `dossier` (status bar prefix, badge number), `speaker`, `org`, `event`, `city`, `date` (cover metadata, credits, badge), `parts` (agenda on section slides).
  - The police tape text stays in English ("CRIME SCENE   DO NOT CROSS") on purpose; everything else is French.
- `components/`: project-level Vue components, auto-imported and usable directly in `slides.md`.
- `public/`: static assets, referenced from slides with absolute paths (`/image.png`).
- `design.pen`: Pencil design file where slide designs are drafted before being implemented in Slidev. It is encrypted: access it only through the Pencil MCP tools, never with Read/Grep. Draft slides as 1920×1080 frames (16:9, the same ratio as the Slidev canvas).
