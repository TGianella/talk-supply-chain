<script setup lang="ts">
// How Shai-Hulud propagates on a compromised machine, step by step. One area is the infected machine, one is the
// npm registry; the payload (bundle.js) does the work, and the loop closes when another machine installs the result.
// - at the opening: the machine runs bundle.js (postinstall), the npm token sits in ~/.npmrc;
// - click 1: it reads the token and runs npm whoami to get the account;
// - click 2: it lists the packages of that account (/-/v1/search?maintainer=…&size=20);
// - click 3: for each one it injects postinstall: node bundle.js and republishes (npm publish --force);
// - click 4: other developers install the poisoned version, and the loop runs back over the top to bundle.js.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <WormCycle />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  account?: string
  pkg?: string
}>(), { account: 'crowdstrike-publisher', pkg: 'paquet-de-victime' })

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const read = computed(() => step.value >= 1)
const listed = computed(() => step.value >= 2)
const published = computed(() => step.value >= 3)
const spread = computed(() => step.value >= 4)

// areas: the infected machine on the left, the npm registry on the right; the loop runs above both
const machine = { x: 20, y: 68, w: 940, h: 674, label: 'machine infectée' }
const npm = { x: 1000, y: 68, w: 380, h: 674, label: 'registre npm' }

// cards: header bar, then rows (label / value) every RS; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const h = (n: number) => HB + 18 + n * RS
const bundle = { x: 60, y: 124, w: 370, h: h(1), title: 'bundle.js' }
const npmrc = { x: 620, y: 124, w: 300, h: h(1), title: '~/.npmrc' }
const whoami = { x: 60, y: 264, w: 370, h: h(1), title: 'npm whoami' }
const search = { x: 60, y: 412, w: 860, h: h(2), title: 'registry /-/v1/search' }
const rewrite = { x: 60, y: 582, w: 580, h: h(2), title: 'pour chaque paquet' }
const version = { x: 1020, y: 582, w: 340, h: h(2), title: 'version piégée' }
const others = { x: 1020, y: 124, w: 340, h: h(1), title: 'autres développeurs' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const left = (x: number, y: number) => `${x},${y} ${x + 18},${y - 10} ${x + 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// click 1: the token goes from ~/.npmrc to bundle.js, which runs npm whoami; bundle.js, whoami and the search share one column
const readLine = `M${npmrc.x} ${cy(bundle)}H${bundle.x + bundle.w + 16}`
const vx = bundle.x + bundle.w / 2
const toWhoami = `M${vx} ${bundle.y + bundle.h}V${whoami.y - 16}`
// click 2: whoami leads to the search of the account's packages
const toSearch = `M${vx} ${whoami.y + whoami.h}V${search.y - 16}`
// click 3: each package is rewritten, then published straight across to the registry
const ix = vx
const toInject = `M${ix} ${search.y + search.h}V${rewrite.y - 16}`
const publish = `M${rewrite.x + rewrite.w} ${cy(rewrite)}H${version.x - 16}`
// click 4: the poisoned version is installed elsewhere, and the loop closes over the top on a new machine
const ox = version.x + 90
const toOthers = `M${ox} ${version.y}V${others.y + others.h + 16}`
const loopY = 40
const lx = bundle.x + 240
const loop = `M${others.x + others.w / 2} ${others.y}V${loopY}H${lx}V${bundle.y - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 760" class="worm-cycle" fill="none">
    <!-- the two areas: the machine tinted, the registry plain -->
    <rect :x="machine.x" :y="machine.y" :width="machine.w" :height="machine.h" class="area inside" />
    <text :x="machine.x + 20" :y="machine.y + 34" class="area-label">{{ machine.label }}</text>
    <rect :x="npm.x" :y="npm.y" :width="npm.w" :height="npm.h" class="area" :data-hot="published ? '' : undefined" />
    <text :x="npm.x + 20" :y="npm.y + 34" class="area-label">{{ npm.label }}</text>

    <!-- bundle.js, the payload run by the postinstall; the token in ~/.npmrc -->
    <g>
      <rect :x="bundle.x - 1.5" :y="bundle.y - 1.5" :width="bundle.w + 3" :height="bundle.h + 3" class="card" />
      <rect :x="bundle.x - 1.5" :y="bundle.y - 1.5" :width="bundle.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="bundle.x + 20" :y="bundle.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ bundle.title }}</text>
      <text :x="bundle.x + 20" :y="ry(bundle, 0)" class="value" dominant-baseline="middle">lancé par le postinstall</text>
      <rect :x="bundle.x" :y="bundle.y" :width="bundle.w" :height="bundle.h" class="outline" />
    </g>
    <g>
      <rect :x="npmrc.x - 1.5" :y="npmrc.y - 1.5" :width="npmrc.w + 3" :height="npmrc.h + 3" class="card" />
      <rect :x="npmrc.x - 1.5" :y="npmrc.y - 1.5" :width="npmrc.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="npmrc.x + 20" :y="npmrc.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ npmrc.title }}</text>
      <text :x="npmrc.x + 20" :y="ry(npmrc, 0)" class="value" :class="{ hot: read }" dominant-baseline="middle">NPM_TOKEN</text>
      <rect :x="npmrc.x" :y="npmrc.y" :width="npmrc.w" :height="npmrc.h" class="outline" />
    </g>

    <!-- click 1: bundle.js reads the token, then runs npm whoami to learn the account -->
    <path :d="readLine" pathLength="1" class="line hot-line draw" :data-off="off(read)" :style="d(0.3)" />
    <polygon :points="left(bundle.x + bundle.w + 2, cy(bundle))" class="accent pop" :data-off="off(read)" :style="d(0.75)" />
    <text :x="(bundle.x + bundle.w + npmrc.x) / 2" :y="cy(bundle) - 14" class="note hot pop" :data-off="off(read)" :style="d(0.5)" text-anchor="middle">lit le token</text>
    <path :d="toWhoami" pathLength="1" class="line draw" :data-off="off(read)" :style="d(0.3)" />
    <polygon :points="down(vx, whoami.y - 2)" class="ink pop" :data-off="off(read)" :style="d(0.75)" />
    <g class="pop" :data-off="off(read)" :style="d(0.8)">
      <rect :x="whoami.x - 1.5" :y="whoami.y - 1.5" :width="whoami.w + 3" :height="whoami.h + 3" class="card" />
      <rect :x="whoami.x - 1.5" :y="whoami.y - 1.5" :width="whoami.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="whoami.x + 20" :y="whoami.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ whoami.title }}</text>
      <text :x="whoami.x + 20" :y="ry(whoami, 0)" class="value" dominant-baseline="middle">compte {{ account }}</text>
      <rect :x="whoami.x" :y="whoami.y" :width="whoami.w" :height="whoami.h" class="outline" />
    </g>

    <!-- click 2: it lists the packages of that account, up to twenty -->
    <path :d="toSearch" pathLength="1" class="line hot-line draw" :data-off="off(listed)" :style="d(0.3)" />
    <polygon :points="down(vx, search.y - 2)" class="accent pop" :data-off="off(listed)" :style="d(0.75)" />
    <text :x="vx + 16" :y="(whoami.y + whoami.h + search.y) / 2 + 7" class="note hot pop" :data-off="off(listed)" :style="d(0.5)">liste ses paquets</text>
    <g class="pop" :data-off="off(listed)" :style="d(0.8)">
      <rect :x="search.x - 1.5" :y="search.y - 1.5" :width="search.w + 3" :height="search.h + 3" class="card" />
      <rect :x="search.x - 1.5" :y="search.y - 1.5" :width="search.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="search.x + 20" :y="search.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ search.title }}</text>
      <text :x="search.x + 20" :y="ry(search, 0)" class="value" dominant-baseline="middle">?text=maintainer:{{ account }}&amp;size=20</text>
      <text :x="search.x + 20" :y="ry(search, 1)" class="value hot" dominant-baseline="middle">→ 20 paquets du compte</text>
      <rect :x="search.x" :y="search.y" :width="search.w" :height="search.h" class="outline" />
    </g>

    <!-- click 3: each package is rewritten with the postinstall hook and republished to npm -->
    <path :d="toInject" pathLength="1" class="line hot-line draw" :data-off="off(published)" :style="d(0.3)" />
    <polygon :points="down(ix, rewrite.y - 2)" class="accent pop" :data-off="off(published)" :style="d(0.75)" />
    <g class="pop" :data-off="off(published)" :style="d(0.8)">
      <rect :x="rewrite.x - 1.5" :y="rewrite.y - 1.5" :width="rewrite.w + 3" :height="rewrite.h + 3" class="card" />
      <rect :x="rewrite.x - 1.5" :y="rewrite.y - 1.5" :width="rewrite.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="rewrite.x + 20" :y="rewrite.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ rewrite.title }}</text>
      <text :x="rewrite.x + 20" :y="ry(rewrite, 0)" class="value hot" dominant-baseline="middle">+ "postinstall": "node bundle.js"</text>
      <text :x="rewrite.x + 20" :y="ry(rewrite, 1)" class="value" dominant-baseline="middle">bundle.js copié, version +1, puis npm publish</text>
      <rect :x="rewrite.x" :y="rewrite.y" :width="rewrite.w" :height="rewrite.h" class="outline hot-outline" />
    </g>
    <path :d="publish" pathLength="1" class="line hot-line draw" :data-off="off(published)" :style="d(0.5)" />
    <polygon :points="right(version.x - 2, cy(rewrite))" class="accent pop" :data-off="off(published)" :style="d(0.95)" />
    <text :x="rewrite.x + rewrite.w + 20" :y="cy(rewrite) - 14" class="note hot pop" :data-off="off(published)" :style="d(0.7)">npm publish --force</text>
    <g class="pop" :data-off="off(published)" :style="d(1)">
      <rect :x="version.x - 1.5" :y="version.y - 1.5" :width="version.w + 3" :height="version.h + 3" class="card" />
      <rect :x="version.x - 1.5" :y="version.y - 1.5" :width="version.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="version.x + 20" :y="version.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ version.title }}</text>
      <text :x="version.x + 20" :y="ry(version, 0)" class="value hot" dominant-baseline="middle">{{ pkg }}</text>
      <text :x="version.x + 20" :y="ry(version, 1)" class="value" dominant-baseline="middle">avec le postinstall</text>
      <rect :x="version.x" :y="version.y" :width="version.w" :height="version.h" class="outline hot-outline" />
    </g>

    <!-- click 4: another developer installs the poisoned version, and the cycle restarts on their machine -->
    <path :d="toOthers" pathLength="1" class="line draw" :data-off="off(spread)" :style="d(0.3)" />
    <polygon :points="up(ox, others.y + others.h + 2)" class="ink pop" :data-off="off(spread)" :style="d(0.75)" />
    <text :x="ox + 16" :y="(others.y + others.h + version.y) / 2 + 7" class="note pop" :data-off="off(spread)" :style="d(0.5)">installée ailleurs</text>
    <g class="pop" :data-off="off(spread)" :style="d(0.8)">
      <rect :x="others.x - 1.5" :y="others.y - 1.5" :width="others.w + 3" :height="others.h + 3" class="card" />
      <rect :x="others.x - 1.5" :y="others.y - 1.5" :width="others.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="others.x + 20" :y="others.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ others.title }}</text>
      <text :x="others.x + 20" :y="ry(others, 0)" class="value" dominant-baseline="middle">npm install → postinstall</text>
      <rect :x="others.x" :y="others.y" :width="others.w" :height="others.h" class="outline" />
    </g>
    <path :d="loop" pathLength="1" class="line hot-line draw" :data-off="off(spread)" :style="d(1)" />
    <polygon :points="down(lx, bundle.y - 2)" class="accent pop" :data-off="off(spread)" :style="d(1.4)" />
    <text :x="(lx + others.x + others.w / 2) / 2" :y="loopY - 14" class="note hot pop" :data-off="off(spread)" :style="d(1.2)" text-anchor="middle">une autre machine : le ver recommence</text>
  </svg>
</template>

<style scoped>
.worm-cycle {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the machine tinted; the registry turns hot once a poisoned version lands */
.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
  transition: stroke 0.3s;
}

.area.inside {
  fill: color-mix(in srgb, var(--hud-ink) 5%, transparent);
}

.area[data-hot] {
  stroke: var(--hud-accent);
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

.note.hot {
  fill: var(--hud-accent);
}

.value {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-ink);
}

.value.hot {
  font-weight: 600;
  fill: var(--hud-accent);
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
