<script setup lang="ts">
// The cache poisoning of the TanStack compromise (postmortem, tanstack.com/blog/npm-supply-chain-compromise-postmortem).
// The GitHub Actions cache of the repository in the middle, shared by the runs of a pull request (pull_request_target)
// and those of main; the PR run on the left, the release run on the right:
// - at the opening: the release workflow restores the pnpm store from the cache, under a key computed from the lockfile;
// - click 1: a PR run, read-only, builds the PR's code, which writes into the pnpm store;
// - click 2: at the end of the job, the cache action saves that store under the same key: the token it uses is not
//   restricted by `permissions`;
// - click 3: the release workflow restores the poisoned store; the code in it reads the OIDC token from the runner's
//   memory and exchanges it with Sigstore's certificate authority for a certificate issued to the identity of the
//   release workflow;
// - click 4: the release run publishes to npm, with a provenance signed with that certificate, and valid.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <CachePoison />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const built = computed(() => step.value >= 1)
const saved = computed(() => step.value >= 2)
const restored = computed(() => step.value >= 3)
const published = computed(() => step.value >= 4)

// cards: header bar, then rows every RS, a label then a value; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const VX = 150 // offset of the values
const h = (n: number) => HB + 18 + n * RS
const pr = { x: 30, y: 30, w: 360, h: h(3), title: 'bundle-size.yml · PR' }
const cache = { x: 520, y: 30, w: 360, h: h(4), title: 'cache Actions' }
const release = { x: 1010, y: 30, w: 360, h: h(4), title: 'release.yml · main' }
// the cache key of the attack (postmortem), shortened: the hash only depends on pnpm-lock.yaml
const KEY = 'Linux-pnpm-store-6f92…'
const payload = { x: 30, y: 400, w: 360, h: h(1), title: 'vite_setup.mjs' }
const ca = { x: 1070, y: 370, w: 300, h: h(2), title: 'Sigstore (Fulcio)' }
const npm = { x: 520, y: 560, w: 360, h: h(2), title: 'registry.npmjs.org' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2
const cx = (c: { x: number, w: number }) => c.x + c.w / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`
const left = (x: number, y: number) => `${x},${y} ${x + 18},${y - 10} ${x + 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`

// at the opening: the release run restores the store from the cache
const toRelease = `M${cache.x + cache.w} ${cy(cache)}H${release.x - 16}`
// click 1: the PR run builds the PR's code
const toPayload = `M${cx(pr)} ${pr.y + pr.h}V${payload.y - 16}`
// click 2: the store, written by the payload, saved into the cache under the key of main
// it goes up right of the middle of the cache, to leave room for its labels
const SX = cx(cache) + 60
const toCache = `M${payload.x + payload.w} ${cy(payload)}H${SX}V${cache.y + cache.h + 16}`
// click 3: the OIDC token down to the certificate authority, the certificate back up to the release run
const TX = ca.x + 40
const CX = ca.x + ca.w - 40
const toCa = `M${TX} ${release.y + release.h}V${ca.y - 16}`
const toRelease2 = `M${CX} ${ca.y}V${release.y + release.h + 16}`
// click 4: the release run publishes to npm, down past the certificate authority, then left
const PX = release.x + 20
const toNpm = `M${PX} ${release.y + release.h}V${cy(npm)}H${npm.x + npm.w + 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 720" class="cache-poison" fill="none">
    <!-- the cache of the repository, and the release run that restores from it -->
    <g v-for="c in [cache, release]" :key="c.title">
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="c.h + 3" class="card" />
      <rect :x="c.x - 1.5" :y="c.y - 1.5" :width="c.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
    </g>
    <!-- the key, on a row of its own, then what its hash is computed from -->
    <text :x="cache.x + 20" :y="ry(cache, 0)" class="value" dominant-baseline="middle">{{ KEY }}</text>
    <text :x="cache.x + 20" :y="ry(cache, 1)" class="label" dominant-baseline="middle">6f92… = hash de pnpm-lock.yaml</text>
    <text :x="cache.x + 20" :y="ry(cache, 2)" class="label" dominant-baseline="middle">portée</text>
    <text :x="cache.x + VX" :y="ry(cache, 2)" class="value" dominant-baseline="middle">tout le dépôt</text>
    <text :x="cache.x + 20" :y="ry(cache, 3)" class="label" dominant-baseline="middle">contenu</text>
    <text :x="cache.x + VX" :y="ry(cache, 3)" class="value pop" :data-off="saved ? '' : undefined" dominant-baseline="middle">store pnpm</text>
    <text :x="cache.x + VX" :y="ry(cache, 3)" class="value hot pop" :data-off="off(saved)" :style="d(0.6)" dominant-baseline="middle">store piégé</text>

    <text :x="release.x + 20" :y="ry(release, 0)" class="label" dominant-baseline="middle">clé</text>
    <text :x="release.x + VX" :y="ry(release, 0)" class="value" dominant-baseline="middle">…-store-6f92…</text>
    <text :x="release.x + 20" :y="ry(release, 1)" class="label" dominant-baseline="middle">id-token</text>
    <text :x="release.x + VX" :y="ry(release, 1)" class="value" dominant-baseline="middle">write</text>
    <text :x="release.x + 20" :y="ry(release, 2)" class="label" dominant-baseline="middle">publie</text>
    <text :x="release.x + VX" :y="ry(release, 2)" class="value" dominant-baseline="middle">via OIDC</text>
    <text :x="release.x + 20" :y="ry(release, 3)" class="label" dominant-baseline="middle">store</text>
    <text :x="release.x + VX" :y="ry(release, 3)" class="value pop" :data-off="restored ? '' : undefined" dominant-baseline="middle">restauré</text>
    <text :x="release.x + VX" :y="ry(release, 3)" class="value hot pop" :data-off="off(restored)" :style="d(0.6)" dominant-baseline="middle">code piégé</text>
    <rect v-for="c in [cache, release]" :key="`o${c.title}`" :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" />

    <path :d="toRelease" class="line" />
    <path :d="toRelease" pathLength="1" class="line hot-line draw" :data-off="off(restored)" />
    <polygon :points="right(release.x - 2, cy(cache))" class="ink" />
    <polygon :points="right(release.x - 2, cy(cache))" class="accent pop" :data-off="off(restored)" :style="d(0.35)" />
    <text :x="(cache.x + cache.w + release.x) / 2" :y="cy(cache) - 14" class="note" text-anchor="middle">restaure</text>

    <!-- click 1: a PR run, read-only, builds the PR's code -->
    <g class="pop" :data-off="off(built)">
      <rect :x="pr.x - 1.5" :y="pr.y - 1.5" :width="pr.w + 3" :height="pr.h + 3" class="card" />
      <rect :x="pr.x - 1.5" :y="pr.y - 1.5" :width="pr.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="pr.x + 20" :y="pr.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ pr.title }}</text>
      <text :x="pr.x + 20" :y="ry(pr, 0)" class="label" dominant-baseline="middle">déclencheur</text>
      <text :x="pr.x + VX + 14" :y="ry(pr, 0)" class="value" dominant-baseline="middle">PR d’un fork</text>
      <text :x="pr.x + 20" :y="ry(pr, 1)" class="label" dominant-baseline="middle">droits</text>
      <text :x="pr.x + VX + 14" :y="ry(pr, 1)" class="value" dominant-baseline="middle">lecture seule</text>
      <text :x="pr.x + 20" :y="ry(pr, 2)" class="label" dominant-baseline="middle">build</text>
      <text :x="pr.x + VX + 14" :y="ry(pr, 2)" class="value" dominant-baseline="middle">code de la PR</text>
      <rect :x="pr.x" :y="pr.y" :width="pr.w" :height="pr.h" class="outline" />
    </g>
    <path :d="toPayload" pathLength="1" class="line draw" :data-off="off(built)" :style="d(0.3)" />
    <polygon :points="down(cx(pr), payload.y - 2)" class="ink pop" :data-off="off(built)" :style="d(0.65)" />
    <text :x="cx(pr) + 14" :y="(pr.y + pr.h + payload.y) / 2 + 6" class="note pop" :data-off="off(built)" :style="d(0.45)">exécute</text>
    <g class="pop" :data-off="off(built)" :style="d(0.7)">
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="payload.h + 3" class="card" />
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="payload.x + 20" :y="payload.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ payload.title }}</text>
      <text :x="payload.x + 20" :y="ry(payload, 0)" class="value" dominant-baseline="middle">écrit dans le store pnpm</text>
      <rect :x="payload.x" :y="payload.y" :width="payload.w" :height="payload.h" class="outline hot-outline" />
    </g>

    <!-- click 2: the cache action saves the poisoned store under the key of main -->
    <path :d="toCache" pathLength="1" class="line hot-line draw" :data-off="off(saved)" :style="d(0.1)" />
    <polygon :points="up(SX, cache.y + cache.h + 2)" class="accent pop" :data-off="off(saved)" :style="d(0.5)" />
    <text :x="(payload.x + payload.w + SX) / 2" :y="cy(payload) - 14" class="note hot pop" :data-off="off(saved)" :style="d(0.3)" text-anchor="middle">sauvegardé en fin de job</text>
    <text :x="(payload.x + payload.w + SX) / 2" :y="cy(payload) + 34" class="note pop" :data-off="off(saved)" :style="d(0.3)" text-anchor="middle">même clé : …-store-6f92…</text>

    <!-- click 3: the release run restores it, reads the OIDC token in memory and exchanges it for a certificate -->
    <path :d="toCa" pathLength="1" class="line hot-line draw" :data-off="off(restored)" :style="d(0.8)" />
    <polygon :points="down(TX, ca.y - 2)" class="accent pop" :data-off="off(restored)" :style="d(1.15)" />
    <text :x="TX + 14" :y="release.y + release.h + 50" class="note hot pop" :data-off="off(restored)" :style="d(0.95)">token OIDC</text>
    <text :x="TX + 14" :y="release.y + release.h + 76" class="note hot pop" :data-off="off(restored)" :style="d(0.95)">lu en mémoire</text>
    <g class="pop" :data-off="off(restored)" :style="d(1.2)">
      <rect :x="ca.x - 1.5" :y="ca.y - 1.5" :width="ca.w + 3" :height="ca.h + 3" class="card" />
      <rect :x="ca.x - 1.5" :y="ca.y - 1.5" :width="ca.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="ca.x + 20" :y="ca.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ ca.title }}</text>
      <text :x="ca.x + 20" :y="ry(ca, 0)" class="value" dominant-baseline="middle">certificat pour</text>
      <text :x="ca.x + 20" :y="ry(ca, 1)" class="value hot" dominant-baseline="middle">release.yml · main</text>
      <rect :x="ca.x" :y="ca.y" :width="ca.w" :height="ca.h" class="outline" />
    </g>
    <path :d="toRelease2" pathLength="1" class="line hot-line draw" :data-off="off(restored)" :style="d(1.5)" />
    <polygon :points="up(CX, release.y + release.h + 2)" class="accent pop" :data-off="off(restored)" :style="d(1.85)" />
    <text :x="CX - 14" :y="ca.y - 24" class="note hot pop" :data-off="off(restored)" :style="d(1.65)" text-anchor="end">certificat</text>

    <!-- click 4: the release run publishes to npm, with a provenance signed with that certificate -->
    <path :d="toNpm" pathLength="1" class="line hot-line draw" :data-off="off(published)" />
    <polygon :points="left(npm.x + npm.w + 2, cy(npm))" class="accent pop" :data-off="off(published)" :style="d(0.35)" />
    <text :x="(npm.x + npm.w + PX) / 2" :y="cy(npm) - 14" class="note hot pop" :data-off="off(published)" :style="d(0.15)" text-anchor="middle">publie</text>
    <g class="pop" :data-off="off(published)" :style="d(0.4)">
      <rect :x="npm.x - 1.5" :y="npm.y - 1.5" :width="npm.w + 3" :height="npm.h + 3" class="card" />
      <rect :x="npm.x - 1.5" :y="npm.y - 1.5" :width="npm.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="npm.x + 20" :y="npm.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ npm.title }}</text>
      <text :x="npm.x + 20" :y="ry(npm, 0)" class="value hot" dominant-baseline="middle">84 versions piégées</text>
      <text :x="npm.x + 20" :y="ry(npm, 1)" class="value" dominant-baseline="middle">provenance valide</text>
      <rect :x="npm.x" :y="npm.y" :width="npm.w" :height="npm.h" class="outline hot-outline" />
    </g>
  </svg>
</template>

<style scoped>
.cache-poison {
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
