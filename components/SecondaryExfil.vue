<script setup lang="ts">
// The secondary exfiltration of Shai-Hulud 2.0: when the payload finds no GitHub token on the machine, it still
// exfiltrates by borrowing a token from an earlier victim. The machine on the left, GitHub on the right:
// - at the opening: the payload holds secrets but has no GitHub token to publish them;
// - click 1: it searches GitHub for the repositories whose description is the beacon "Sha1-Hulud: The Second Coming.",
//   the repositories left by earlier victims;
// - click 2: it takes a GitHub token out of one of those repositories, back to the machine;
// - click 3: with that token it creates a new repository on that victim's account and pushes this machine's secrets.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <SecondaryExfil />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const found = computed(() => step.value >= 1)
const grabbed = computed(() => step.value >= 2)
const pushed = computed(() => step.value >= 3)

// areas: the infected machine on the left, GitHub on the right
const machine = { x: 20, y: 20, w: 500, h: 550, label: 'machine infectée' }
const github = { x: 720, y: 20, w: 660, h: 550, label: 'github.com' }

// cards: header bar, then rows every RS; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const h = (n: number) => HB + 18 + n * RS
const payload = { x: 60, y: 70, w: 420, h: h(1), title: 'bun_environment.js' }
const token = { x: 60, y: 330, w: 420, h: h(1), title: 'token GitHub' }
const victims = { x: 760, y: 70, w: 580, h: h(2), title: 'dépôts d’autres victimes' }
const repo = { x: 760, y: 330, w: 580, h: h(2), title: 'nouveau dépôt chez la victime' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// click 1: the payload searches GitHub, horizontal to the list of victims' repositories
const toVictims = `M${payload.x + payload.w} ${cy(payload)}H${victims.x - 16}`
// click 2: down from those repositories, across the gap between the rows, then down into the token card, so that
// it stays clear of the click 3 line at the height of the token card
const tx = victims.x + 120
const gy = (victims.y + victims.h + token.y) / 2
const kx = token.x + token.w / 2
const toToken = `M${tx} ${victims.y + victims.h}V${gy}H${kx}V${token.y - 16}`
// click 3: with that token, the payload creates a repository and pushes this machine's secrets
const toRepo = `M${token.x + token.w} ${cy(token)}H${repo.x - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 590" class="secondary-exfil" fill="none">
    <!-- the two areas: the machine tinted -->
    <rect :x="machine.x" :y="machine.y" :width="machine.w" :height="machine.h" class="area inside" />
    <text :x="machine.x + 20" :y="machine.y + 34" class="area-label">{{ machine.label }}</text>
    <rect :x="github.x" :y="github.y" :width="github.w" :height="github.h" class="area" />
    <text :x="github.x + 20" :y="github.y + 34" class="area-label">{{ github.label }}</text>

    <!-- the payload, with secrets but no GitHub token on the machine -->
    <g>
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="payload.h + 3" class="card" />
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="payload.x + 20" :y="payload.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ payload.title }}</text>
      <text :x="payload.x + 20" :y="ry(payload, 0)" class="value" dominant-baseline="middle">des secrets, aucun token local</text>
      <rect :x="payload.x" :y="payload.y" :width="payload.w" :height="payload.h" class="outline" />
    </g>

    <!-- click 1: a search on GitHub returns the repositories left by earlier victims -->
    <path :d="toVictims" pathLength="1" class="line draw" :data-off="off(found)" :style="d(0.2)" />
    <polygon :points="right(victims.x - 2, cy(payload))" class="ink pop" :data-off="off(found)" :style="d(0.55)" />
    <text :x="(payload.x + payload.w + victims.x) / 2" :y="cy(payload) - 14" class="note pop" :data-off="off(found)" :style="d(0.35)" text-anchor="middle">cherche la description</text>
    <g class="pop" :data-off="off(found)" :style="d(0.6)">
      <rect :x="victims.x - 1.5" :y="victims.y - 1.5" :width="victims.w + 3" :height="victims.h + 3" class="card" />
      <rect :x="victims.x - 1.5" :y="victims.y - 1.5" :width="victims.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="victims.x + 20" :y="victims.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ victims.title }}</text>
      <text :x="victims.x + 20" :y="ry(victims, 0)" class="value" dominant-baseline="middle">description « Sha1-Hulud: The Second Coming. »</text>
      <text :x="victims.x + 20" :y="ry(victims, 1)" class="value" dominant-baseline="middle">contiennent un token GitHub</text>
      <rect :x="victims.x" :y="victims.y" :width="victims.w" :height="victims.h" class="outline" />
    </g>

    <!-- click 2: a token comes out of one of those repositories, back to the machine -->
    <path :d="toToken" pathLength="1" class="line draw" :data-off="off(grabbed)" :style="d(0.2)" />
    <polygon :points="down(kx, token.y - 2)" class="ink pop" :data-off="off(grabbed)" :style="d(0.55)" />
    <text :x="(tx + kx) / 2" :y="gy - 14" class="note pop" :data-off="off(grabbed)" :style="d(0.35)" text-anchor="middle">récupère un token</text>
    <g class="pop" :data-off="off(grabbed)" :style="d(0.6)">
      <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="token.h + 3" class="card" />
      <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="token.x + 20" :y="token.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ token.title }}</text>
      <text :x="token.x + 20" :y="ry(token, 0)" class="value" dominant-baseline="middle">emprunté à une victime</text>
      <rect :x="token.x" :y="token.y" :width="token.w" :height="token.h" class="outline" />
    </g>

    <!-- click 3: with that token, a new repository on the victim's account holds this machine's secrets -->
    <g class="pop" :data-off="off(pushed)" :style="d(0.2)">
      <rect :x="repo.x - 1.5" :y="repo.y - 1.5" :width="repo.w + 3" :height="repo.h + 3" class="card" />
      <rect :x="repo.x - 1.5" :y="repo.y - 1.5" :width="repo.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="repo.x + 20" :y="repo.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ repo.title }}</text>
      <text :x="repo.x + 20" :y="ry(repo, 0)" class="value" dominant-baseline="middle">créé avec le token emprunté</text>
      <text :x="repo.x + 20" :y="ry(repo, 1)" class="value hot" dominant-baseline="middle">secrets de cette machine</text>
      <rect :x="repo.x" :y="repo.y" :width="repo.w" :height="repo.h" class="outline hot-outline" />
    </g>
    <path :d="toRepo" pathLength="1" class="line hot-line draw" :data-off="off(pushed)" :style="d(0.5)" />
    <polygon :points="right(repo.x - 2, cy(token))" class="accent pop" :data-off="off(pushed)" :style="d(0.85)" />
    <!-- on two lines: in one, the label is wider than the gap between the cards -->
    <text :x="(token.x + token.w + repo.x) / 2" :y="cy(token) - 14" class="note hot pop" :data-off="off(pushed)" :style="d(0.65)" text-anchor="middle">
      <tspan :x="(token.x + token.w + repo.x) / 2" dy="-24">crée,</tspan>
      <tspan :x="(token.x + token.w + repo.x) / 2" dy="24">pousse les secrets</tspan>
    </text>
  </svg>
</template>

<style scoped>
.secondary-exfil {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the machine tinted */
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

/* arrow labels cross the dashed borders of the areas: a surface halo keeps them readable */
.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
  stroke: var(--hud-surface);
  stroke-width: 6px;
  paint-order: stroke;
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
