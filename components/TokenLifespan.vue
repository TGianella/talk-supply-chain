<script setup lang="ts">
// How npm restricted its publishing tokens, as their lifespan on a common axis (0 → 1 an → ∞):
// - at the opening: the classic token, without expiry;
// - click 1: the granular token with write access, 7 days by default, 90 days at most;
// - click 2: the classic tokens revoked;
// - click 3: trusted publishing, a token minted by the CI for one job, nothing stored.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <TokenLifespan />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const granular = computed(() => step.value >= 1)
const revoked = computed(() => step.value >= 2)
const oidc = computed(() => step.value >= 3)

// the axis: days to x, one year at YEAR_X, then a break up to the arrow of the classic token
const X0 = 420
const YEAR_X = 1160
const END_X = 1360
const x = (days: number) => X0 + (YEAR_X - X0) * days / 365
const AXIS_Y = 470
// no tick at 0, too close to 7 days: the axis starts right after its title
const ticks = [
  { label: '7 j', x: x(7) },
  { label: '90 j', x: x(90) },
  { label: '1 an', x: YEAR_X },
  { label: '∞', x: END_X },
]

// one row per kind of token: its name on the left, its lifespan as a bar
const BAR = 32
const rows = [
  { y: 70, name: 'Token classique', note: 'tous les droits du compte' },
  { y: 210, name: 'Token granulaire', note: 'écriture, par paquet' },
  { y: 350, name: 'Trusted publishing', note: 'OIDC, depuis la CI' },
]
const barY = (r: { y: number }) => r.y + 8

const right = (px: number, py: number) => `${px},${py} ${px - 20},${py - 14} ${px - 20},${py + 14}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 540" class="token-lifespan" fill="none">
    <!-- the axis, with a break between one year and infinity -->
    <path :d="`M${X0} ${AXIS_Y}H${YEAR_X + 40}M${YEAR_X + 70} ${AXIS_Y}H${END_X}`" class="axis" />
    <path :d="`M${YEAR_X + 34} ${AXIS_Y + 12}l12 -24M${YEAR_X + 64} ${AXIS_Y + 12}l12 -24`" class="axis" />
    <g v-for="t in ticks" :key="t.label">
      <path :d="`M${t.x} ${AXIS_Y}v12`" class="axis" />
      <text :x="t.x" :y="AXIS_Y + 44" class="tick" text-anchor="middle">{{ t.label }}</text>
    </g>
    <text :x="X0 - 40" :y="AXIS_Y + 44" class="tick" text-anchor="end">durée de vie</text>

    <!-- the classic token: no expiry, revoked at click 2 -->
    <g :data-revoked="revoked ? '' : undefined" class="classic">
      <text :x="20" :y="rows[0].y + 20" class="name">{{ rows[0].name }}</text>
      <text :x="20" :y="rows[0].y + 56" class="note">{{ rows[0].note }}</text>
      <rect :x="X0" :y="barY(rows[0])" :width="END_X - 20 - X0" :height="BAR" class="bar" />
      <polygon :points="right(END_X + 4, barY(rows[0]) + BAR / 2)" class="bar" />
      <text :x="END_X" :y="barY(rows[0]) - 14" class="value" text-anchor="end">sans expiration</text>
    </g>
    <g class="pop" :data-off="off(revoked)" :style="d(0.3)">
      <path :d="`M${X0 - 10} ${barY(rows[0]) + BAR / 2}H${END_X + 10}`" class="strike" />
      <text :x="(X0 + END_X) / 2" :y="barY(rows[0]) + BAR + 40" class="stamp" text-anchor="middle">révoqués · déc. 2025</text>
    </g>

    <!-- click 1: the granular token, 7 days by default, 90 at most -->
    <g class="pop" :data-off="off(granular)">
      <text :x="20" :y="rows[1].y + 20" class="name">{{ rows[1].name }}</text>
      <text :x="20" :y="rows[1].y + 56" class="note">{{ rows[1].note }}</text>
      <rect :x="X0" :y="barY(rows[1])" :width="x(90) - X0" :height="BAR" class="bar max" />
      <rect :x="X0" :y="barY(rows[1])" :width="x(7) - X0" :height="BAR" class="bar" />
      <text :x="x(90)" :y="barY(rows[1]) - 14" class="value" text-anchor="end">90 j max</text>
      <text :x="x(90) + 24" :y="barY(rows[1]) + BAR / 2 + 1" class="value muted" dominant-baseline="middle">7 j par défaut</text>
    </g>

    <!-- click 3: trusted publishing, a token for one job -->
    <g class="pop" :data-off="off(oidc)">
      <text :x="20" :y="rows[2].y + 20" class="name hot">{{ rows[2].name }}</text>
      <text :x="20" :y="rows[2].y + 56" class="note">{{ rows[2].note }}</text>
      <rect :x="X0" :y="barY(rows[2])" width="8" :height="BAR" class="bar hot-bar" />
      <text :x="X0 + 32" :y="barY(rows[2]) + BAR / 2 + 1" class="value hot" dominant-baseline="middle">le temps d’un job, aucun secret stocké</text>
    </g>
  </svg>
</template>

<style scoped>
.token-lifespan {
  display: block;
  width: 1400px;
  padding: 32px 40px 24px;
  overflow: visible;
}

.axis {
  stroke: var(--hud-muted);
  stroke-width: 2;
}

.tick {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 34px;
  fill: var(--hud-ink);
}

.note {
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

.value.muted {
  fill: var(--hud-muted);
}

.bar {
  fill: var(--hud-ink);
}

/* the span a granular token may have, up to its maximum */
.bar.max {
  fill: var(--hud-faint);
}

.hot,
.value.hot {
  fill: var(--hud-accent);
}

.value.hot {
  font-weight: 600;
}

.hot-bar {
  fill: var(--hud-accent);
}

/* revoked: the classic token fades under its strike */
.classic > * {
  transition: opacity 0.3s ease;
}

.classic[data-revoked] > * {
  opacity: 0.35;
}

.strike {
  stroke: var(--hud-accent);
  stroke-width: 4;
}

.stamp {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-accent);
}

/* steps fade in (--d orders what a step shows); going back hides them at once */
.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
