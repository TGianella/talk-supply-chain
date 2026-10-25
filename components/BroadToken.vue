<script setup lang="ts">
// The entry point of Shai-Hulud: the npm token left in the secrets of angulartics2 was a token of the maintainer's
// account, not of the package. Two areas, as in <ForkPublish>: the repository on the left, npm on the right:
// - at the opening: the two areas, empty;
// - click 1: nothing changes (room for a nested <WindowStep :at="[1, 2]">, the maintainer asking to be made owner);
// - click 2: the token in the secrets of the repository, then angulartics2 as its arrow reaches it;
// - click 3: the other packages of the account, which the same token publishes too.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <BroadToken />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  repo?: string
  account?: string
  packages?: string[]
  more?: number
}>(), {
  repo: 'angulartics2',
  account: 'scttcper',
  packages: () => ['angulartics2', '@ctrl/tinycolor', '@ctrl/deluge', '@ctrl/transmission', '@ctrl/qbittorrent', 'ngx-color'],
  more: 14,
})

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const stored = computed(() => step.value >= 2)
const all = computed(() => step.value >= 3)

// areas: the repository on the left, the account on npm on the right
const repoArea = { x: 20, y: 20, w: 480, h: 400, label: `dépôt ${props.repo}` }
const npmArea = { x: 650, y: 20, w: 730, h: 400, label: 'registre npm' }

// the token: header bar, then rows (label, value)
const HB = 44
const token = { x: 60, y: 130, w: 400, h: 200, title: 'secret NPM_TOKEN' }
const row = (i: number) => token.y + HB + 36 + i * 46

// the packages, in two columns, then the count of the others
const chip = { w: 320, h: 56 }
const chips = computed(() => [...props.packages, `+ ${props.more} autres`].map((name, i) => ({
  name,
  x: 690 + (i % 2) * 340,
  y: 76 + Math.floor(i / 2) * 76,
  other: i === props.packages.length,
})))

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`

// click 2: the token publishes angulartics2, the first package
const first = computed(() => chips.value[0])
const FY = computed(() => first.value.y + chip.h / 2)
const toFirst = computed(() => `M${token.x + token.w} ${row(1)}H560V${FY.value}H${first.value.x - 16}`)
// click 3: the same token reaches the whole account
const AY = row(2)

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 440" class="broad-token" fill="none">
    <!-- the two areas; the account turns hot once the token reaches all of it -->
    <rect :x="repoArea.x" :y="repoArea.y" :width="repoArea.w" :height="repoArea.h" class="area inside" />
    <text :x="repoArea.x + 20" :y="repoArea.y + 34" class="area-label">{{ repoArea.label }}</text>
    <rect :x="npmArea.x" :y="npmArea.y" :width="npmArea.w" :height="npmArea.h" class="area" :data-hot="all ? '' : undefined" />
    <text :x="npmArea.x + 20" :y="npmArea.y + 34" class="area-label">{{ npmArea.label }}</text>

    <!-- click 2: the token, stored in the secrets of the repository -->
    <g class="pop" :data-off="off(stored)">
      <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="token.h + 3" class="card" />
      <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="token.x + 20" :y="token.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ token.title }}</text>
      <text :x="token.x + 20" :y="row(0)" class="label" dominant-baseline="middle">compte</text>
      <text :x="token.x + 150" :y="row(0)" class="value" dominant-baseline="middle">{{ account }}</text>
      <text :x="token.x + 20" :y="row(1)" class="label" dominant-baseline="middle">type</text>
      <text :x="token.x + 150" :y="row(1)" class="value hot" dominant-baseline="middle">classique</text>
      <g class="pop" :data-off="off(all)">
        <text :x="token.x + 20" :y="AY" class="label hot" dominant-baseline="middle">publie</text>
        <text :x="token.x + 150" :y="AY" class="value hot" dominant-baseline="middle">tous ses paquets</text>
      </g>
      <rect :x="token.x" :y="token.y" :width="token.w" :height="token.h" class="outline" />
    </g>

    <!-- the packages of the account: angulartics2 at click 2, when the arrow reaches it, the others at click 3 -->
    <g
      v-for="(c, i) in chips"
      :key="c.name"
      class="pop"
      :data-off="off(i ? all : stored)"
      :data-hot="all ? '' : undefined"
      :style="d(i ? 0.45 + i * 0.08 : 0.8)"
    >
      <rect :x="c.x" :y="c.y" :width="chip.w" :height="chip.h" class="chip" :class="{ dashed: c.other }" />
      <text :x="c.x + 20" :y="c.y + chip.h / 2 + 1" class="value" :class="{ muted: c.other }" dominant-baseline="middle">{{ c.name }}</text>
    </g>

    <!-- click 2: what the token was there for, publishing angulartics2 -->
    <path :d="toFirst" pathLength="1" class="line draw" :data-off="off(stored)" :style="d(0.3)" />
    <polygon :points="right(first.x - 2, FY)" class="ink pop" :data-off="off(stored)" :style="d(0.75)" />
    <text x="572" :y="(row(1) + FY) / 2 + 7" class="note pop" :data-off="off(stored)" :style="d(0.5)">publie</text>

    <!-- click 3: the same token publishes the whole account -->
    <path :d="`M${token.x + token.w} ${AY}H${npmArea.x - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(all)" />
    <polygon :points="right(npmArea.x - 2, AY)" class="accent pop" :data-off="off(all)" :style="d(0.45)" />
    <text x="515" :y="AY + 36" class="note hot pop" :data-off="off(all)" :style="d(0.3)">même token</text>
  </svg>
</template>

<style scoped>
.broad-token {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the repository tinted, the account hot once reached */
.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
  transition: stroke 0.3s ease 0.45s;
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

/* fills (card, header bar) reach under the whole stroke of the outline drawn over them, so that no
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

.bar-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.04em;
  fill: var(--hud-surface);
}

/* packages: ink outline, hot once the token reaches them */
.chip {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 3;
  transition: stroke 0.3s ease 0.45s, fill 0.3s ease 0.45s;
}

[data-hot] > .chip {
  stroke: var(--hud-accent);
  fill: var(--hud-accent-tint);
}

.dashed {
  stroke-dasharray: 8 6;
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

.value.muted {
  fill: var(--hud-muted);
}

.hot,
.note.hot,
.label.hot {
  fill: var(--hud-accent);
}

.value.hot {
  font-weight: 600;
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
