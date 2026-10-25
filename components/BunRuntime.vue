<script setup lang="ts">
// How Shai-Hulud 2.0 brings its own runtime: setup_bun.js, run by node from the preinstall, installs Bun when it
// is missing, then runs the payload with it.
// - at the opening: setup_bun.js, run by node;
// - click 1: Bun is missing, so it installs it with the official script;
// - click 2: it runs bun_environment.js with Bun (straight away when Bun was already there).
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <BunRuntime />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const installed = computed(() => step.value >= 1)
const launched = computed(() => step.value >= 2)

// cards: header bar, then two rows (label / value)
const HB = 44
const RS = 34
const Y = 110
const H = HB + 18 + 2 * RS
const ry = (i: number) => Y + HB + 26 + i * RS
const cy = Y + H / 2
const setup = { x: 20, w: 300, title: 'setup_bun.js' }
const install = { x: 460, w: 470, title: 'installe Bun' }
const payload = { x: 1070, w: 310, title: 'bun_environment.js' }

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// click 1: Bun missing, installed; click 2: the payload run with Bun, or straight away when it was there
const toInstall = `M${setup.x + setup.w} ${cy}H${install.x - 16}`
const toPayload = `M${install.x + install.w} ${cy}H${payload.x - 16}`
const BY = 50
const px = payload.x + payload.w / 2
const bypass = `M${setup.x + setup.w / 2} ${Y}V${BY}H${px}V${Y - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 260" class="bun-runtime" fill="none">
    <!-- setup_bun.js, the script of the preinstall, run by node -->
    <g>
      <rect :x="setup.x - 1.5" :y="Y - 1.5" :width="setup.w + 3" :height="H + 3" class="card" />
      <rect :x="setup.x - 1.5" :y="Y - 1.5" :width="setup.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="setup.x + 20" :y="Y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ setup.title }}</text>
      <text :x="setup.x + 20" :y="ry(0)" class="value" dominant-baseline="middle">lancé par preinstall</text>
      <text :x="setup.x + 20" :y="ry(1)" class="value" dominant-baseline="middle">exécuté par node</text>
      <rect :x="setup.x" :y="Y" :width="setup.w" :height="H" class="outline" />
    </g>

    <!-- click 1: Bun is missing, it installs it -->
    <path :d="toInstall" pathLength="1" class="line hot-line draw" :data-off="off(installed)" :style="d(0.2)" />
    <polygon :points="right(install.x - 2, cy)" class="accent pop" :data-off="off(installed)" :style="d(0.55)" />
    <text :x="(setup.x + setup.w + install.x) / 2" :y="cy - 14" class="note hot pop" :data-off="off(installed)" :style="d(0.35)" text-anchor="middle">bun absent</text>
    <g class="pop" :data-off="off(installed)" :style="d(0.6)">
      <rect :x="install.x - 1.5" :y="Y - 1.5" :width="install.w + 3" :height="H + 3" class="card" />
      <rect :x="install.x - 1.5" :y="Y - 1.5" :width="install.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="install.x + 20" :y="Y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ install.title }}</text>
      <text :x="install.x + 20" :y="ry(0)" class="value hot" dominant-baseline="middle">curl -fsSL bun.sh/install | bash</text>
      <text :x="install.x + 20" :y="ry(1)" class="value" dominant-baseline="middle">un seul binaire, dans ~/.bun</text>
      <rect :x="install.x" :y="Y" :width="install.w" :height="H" class="outline hot-outline" />
    </g>

    <!-- click 2: the payload, run with Bun; straight away when Bun was already there -->
    <path :d="toPayload" pathLength="1" class="line hot-line draw" :data-off="off(launched)" :style="d(0.2)" />
    <polygon :points="right(payload.x - 2, cy)" class="accent pop" :data-off="off(launched)" :style="d(0.55)" />
    <text :x="(install.x + install.w + payload.x) / 2" :y="cy - 14" class="note hot pop" :data-off="off(launched)" :style="d(0.35)" text-anchor="middle">puis lance</text>
    <path :d="bypass" pathLength="1" class="line muted-line draw" :data-off="off(launched)" :style="d(0.2)" />
    <polygon :points="down(px, Y - 2)" class="muted pop" :data-off="off(launched)" :style="d(0.65)" />
    <text :x="(setup.x + setup.w / 2 + px) / 2" :y="BY - 14" class="note pop" :data-off="off(launched)" :style="d(0.45)" text-anchor="middle">bun déjà présent</text>
    <g class="pop" :data-off="off(launched)" :style="d(0.7)">
      <rect :x="payload.x - 1.5" :y="Y - 1.5" :width="payload.w + 3" :height="H + 3" class="card" />
      <rect :x="payload.x - 1.5" :y="Y - 1.5" :width="payload.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="payload.x + 20" :y="Y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ payload.title }}</text>
      <text :x="payload.x + 20" :y="ry(0)" class="value" dominant-baseline="middle">exécuté par bun</text>
      <text :x="payload.x + 20" :y="ry(1)" class="value hot" dominant-baseline="middle">la charge du ver</text>
      <rect :x="payload.x" :y="Y" :width="payload.w" :height="H" class="outline hot-outline" />
    </g>
  </svg>
</template>

<style scoped>
.bun-runtime {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
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

.accent {
  fill: var(--hud-accent);
}

.muted {
  fill: var(--hud-muted);
}

.line {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.hot-line {
  stroke: var(--hud-accent);
}

/* the way around when Bun is already there, in the background */
.muted-line {
  stroke: var(--hud-muted);
}

.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-mono);
  font-size: 22px;
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
