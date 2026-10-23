<script setup lang="ts">
// The "pwn request" pattern of GitHub Actions, in two areas: the forks (anyone) and the main repository,
// with its secrets. A pull request goes from a fork to the main repository, and the workflows it triggers
// run in one area or the other:
// - click 1: `pull_request`, on the fork's side: the PR's version of the workflow, a read-only token, no secrets;
// - click 2: `pull_request_target`, inside the main repository: the target branch's version of the workflow,
//   a token that can write and the secrets, while the PR's title and code come in from the fork.
// With `chain`, both runs are shown at once (pull_request dimmed) and the clicks play the nx attack:
// - click 1: the PR title is executed in the pull_request_target run;
// - click 2: its token triggers the publish workflow on the attacker's commit, which sends the npm token out.
// Steps count from the click that opened its window in the case layout (two `clicks` on that modus row),
// or from `at`. <PwnRequest /> then <PwnRequest chain />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject, useId } from 'vue'

const props = withDefaults(defineProps<{
  chain?: boolean
  repo?: string
  at?: number
}>(), { repo: 'nrwl/nx' })

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
// what the pattern shows, and what the chain adds
const shown = (k: number) => props.chain || step.value >= k
const played = (k: number) => props.chain && step.value >= k

// areas: forks on the left, the main repository on the right
const ZB = 640
const forks = { x: 20, y: 20, w: 440, h: ZB - 20, label: 'forks · n’importe qui' }
const repoArea = { x: 500, y: 20, w: 880, h: ZB - 20, label: `dépôt ${props.repo}` }

// cards: header bar, then rows
const HB = 44
const fork = { x: 60, y: 80, w: 300, h: 150, title: 'fork' }
const main = { x: 560, y: 80, w: 340, h: 150, title: props.repo }
const secrets = { x: 960, y: 80, w: 380, h: 150, title: 'secrets' }
const cardRow = (c: { y: number }, i: number) => c.y + HB + 36 + i * 44

// runs
const RY = 360
const safe = { x: 60, y: RY, w: 360, h: 210, title: 'on: pull_request' }
const target = { x: 540, y: RY, w: 460, h: 250, title: 'on: pull_request_target' }
const publish = { x: 1060, y: RY, w: 280, h: 160, title: 'publish.yml' }
const runRow = (i: number) => RY + HB + 36 + i * 46
const safeRows = [['token', 'lecture seule'], ['secrets', 'aucun'], ['workflow', 'celui de la PR']]
const targetRows = [['token', 'lecture + écriture'], ['secrets', 'accessibles'], ['workflow', 'de la branche cible']]

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// the pull request, from the fork to the main repository, across the border
const PY = fork.y + (HB + fork.h) / 2
// each run triggered from its side
const fx = fork.x + fork.w / 2
const mx = main.x + main.w / 2
// the secrets, reaching the pull_request_target run
const sx = secrets.x + secrets.w / 2
const SY = 300
const tx = target.x + target.w - 40
// the title of the PR, from the fork into the pull_request_target run
const DY = runRow(0) - 6
const data = `M${fork.x + fork.w} ${fork.y + fork.h - 25}H480V${DY}H${target.x - 16}`
// the chain: from the run to the publish workflow, then out to the webhook, below the areas
const CY = runRow(0) - 6
const hook = { x: 1080, y: 680, w: 240, h: 60 }
const px = publish.x + publish.w / 2
const H = props.chain ? 760 : 660

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
// the dashed title line draws through a mask, its dashes taking the stroke-dasharray
const titleMask = `pwn-title-${useId()}`
</script>

