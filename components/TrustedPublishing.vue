<script setup lang="ts">
// Trusted publishing on npm: the CI publishes with no npm secret, proving its identity with an OIDC token.
// GitHub (OIDC provider) on the left, the release run in the middle, npm on the right, which knows the repository
// and the workflow it trusts for the package. GitHub and npm never talk to each other: the run carries the token.
// (Under the hood the npm CLI trades the OIDC token for a short-lived npm token scoped to the package, and
// publishes with it; left out here.)
// - at the opening: the three, the run holding no npm secret;
// - click 1: the run asks GitHub who it is, and gets an identity token signed by GitHub (repository, workflow);
// - click 2: it publishes, showing that token to npm, which checks it against the trusted publisher of the package;
// - click 3: the package is published.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <TrustedPublishing pkg="mon-paquet" version="1.2.0" repo="org/mon-paquet" />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  pkg?: string
  version?: string
  repo?: string
  workflow?: string
}>(), {
  pkg: 'mon-paquet',
  version: '1.2.0',
  repo: 'org/mon-paquet',
  workflow: 'release.yml',
})

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const identified = computed(() => step.value >= 1)
const checked = computed(() => step.value >= 2)
const published = computed(() => step.value >= 3)

// cards: header bar, then rows every RS, a label then a value; h(n) fits n rows
const HB = 44
const RS = 40
const h = (n: number) => HB + 18 + n * RS
// vx: offset of the values, past the longest label
const card = (x: number, y: number, w: number, vx: number, title: string, rows: [string, string][]) => ({ x, y, w, vx, h: h(rows.length), title, rows })
const gh = card(0, 30, 360, 100, 'GitHub · OIDC', [['émet', 'jetons d’identité']])
const run = computed(() => card(560, 30, 400, 170, `${props.workflow} · main`, [['dépôt', props.repo], ['secret npm', 'aucun']]))
const npm = computed(() => card(1080, 30, 400, 170, 'registry.npmjs.org', [['paquet', props.pkg], ['dépôt', props.repo], ['workflow', props.workflow]]))
const idToken = computed(() => card(560, 230, 400, 170, 'jeton d’identité', [['dépôt', props.repo], ['workflow', props.workflow], ['signé par', 'GitHub']]))
const pkg = computed(() => card(1080, 330, 400, 170, `${props.pkg}@${props.version}`, [['depuis', props.repo], ['workflow', props.workflow]]))
const ry = (c: { y: number }, i: number) => c.y + HB + 30 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2
const cx = (c: { x: number, w: number }) => c.x + c.w / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`
const left = (x: number, y: number) => `${x},${y} ${x + 18},${y - 10} ${x + 18},${y + 10}`

// click 1: the run asks GitHub, which answers with the identity token
const askY = computed(() => ry(run.value, 0))
const toGh = computed(() => `M${run.value.x} ${askY.value}H${gh.x + gh.w + 16}`)
const toId = computed(() => `M${cx(gh)} ${gh.y + gh.h}V${cy(idToken.value)}H${idToken.value.x - 16}`)
// click 2: the run shows it to npm, from under the run up into npm
const SX = 1160
const showY = computed(() => idToken.value.y + 40)
const npmBottom = computed(() => npm.value.y + npm.value.h)
const toNpm = computed(() => `M${idToken.value.x + idToken.value.w} ${showY.value}H${SX}V${npmBottom.value + 16}`)
// click 3: the published package, under npm
const BX = 1400
const toPkg = computed(() => `M${BX} ${npmBottom.value}V${pkg.value.y - 16}`)
// click 2: the run publishes
const PY = 140
const toPublish = computed(() => `M${run.value.x + run.value.w} ${PY}H${npm.value.x - 16}`)

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1480 500" class="trusted-publishing" fill="none">
    <!-- the cards; the identity token at click 1, the published package at click 3 -->
    <g
      v-for="[c, on, delay, hot] in ([[gh, true, 0, false], [run, true, 0, false], [npm, true, 0, false], [idToken, identified, 0.7, false], [pkg, published, 0.4, true]])"
      :key="c.title"
      class="pop"
      :data-off="off(on)"
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

    <!-- click 1: who am I? then the identity token, signed by GitHub -->
    <path :d="toGh" pathLength="1" class="line draw" :data-off="off(identified)" />
    <polygon :points="left(gh.x + gh.w + 2, askY)" class="ink pop" :data-off="off(identified)" :style="d(0.45)" />
    <text :x="(gh.x + gh.w + run.x) / 2" :y="askY - 18" class="note pop" text-anchor="middle" :data-off="off(identified)">qui suis-je ?</text>
    <path :d="toId" pathLength="1" class="line draw" :data-off="off(identified)" :style="d(0.3)" />
    <polygon :points="right(idToken.x - 2, cy(idToken))" class="ink pop" :data-off="off(identified)" :style="d(0.75)" />

    <!-- click 2: shown to npm, which checks it against the trusted publisher of the package -->
    <path :d="toNpm" pathLength="1" class="line draw" :data-off="off(checked)" />
    <polygon :points="up(SX, npmBottom + 2)" class="ink pop" :data-off="off(checked)" :style="d(0.45)" />
    <text :x="idToken.x + idToken.w + 20" :y="showY - 14" class="note pop" :data-off="off(checked)" :style="d(0.2)">présente</text>
    <text :x="SX + 16" :y="npmBottom + 48" class="note ok pop" :data-off="off(checked)" :style="d(0.6)">✓ correspond</text>

    <!-- click 3: the package, published -->
    <path :d="toPkg" pathLength="1" class="line hot-line draw" :data-off="off(published)" />
    <polygon :points="down(BX, pkg.y - 2)" class="accent pop" :data-off="off(published)" :style="d(0.4)" />

    <!-- click 2, with the identity token: the run publishes -->
    <path :d="toPublish" pathLength="1" class="line hot-line draw" :data-off="off(checked)" />
    <polygon :points="right(npm.x - 2, PY)" class="accent pop" :data-off="off(checked)" :style="d(0.45)" />
    <text :x="(run.x + run.w + npm.x) / 2" :y="PY - 16" class="note hot pop" text-anchor="middle" :data-off="off(checked)" :style="d(0.2)">publie</text>
  </svg>
</template>

<style scoped>
.trusted-publishing {
  display: block;
  width: 1480px;
  padding: 24px 32px 32px;
  overflow: visible;
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

.note.hot {
  font-weight: 600;
  fill: var(--hud-accent);
}

.note.ok {
  font-weight: 600;
  fill: var(--hud-ink);
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
