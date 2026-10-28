<script setup lang="ts">
// Staged publishing on npm: what the CI publishes waits in the registry until a maintainer approves it with 2FA.
// The release run and the maintainer on the left, the registry on the right, in two zones: pending and public.
// - at the opening: the run, the two empty zones;
// - click 1: the run stages a version (npm stage publish), which lands in the pending zone, not installable;
// - click 2: a maintainer approves it, with 2FA (CLI or npmjs.com);
// - click 3: the version moves to the public zone, installable.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <StagedPublishing pkg="mon-paquet" version="1.2.0" />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  pkg?: string
  version?: string
  workflow?: string
}>(), {
  pkg: 'mon-paquet',
  version: '1.2.0',
  workflow: 'release.yml',
})

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const staged = computed(() => step.value >= 1)
const approved = computed(() => step.value >= 2)
const promoted = computed(() => step.value >= 3)

// cards: header bar, then rows every RS, a label then a value at vx; h(n) fits n rows
const HB = 44
const RS = 40
const h = (n: number) => HB + 18 + n * RS
const card = (x: number, y: number, w: number, vx: number, title: string, rows: [string, string][]) => ({ x, y, w, vx, h: h(rows.length), title, rows })
const ry = (c: { y: number }, i: number) => c.y + HB + 30 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2
const cx = (c: { x: number, w: number }) => c.x + c.w / 2

const name = computed(() => `${props.pkg}@${props.version}`)
const run = computed(() => card(0, 80, 400, 120, `${props.workflow} · main`, [['lance', 'npm stage publish']]))
const human = card(0, 360, 400, 190, 'mainteneur', [['valide avec', '2FA']])

// the registry and its two zones; the cards centered in them, far enough from their sides for the arrows
// to land on the cards, inside the zones
const registry = { x: 520, y: 10, w: 960, h: 480, label: 'registre npm' }
const pending = { x: 550, y: 70, w: 430, h: 400, label: 'en attente' }
const live = { x: 1020, y: 70, w: 430, h: 400, label: 'public' }
const PAD = 24
const CARD_Y = pending.y + pending.h / 2 - h(2) / 2
const pendingCard = computed(() => card(pending.x + PAD, CARD_Y, pending.w - 2 * PAD, 190, name.value, [['statut', approved.value ? 'approuvée' : 'en attente'], ['installable', 'non']]))
const liveCard = computed(() => card(live.x + PAD, CARD_Y, live.w - 2 * PAD, 190, name.value, [['statut', 'publiée'], ['installable', 'oui']]))

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`

// click 1: the run publishes into the pending zone
const toPending = computed(() => `M${run.value.x + run.value.w} ${cy(run.value)}H470V${cy(pendingCard.value)}H${pendingCard.value.x - 16}`)
// click 2: the maintainer approves it, from below
const pendingBottom = computed(() => pendingCard.value.y + pendingCard.value.h)
const toApprove = computed(() => `M${human.x + human.w} ${cy(human)}H${cx(pendingCard.value)}V${pendingBottom.value + 16}`)
// click 3: the version goes public
const toLive = computed(() => `M${pendingCard.value.x + pendingCard.value.w} ${cy(pendingCard.value)}H${liveCard.value.x - 16}`)

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1480 500" class="staged-publishing" fill="none">
    <!-- the registry and its two zones -->
    <rect :x="registry.x" :y="registry.y" :width="registry.w" :height="registry.h" class="area" />
    <text :x="registry.x + 20" :y="registry.y + 34" class="area-label">{{ registry.label }}</text>
    <template v-for="z in [pending, live]" :key="z.label">
      <rect :x="z.x" :y="z.y" :width="z.w" :height="z.h" class="zone" />
      <text :x="z.x + 20" :y="z.y + 36" class="area-label">{{ z.label }}</text>
    </template>

    <!-- the cards: the pending version at click 1, the maintainer at click 2, the public version at click 3 -->
    <g
      v-for="[c, on, delay, hot, faded] in ([[run, true, 0, false, false], [pendingCard, staged, 0.5, false, promoted], [human, approved, 0, false, false], [liveCard, promoted, 0.4, true, false]])"
      :key="`${c.title}-${c.x}`"
      class="pop"
      :data-off="off(on)"
      :data-faded="faded ? '' : undefined"
      :style="d(delay)"
    >
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="c.h + 3" class="card" />
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="HB + 1.5" class="bar" :class="{ hot }" />
      <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
      <template v-for="([label, value], i) in c.rows" :key="label">
        <text :x="c.x + 20" :y="ry(c, i)" class="label" dominant-baseline="middle">{{ label }}</text>
        <text :x="c.x + c.vx" :y="ry(c, i)" class="value" dominant-baseline="middle">{{ value }}</text>
      </template>
      <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" :class="{ hot }" />
    </g>

    <!-- click 1: published, but only into the pending zone -->
    <path :d="toPending" pathLength="1" class="line draw" :data-off="off(staged)" />
    <polygon :points="right(pendingCard.x - 2, cy(pendingCard))" class="ink pop" :data-off="off(staged)" :style="d(0.45)" />

    <!-- click 2: a human approves it, with 2FA -->
    <path :d="toApprove" pathLength="1" class="line draw" :data-off="off(approved)" :style="d(0.3)" />
    <polygon :points="up(cx(pendingCard), pendingBottom + 2)" class="ink pop" :data-off="off(approved)" :style="d(0.75)" />
    <text :x="human.x + human.w + 24" :y="cy(human) - 14" class="note pop" :data-off="off(approved)" :style="d(0.5)">approuve</text>

    <!-- click 3: the version goes public -->
    <path :d="toLive" pathLength="1" class="line hot-line draw" :data-off="off(promoted)" />
    <polygon :points="right(liveCard.x - 2, cy(liveCard))" class="accent pop" :data-off="off(promoted)" :style="d(0.4)" />
  </svg>
</template>

<style scoped>
.staged-publishing {
  display: block;
  width: 1480px;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the registry: dashed border; its zones: dashed, lighter */
.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
}

.zone {
  fill: color-mix(in srgb, var(--hud-ink) 4%, transparent);
  stroke: var(--hud-faint);
  stroke-width: 2;
  stroke-dasharray: 8 6;
}

.area-label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

/* fills (card, header bar) reach under the whole stroke of the outline drawn over them, so that no
   light seam shows on the scaled slide */
.card {
  fill: var(--hud-surface);
}

.bar {
  fill: var(--hud-ink);
}

.bar.hot {
  fill: var(--hud-accent);
}

.outline {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.outline.hot {
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
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-mono);
  font-size: 22px;
  fill: var(--hud-ink);
}

/* the pending version, once gone public: only its trace stays */
[data-faded] {
  opacity: 0.35;
}

/* steps: lines draw themselves, the rest fades in after them (--d); going back hides them at once */
.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.5s ease-in-out var(--d, 0s);
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