<template>
  <svg :viewBox="`0 0 1400 ${H}`" class="pwn-request" fill="none">
    <!-- the two areas -->
    <g v-for="a in [forks, repoArea]" :key="a.label">
      <rect :x="a.x" :y="a.y" :width="a.w" :height="a.h" class="area" :class="{ inside: a === repoArea }" />
      <text :x="a.x + 20" :y="a.y + 34" class="area-label">{{ a.label }}</text>
    </g>

    <!-- the fork, the main repository and its secrets -->
    <g v-for="c in [fork, main, secrets]" :key="c.title">
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="c.h + 3" class="card" />
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
    </g>
    <text :x="fork.x + 20" :y="cardRow(fork, 0)" class="value" dominant-baseline="middle">
      titre : <tspan :class="{ hot: played(1) }">{{ chain ? '$(…)' : 'feat: …' }}</tspan>
    </text>
    <text :x="fork.x + 20" :y="cardRow(fork, 1)" class="value" dominant-baseline="middle">code de l’auteur</text>
    <text :x="main.x + 20" :y="cardRow(main, 0)" class="value" dominant-baseline="middle">.github/workflows/</text>
    <text :x="main.x + 20" :y="cardRow(main, 1)" class="value" dominant-baseline="middle">code de l’équipe</text>
    <text :x="secrets.x + 20" :y="cardRow(secrets, 0)" class="value" dominant-baseline="middle">NPM_TOKEN</text>
    <text :x="secrets.x + 20" :y="cardRow(secrets, 1)" class="value" dominant-baseline="middle">token en écriture</text>
    <rect v-for="c in [fork, main, secrets]" :key="`o${c.title}`" :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" />

    <path :d="`M${fork.x + fork.w} ${PY}H${main.x - 16}`" class="line" />
    <polygon :points="right(main.x - 2, PY)" class="ink" />
    <text :x="(fork.x + fork.w + main.x) / 2" :y="PY - 16" class="cmd halo" text-anchor="middle">pull request</text>

    <!-- click 1: pull_request, on the fork's side -->
    <g class="dim" :data-dim="chain ? '' : undefined">
      <path :d="`M${fx} ${fork.y + fork.h}V${safe.y - 16}`" pathLength="1" class="line draw" :data-off="off(shown(1))" />
      <polygon :points="down(fx, safe.y - 2)" class="ink pop" :data-off="off(shown(1))" :style="d(0.45)" />
      <text :x="fx + 14" y="300" class="note pop" :data-off="off(shown(1))" :style="d(0.3)">déclenche</text>
      <g class="pop" :data-off="off(shown(1))" :style="d(0.5)">
        <rect :x="safe.x - 1.5" :y="safe.y - 1.5" :width="safe.w + 3" :height="safe.h + 3" class="card" />
        <rect :x="safe.x - 1.5" :y="safe.y - 1.5" :width="safe.w + 3" :height="HB + 1.5" class="bar" />
        <text :x="safe.x + 20" :y="safe.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ safe.title }}</text>
        <g v-for="([l, v], i) in safeRows" :key="l">
          <text :x="safe.x + 20" :y="runRow(i)" class="label" dominant-baseline="middle">{{ l }}</text>
          <text :x="safe.x + 140" :y="runRow(i)" class="value" dominant-baseline="middle">{{ v }}</text>
        </g>
        <rect :x="safe.x" :y="safe.y" :width="safe.w" :height="safe.h" class="outline" />
      </g>
    </g>

    <!-- click 2: pull_request_target, inside the main repository, with the secrets and the PR's title -->
    <mask :id="titleMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1400" :height="H">
      <path :d="data" pathLength="1" class="reveal draw" :data-off="off(shown(2))" :style="d(0.3)" />
    </mask>
    <g>
      <path :d="`M${mx} ${main.y + main.h}V${target.y - 16}`" pathLength="1" class="line draw" :data-off="off(shown(2))" />
      <polygon :points="down(mx, target.y - 2)" class="ink pop" :data-off="off(shown(2))" :style="d(0.45)" />
      <text :x="mx + 14" y="300" class="note pop" :data-off="off(shown(2))" :style="d(0.3)">déclenche</text>
      <path :d="`M${sx} ${secrets.y + secrets.h}V${SY}H${tx}V${target.y - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(shown(2))" :style="d(0.3)" />
      <polygon :points="down(tx, target.y - 2)" class="accent pop" :data-off="off(shown(2))" :style="d(0.75)" />
      <text :x="sx - 14" :y="SY - 14" class="note hot pop" text-anchor="end" :data-off="off(shown(2))" :style="d(0.5)">accès aux secrets</text>
      <path :d="data" class="line hot-line dashed" :mask="`url(#${titleMask})`" />
      <polygon :points="right(target.x - 2, DY)" class="accent pop" :data-off="off(shown(2))" :style="d(0.75)" />
      <text x="466" y="330" class="note hot halo pop" text-anchor="end" :data-off="off(shown(2))" :style="d(0.5)">titre de la PR</text>

      <g class="pop" :data-off="off(shown(2))" :style="d(0.8)">
        <rect :x="target.x - 1.5" :y="target.y - 1.5" :width="target.w + 3" :height="target.h + 3" class="card" />
        <rect :x="target.x - 1.5" :y="target.y - 1.5" :width="target.w + 3" :height="HB + 1.5" class="bar" />
        <text :x="target.x + 20" :y="target.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ target.title }}</text>
        <g v-for="([l, v], i) in targetRows" :key="l">
          <text :x="target.x + 20" :y="runRow(i)" class="label" dominant-baseline="middle">{{ l }}</text>
          <text :x="target.x + 150" :y="runRow(i)" class="value" :class="{ hot: i < 2 }" dominant-baseline="middle">{{ v }}</text>
        </g>
        <!-- chain, click 1: the title is executed -->
        <g class="pop" :data-off="off(played(1))" :style="d(0)">
          <text :x="target.x + 20" :y="runRow(3)" class="label hot" dominant-baseline="middle">exécute</text>
          <text :x="target.x + 150" :y="runRow(3)" class="value hot" dominant-baseline="middle">le titre de la PR</text>
        </g>
        <rect :x="target.x" :y="target.y" :width="target.w" :height="target.h" class="outline" :class="{ 'hot-outline': played(1) }" />
      </g>
    </g>

    <!-- chain, click 2: the publish workflow, triggered with the token, sends the npm token out -->
    <g v-if="chain">
      <path :d="`M${target.x + target.w} ${CY}H${publish.x - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(played(2))" />
      <polygon :points="right(publish.x - 2, CY)" class="accent pop" :data-off="off(played(2))" :style="d(0.45)" />
      <g class="pop" :data-off="off(played(2))" :style="d(0.5)">
        <rect :x="publish.x - 1.5" :y="publish.y - 1.5" :width="publish.w + 3" :height="publish.h + 3" class="card" />
        <rect :x="publish.x - 1.5" :y="publish.y - 1.5" :width="publish.w + 3" :height="HB + 1.5" class="bar" />
        <text :x="publish.x + 20" :y="publish.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ publish.title }}</text>
        <text :x="publish.x + 20" :y="runRow(0)" class="value" dominant-baseline="middle">NPM_TOKEN</text>
        <text :x="publish.x + 20" :y="runRow(1)" class="value" dominant-baseline="middle">code : attaquant</text>
        <rect :x="publish.x" :y="publish.y" :width="publish.w" :height="publish.h" class="outline hot-outline" />
      </g>

      <path :d="`M${px} ${publish.y + publish.h}V${hook.y - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(played(2))" :style="d(0.8)" />
      <polygon :points="down(px, hook.y - 2)" class="accent pop" :data-off="off(played(2))" :style="d(1.25)" />
      <text :x="px + 14" :y="(publish.y + publish.h + ZB) / 2" class="note hot halo pop" :data-off="off(played(2))" :style="d(1.1)">NPM_TOKEN</text>
      <g class="pop" :data-off="off(played(2))" :style="d(1.3)">
        <rect :x="hook.x" :y="hook.y" :width="hook.w" :height="hook.h" class="box dashed" />
        <text :x="hook.x + hook.w / 2" :y="hook.y + hook.h / 2 + 1" class="value" text-anchor="middle" dominant-baseline="middle">webhook.site</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.pwn-request {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the main repository tinted */
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

.box {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.dashed {
  stroke-dasharray: 8 6;
}

.cmd {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  fill: var(--hud-ink);
}

.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

/* labels crossing a border or a line stay readable */
.halo {
  stroke: var(--hud-surface);
  stroke-width: 6px;
  paint-order: stroke;
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
  font-size: 24px;
  fill: var(--hud-ink);
}

.hot,
.note.hot,
.label.hot {
  fill: var(--hud-accent);
}

.value.hot {
  font-weight: 600;
}

/* steps: lines draw themselves, the rest fades in after them (--d); going back hides them at once;
   with the chain, pull_request steps back */
.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.5s ease-in-out var(--d, 0s);
}

.draw[data-off] {
  stroke-dashoffset: 1;
  transition: none;
}

/* the mask of the dashed line: a solid stroke, wide enough to cover the dashes and their corners */
.reveal {
  stroke: white;
  stroke-width: 12;
}

.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}

.dim {
  transition: opacity 0.4s;
}

.dim[data-dim] {
  opacity: 0.3;
}
</style>
