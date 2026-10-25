<script setup lang="ts">
// The trust split of TanStack's bundle-size.yml (TanStack/router, before the attack): on pull_request_target, a job
// that runs the PR's code with read-only permissions, and a job that runs main's code to comment on the PR. The split
// holds for the GITHUB_TOKEN, but both jobs run inside the base repository, and so does its cache:
// - at the opening: the two jobs, as planned;
// - click 1: the untrusted job sets up its tools with the shared setup action, which caches the pnpm store;
// - click 2: at the end of the job, the cache action saves it in the repository's cache, shared with main, with a
//   token internal to the runner that `permissions` doesn't restrict.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <JobSplit />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const setup = computed(() => step.value >= 1)
const saved = computed(() => step.value >= 2)

// the base repository, where both jobs run
const area = { x: 20, y: 20, w: 1360, h: 560, label: 'dépôt TanStack/router · on: pull_request_target' }

// cards: header bar, then rows every RS, a label then a value; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const VX = 190 // offset of the values
const h = (n: number) => HB + 18 + n * RS
const bench = { x: 60, y: 80, w: 520, h: h(4), title: 'benchmark-pr · non fiable' }
const comment = { x: 820, y: 80, w: 520, h: h(3), title: 'comment-pr · fiable' }
const cache = { x: 60, y: 420, w: 520, h: h(2), title: 'cache Actions du dépôt' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cx = (c: { x: number, w: number }) => c.x + c.w / 2

const benchRows = [['code', 'celui de la PR'], ['GITHUB_TOKEN', 'lecture seule'], ['secrets', 'aucun']]
const commentRows = [['code', 'celui de main'], ['GITHUB_TOKEN', 'commenter la PR'], ['entrée', 'le résultat (JSON)']]

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// the result of the benchmark, passed to the trusted job
const RY = ry(bench, 0) - 6
const toComment = `M${bench.x + bench.w} ${RY}H${comment.x - 16}`
// click 2: the save of the cache, down from the untrusted job
const toCache = `M${cx(bench)} ${bench.y + bench.h}V${cache.y - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 600" class="job-split" fill="none">
    <rect :x="area.x" :y="area.y" :width="area.w" :height="area.h" class="area" />
    <text :x="area.x + 20" :y="area.y + 34" class="area-label">{{ area.label }}</text>

    <!-- the two jobs, as planned -->
    <g v-for="c in [bench, comment]" :key="c.title">
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="c.h + 3" class="card" />
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
    </g>
    <g v-for="([l, v], i) in benchRows" :key="`b${l}`">
      <text :x="bench.x + 20" :y="ry(bench, i)" class="label" dominant-baseline="middle">{{ l }}</text>
      <text :x="bench.x + VX" :y="ry(bench, i)" class="value" dominant-baseline="middle">{{ v }}</text>
    </g>
    <g v-for="([l, v], i) in commentRows" :key="`c${l}`">
      <text :x="comment.x + 20" :y="ry(comment, i)" class="label" dominant-baseline="middle">{{ l }}</text>
      <text :x="comment.x + VX" :y="ry(comment, i)" class="value" dominant-baseline="middle">{{ v }}</text>
    </g>
    <!-- click 1: the setup of the tools, with the cache -->
    <g class="pop" :data-off="off(setup)">
      <text :x="bench.x + 20" :y="ry(bench, 3)" class="label" dominant-baseline="middle">setup</text>
      <text :x="bench.x + VX" :y="ry(bench, 3)" class="value hot" dominant-baseline="middle">actions/cache (store pnpm)</text>
    </g>
    <rect v-for="c in [bench, comment]" :key="`o${c.title}`" :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" />

    <path :d="toComment" class="line" />
    <polygon :points="right(comment.x - 2, RY)" class="ink" />
    <text :x="(bench.x + bench.w + comment.x) / 2" :y="RY - 14" class="note" text-anchor="middle">résultat</text>

    <!-- click 2: saved at the end of the job, into the cache of the repository, shared with main -->
    <path :d="toCache" pathLength="1" class="line hot-line draw" :data-off="off(saved)" />
    <polygon :points="down(cx(bench), cache.y - 2)" class="accent pop" :data-off="off(saved)" :style="d(0.35)" />
    <text :x="cx(bench) + 16" :y="(bench.y + bench.h + cache.y) / 2 - 8" class="note hot pop" :data-off="off(saved)" :style="d(0.2)">sauvegarde en fin de job</text>
    <text :x="cx(bench) + 16" :y="(bench.y + bench.h + cache.y) / 2 + 20" class="note pop" :data-off="off(saved)" :style="d(0.2)">token interne au runner : permissions ignorées</text>
    <g class="pop" :data-off="off(saved)" :style="d(0.4)">
      <rect :x="cache.x - 1.5" :y="cache.y - 1.5" :width="cache.w + 3" :height="cache.h + 3" class="card" />
      <rect :x="cache.x - 1.5" :y="cache.y - 1.5" :width="cache.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="cache.x + 20" :y="cache.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ cache.title }}</text>
      <text :x="cache.x + 20" :y="ry(cache, 0)" class="label" dominant-baseline="middle">portée</text>
      <text :x="cache.x + VX" :y="ry(cache, 0)" class="value" dominant-baseline="middle">celle de main</text>
      <text :x="cache.x + 20" :y="ry(cache, 1)" class="label" dominant-baseline="middle">lu par</text>
      <text :x="cache.x + VX" :y="ry(cache, 1)" class="value hot" dominant-baseline="middle">release.yml</text>
      <rect :x="cache.x" :y="cache.y" :width="cache.w" :height="cache.h" class="outline hot-outline" />
    </g>
  </svg>
</template>

<style scoped>
.job-split {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
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
  stroke-dasharray: 1;
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
