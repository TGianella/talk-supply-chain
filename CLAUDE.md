# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Slides for a talk about supply chain security in the npm ecosystem, built with [Slidev](https://sli.dev). Package manager: pnpm.

## Commands

- `pnpm dev`: start the Slidev dev server (hot reload) and open the deck
- `pnpm build`: build a static SPA into `dist/`
- `pnpm export`: export the deck to PDF (needs `playwright-chromium` installed as a dev dependency)

## Structure

- `slides.md`: the deck. The first frontmatter block sets the deck config (theme, title, transition). Each `---` starts a new slide, and an optional YAML block right after it sets per-slide options such as `layout`. HTML comments at the end of a slide are speaker notes.
- `components/`: Vue components, auto-imported and usable directly in `slides.md`.
- `public/`: static assets, referenced from slides with absolute paths (`/image.png`).
- `design.pen`: Pencil design file where slide designs are drafted before being implemented in Slidev. It is encrypted: access it only through the Pencil MCP tools, never with Read/Grep. Draft slides as 1920×1080 frames (16:9, the same ratio as the Slidev canvas).
