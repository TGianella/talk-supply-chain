<script setup lang="ts">
// The trigger of Shai-Hulud 2.0: preinstall instead of postinstall. The phases of npm install in a row, the hook of
// each wave above its phase:
// - at the opening: the four phases, the first wave on postinstall;
// - click 1: the second wave on preinstall, which runs as soon as the install starts;
// - click 2: the install fails at the dependencies: postinstall never runs, preinstall already has;
// - click 3: node_modules, still empty under preinstall: the payload must bring its own dependencies.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <InstallHooks />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const early = computed(() => step.value >= 1)
const failed = computed(() => step.value >= 2)
const bare = computed(() => step.value >= 3)

// the phases: cards with a header bar and one row, side by side
const HB = 44
const W = 296
const GAP = 56
const Y = 80
const H = HB + 18 + 34
const ry = Y + HB + 26
const cy = Y + H / 2
const [fetch, pre, deps, post] = [
  { title: 'npm install', value: 'télécharge le paquet' },
  { title: 'preinstall', value: 'script du paquet' },
  { title: 'dépendances', value: 'remplit node_modules' },
  { title: 'postinstall', value: 'script du paquet' },
].map((p, i) => ({ ...p, x: 24 + i * (W + GAP) }))
const phases = [fetch, pre, deps, post]

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const arrow = (a: { x: number }, b: { x: number }) => `M${a.x + W} ${cy}H${b.x - 16}`

// click 3: node_modules, empty, under preinstall
const nm = { x: pre.x, y: Y + H + 48, w: W, h: 56 }
const toNm = `M${pre.x + W / 2} ${Y + H}V${nm.y}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 300" class="install-hooks" fill="none">
    <!-- the hook of each wave, above its phase: the first one from the start, the second at click 1 -->
    <text :x="post.x + W / 2" :y="Y - 24" class="tag" text-anchor="middle">Shai-Hulud · sept.</text>
    <text :x="pre.x + W / 2" :y="Y - 24" class="tag hot pop" :data-off="off(early)" text-anchor="middle">Shai-Hulud 2.0 · nov.</text>

    <!-- the phases of npm install; postinstall and the arrow to it dim once the install fails -->
    <path :d="arrow(fetch, pre)" class="line" />
    <polygon :points="right(pre.x - 2, cy)" class="ink" />
    <path :d="arrow(pre, deps)" class="line" />
    <polygon :points="right(deps.x - 2, cy)" class="ink" />
    <g class="dim" :data-dim="failed ? '' : undefined">
      <path :d="arrow(deps, post)" class="line" />
      <polygon :points="right(post.x - 2, cy)" class="ink" />
    </g>
    <g
      v-for="p in phases"
      :key="p.title"
      class="dim"
      :data-hot="p === pre && early ? '' : undefined"
      :data-failed="p === deps && failed ? '' : undefined"
      :data-dim="p === post && failed ? '' : undefined"
    >
      <rect :x="p.x - 1.5" :y="Y - 1.5" :width="W + 3" :height="H + 3" class="card" />
      <rect :x="p.x - 1.5" :y="Y - 1.5" :width="W + 3" :height="HB + 1.5" class="bar" />
      <text :x="p.x + 20" :y="Y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ p.title }}</text>
      <text :x="p.x + 20" :y="ry" class="value pop" :data-off="off(!(p === deps && failed))" dominant-baseline="middle">{{ p.value }}</text>
      <text v-if="p === deps" :x="p.x + 20" :y="ry" class="value hot pop" :data-off="off(failed)" dominant-baseline="middle">✕ échec</text>
      <rect :x="p.x" :y="Y" :width="W" :height="H" class="outline" />
    </g>
    <text :x="post.x + 20" :y="Y + H + 40" class="note pop" :data-off="off(failed)" :style="d(0.2)">jamais exécuté</text>

    <!-- click 3: when preinstall runs, node_modules is still empty -->
    <path :d="toNm" pathLength="1" class="line hot-line draw" :data-off="off(bare)" :style="d(0.2)" />
    <g class="pop" :data-off="off(bare)" :style="d(0.45)">
      <rect :x="nm.x" :y="nm.y" :width="nm.w" :height="nm.h" class="empty" />
      <text :x="nm.x + 20" :y="nm.y + nm.h / 2 + 1" class="value" dominant-baseline="middle">node_modules/</text>
      <text :x="nm.x + nm.w - 20" :y="nm.y + nm.h / 2 + 1" class="value hot" text-anchor="end" dominant-baseline="middle">vide</text>
    </g>
  </svg>
</template>

<style scoped>
.install-hooks {
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
  transition: fill 0.3s;
}

.outline {
  stroke: var(--hud-ink);
  stroke-width: 3;
  transition: stroke 0.3s;
}

/* preinstall turns hot with the second wave; the dependencies turn hot when they fail */
[data-hot] > .bar {
  fill: var(--hud-accent);
}

[data-hot] > .outline,
[data-failed] > .outline {
  stroke: var(--hud-accent);
}

[data-failed] > .outline {
  stroke-dasharray: 10 8;
}

.empty {
  fill: var(--hud-surface);
  stroke: var(--hud-accent);
  stroke-width: 3;
  stroke-dasharray: 10 8;
}

.dim {
  transition: opacity 0.3s ease 0.2s;
}

.dim[data-dim] {
  opacity: 0.3;
}

.bar-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.04em;
  fill: var(--hud-surface);
}

.tag {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.ink {
  fill: var(--hud-ink);
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

.value {
  font-family: var(--hud-font-mono);
  font-size: 22px;
  fill: var(--hud-ink);
}

.hot,
.tag.hot {
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
