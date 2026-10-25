<script setup lang="ts">
// The blind spot of the axios compromise (Socket, "The hidden blast radius of the axios compromise"): a project's
// lockfile pins axios, but a tool run with npx (an MCP server, a CLI in CI) resolves its dependencies at each call,
// from their ranges, and outside any lockfile. firecrawl-mcp@3.11.0 and its range are one of Socket's examples.
// - at the opening: the project, its lockfile pinning axios, and the npx command of an MCP config;
// - click 1: npx fetches the tool, whose range on axios resolves to the latest version, the malicious one;
// - click 2: which brings plain-crypto-js and its postinstall, into npx's cache, where no lockfile sees it.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <NpxResolve />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const resolved = computed(() => step.value >= 1)
const dropped = computed(() => step.value >= 2)

// areas: the project on the left, what npx resolves on the right
const project = { x: 20, y: 20, w: 440, h: 620, label: 'votre projet' }
const npxArea = { x: 500, y: 20, w: 880, h: 620, label: 'npx · résolu à chaque appel' }

// cards: header bar, then rows every RS; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const VX = 200 // offset of the values in the lockfile
const h = (n: number) => HB + 18 + n * RS
const lock = { x: 60, y: 80, w: 360, h: h(2), title: 'package-lock.json' }
const cmd = { x: 540, y: 80, w: 800, h: h(1), title: 'config MCP, script de CI…' }
const tool = { x: 540, y: 250, w: 320, h: h(2), title: 'firecrawl-mcp@3.11.0' }
const axios = { x: 980, y: 250, w: 360, h: h(2), title: 'axios@1.14.1' }
const dropper = { x: 980, y: 470, w: 360, h: h(2), title: 'plain-crypto-js@4.2.1' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2
const cx = (c: { x: number, w: number }) => c.x + c.w / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

const toTool = `M${cx(tool)} ${cmd.y + cmd.h}V${tool.y - 16}`
const toAxios = `M${tool.x + tool.w} ${cy(tool)}H${axios.x - 16}`
const toDropper = `M${cx(axios)} ${axios.y + axios.h}V${dropper.y - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 660" class="npx-resolve" fill="none">
    <!-- the two areas: the project tinted -->
    <rect :x="project.x" :y="project.y" :width="project.w" :height="project.h" class="area inside" />
    <text :x="project.x + 20" :y="project.y + 34" class="area-label">{{ project.label }}</text>
    <rect :x="npxArea.x" :y="npxArea.y" :width="npxArea.w" :height="npxArea.h" class="area" />
    <text :x="npxArea.x + 20" :y="npxArea.y + 34" class="area-label">{{ npxArea.label }}</text>

    <!-- the project's lockfile pins axios, and the command that runs a tool with npx -->
    <g v-for="c in [lock, cmd]" :key="c.title">
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="c.h + 3" class="card" />
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
      <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" />
    </g>
    <text :x="lock.x + 20" :y="ry(lock, 0)" class="label" dominant-baseline="middle">axios</text>
    <text :x="lock.x + VX" :y="ry(lock, 0)" class="value" dominant-baseline="middle">1.14.0</text>
    <text :x="lock.x + 20" :y="ry(lock, 1)" class="label" dominant-baseline="middle">plain-crypto-js</text>
    <text :x="lock.x + VX" :y="ry(lock, 1)" class="value" dominant-baseline="middle">absent</text>
    <text :x="lock.x" :y="lock.y + lock.h + 40" class="note">npm ci : versions figées</text>
    <text :x="cmd.x + 20" :y="ry(cmd, 0)" class="value" dominant-baseline="middle">npx -y firecrawl-mcp</text>

    <!-- click 1: npx fetches the tool, whose range on axios resolves to the latest version -->
    <path :d="toTool" pathLength="1" class="line draw" :data-off="off(resolved)" />
    <polygon :points="down(cx(tool), tool.y - 2)" class="ink pop" :data-off="off(resolved)" :style="d(0.35)" />
    <text :x="cx(tool) + 14" :y="(cmd.y + cmd.h + tool.y) / 2 + 6" class="note pop" :data-off="off(resolved)" :style="d(0.2)">télécharge</text>
    <g class="pop" :data-off="off(resolved)" :style="d(0.4)">
      <rect :x="tool.x - 1.5" :y="tool.y - 1.5" :width="tool.w + 3" :height="tool.h + 3" class="card" />
      <rect :x="tool.x - 1.5" :y="tool.y - 1.5" :width="tool.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="tool.x + 20" :y="tool.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ tool.title }}</text>
      <text :x="tool.x + 20" :y="ry(tool, 0)" class="label" dominant-baseline="middle">dépend de</text>
      <text :x="tool.x + 20" :y="ry(tool, 1)" class="value" dominant-baseline="middle">axios "^1.13.5"</text>
      <rect :x="tool.x" :y="tool.y" :width="tool.w" :height="tool.h" class="outline" />
    </g>
    <path :d="toAxios" pathLength="1" class="line hot-line draw" :data-off="off(resolved)" :style="d(0.7)" />
    <polygon :points="right(axios.x - 2, cy(tool))" class="accent pop" :data-off="off(resolved)" :style="d(1.05)" />
    <text :x="(tool.x + tool.w + axios.x) / 2" :y="cy(tool) - 14" class="note hot pop" :data-off="off(resolved)" :style="d(0.85)" text-anchor="middle">résout</text>
    <g class="pop" :data-off="off(resolved)" :style="d(1.1)">
      <rect :x="axios.x - 1.5" :y="axios.y - 1.5" :width="axios.w + 3" :height="axios.h + 3" class="card" />
      <rect :x="axios.x - 1.5" :y="axios.y - 1.5" :width="axios.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="axios.x + 20" :y="axios.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ axios.title }}</text>
      <text :x="axios.x + 20" :y="ry(axios, 0)" class="value" dominant-baseline="middle">la plus récente</text>
      <text :x="axios.x + 20" :y="ry(axios, 1)" class="value" dominant-baseline="middle">qui satisfait ^1.13.5</text>
      <rect :x="axios.x" :y="axios.y" :width="axios.w" :height="axios.h" class="outline hot-outline" />
    </g>

    <!-- click 2: plain-crypto-js and its postinstall, in npx's cache, where no lockfile sees them -->
    <path :d="toDropper" pathLength="1" class="line hot-line draw" :data-off="off(dropped)" />
    <polygon :points="down(cx(axios), dropper.y - 2)" class="accent pop" :data-off="off(dropped)" :style="d(0.35)" />
    <g class="pop" :data-off="off(dropped)" :style="d(0.4)">
      <rect :x="dropper.x - 1.5" :y="dropper.y - 1.5" :width="dropper.w + 3" :height="dropper.h + 3" class="card" />
      <rect :x="dropper.x - 1.5" :y="dropper.y - 1.5" :width="dropper.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="dropper.x + 20" :y="dropper.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ dropper.title }}</text>
      <text :x="dropper.x + 20" :y="ry(dropper, 0)" class="label" dominant-baseline="middle">postinstall</text>
      <text :x="dropper.x + 20" :y="ry(dropper, 1)" class="value hot" dominant-baseline="middle">installe le RAT</text>
      <rect :x="dropper.x" :y="dropper.y" :width="dropper.w" :height="dropper.h" class="outline hot-outline" />
    </g>
    <g class="pop" :data-off="off(dropped)" :style="d(0.7)">
      <text :x="tool.x" :y="dropper.y + 30" class="note">dans ~/.npm/_npx :</text>
      <text :x="tool.x" :y="dropper.y + 60" class="note hot">aucun lockfile,</text>
      <text :x="tool.x" :y="dropper.y + 90" class="note hot">aucun package.json</text>
    </g>
  </svg>
</template>

<style scoped>
.npx-resolve {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the project tinted */
.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
}

.area.inside {
  fill: color-mix(in srgb, var(--hud-ink) 5%, transparent);
}

.area-label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

/* fills (cards, header bars) reach under the whole stroke of the outline drawn over them, so that no
   light seam shows on the scaled slide */
.card {
  fill: var(--hud-surface);
}

.bar {
  fill: var(--hud-ink);
}

.hot-bar {
  fill: var(--hud-accent);
}

.outline {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.hot-outline {
  stroke: var(--hud-accent);
}

.bar-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.04em;
  fill: var(--hud-surface);
}

.ink {
  fill: var(--hud-ink);
}

.accent {
  fill: var(--hud-accent);
}

.line {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.hot-line {
  stroke: var(--hud-accent);
}

.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.label {
  font-family: var(--hud-font-mono);
  font-size: 18px;
  fill: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-ink);
}

.hot,
.note.hot {
  fill: var(--hud-accent);
}

.value.hot {
  font-weight: 600;
}

/* steps: lines draw themselves, the rest fades in after them (--d); going back hides them at once */
.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.4s ease-in-out var(--d, 0s);
}

.draw[data-off] {
  stroke-dashoffset: 1;
  transition: none;
}

.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
