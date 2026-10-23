<script setup lang="ts">
// The last step of the nx attack: the publish workflow of the main repository, run on the attacker's commit.
// Two areas, as in <StaleBranch>: the main repository on top (the pull_request_target run of the PR, its
// write token, the secrets), the attacker below (the commit of the fork that changes the publish script):
// - click 1: the PR title is executed, and with the run's token it pushes a branch with the fork's commit;
// - click 2: with the same token, it triggers publish.yml in the repository;
// - click 3: that run takes its code from the pushed branch, and the npm token from the repository's secrets;
// - click 4: the modified script sends the npm token to the attacker.
// Steps count from the click that opened its window in the case layout (`clicks: [4]` on that modus row),
// or from `at`. <ForkPublish />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  repo?: string
  commit?: string
}>(), { repo: 'nrwl/nx', commit: '3905475' })

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const pushed = computed(() => step.value >= 1)
const triggered = computed(() => step.value >= 2)
const loaded = computed(() => step.value >= 3)
const sent = computed(() => step.value >= 4)

// areas: the main repository on top, the attacker below
const repoArea = { x: 20, y: 20, w: 1360, h: 420, label: `dépôt ${props.repo}` }
const attacker = { x: 20, y: 480, w: 1360, h: 180, label: 'attaquant' }

// cards: header bar, then rows (label, value)
const HB = 44
const target = { x: 60, y: 80, w: 420, h: 170, title: 'on: pull_request_target' }
const secrets = { x: 980, y: 80, w: 360, h: 120, title: 'secrets' }
const publish = { x: 600, y: 260, w: 340, h: 160, title: 'publish.yml' }
const branch = { x: 60, y: 306, w: 420, h: 104, title: 'nouvelle branche' }
const fork = { x: 60, y: 530, w: 420, h: 100, title: `commit ${props.commit}` }
const hook = { x: 1120, y: 540, w: 220, h: 70 }
const row = (c: { y: number }, i: number) => c.y + HB + 36 + i * 46

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const left = (x: number, y: number) => `${x},${y} ${x + 18},${y - 10} ${x + 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// click 1: the executed title pushes a branch, on the fork's commit
const TY = row(target, 1)
const bx = branch.x + branch.w / 2
// click 2: from the executed title to the publish run, with the token
const PY = row(publish, 0)
const trigger = `M${target.x + target.w} ${TY}H540V${PY}H${publish.x - 16}`
// click 3: the code from the branch, the npm token from the secrets
const EY = row(publish, 1)
const sx = secrets.x + secrets.w / 2
const fromSecrets = `M${sx} ${secrets.y + secrets.h}V${PY}H${publish.x + publish.w + 16}`
// click 4: out to the attacker
const hx = hook.x + hook.w / 2
const out = `M${publish.x + publish.w} ${EY}H${hx}V${hook.y - 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 680" class="fork-publish" fill="none">
    <!-- the two areas -->
    <g v-for="a in [repoArea, attacker]" :key="a.label">
      <rect :x="a.x" :y="a.y" :width="a.w" :height="a.h" class="area" :class="{ inside: a === repoArea }" />
      <text :x="a.x + 20" :y="a.y + 34" class="area-label">{{ a.label }}</text>
    </g>

    <!-- the pull_request_target run of the PR, with a write token -->
    <rect :x="target.x - 1.5" :y="target.y - 1.5" :width="target.w + 3" :height="target.h + 3" class="card" />
    <rect :x="target.x - 1.5" :y="target.y - 1.5" :width="target.w + 3" :height="HB + 1.5" class="bar" />
    <text :x="target.x + 20" :y="target.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ target.title }}</text>
    <text :x="target.x + 20" :y="row(target, 0)" class="label" dominant-baseline="middle">token</text>
    <text :x="target.x + 150" :y="row(target, 0)" class="value hot" dominant-baseline="middle">lecture + écriture</text>
    <g class="pop" :data-off="off(pushed)">
      <text :x="target.x + 20" :y="TY" class="label hot" dominant-baseline="middle">exécute</text>
      <text :x="target.x + 150" :y="TY" class="value hot" dominant-baseline="middle">le titre de la PR</text>
    </g>
    <rect :x="target.x" :y="target.y" :width="target.w" :height="target.h" class="outline" />

    <!-- the repository's secrets -->
    <rect :x="secrets.x - 1.5" :y="secrets.y - 1.5" :width="secrets.w + 3" :height="secrets.h + 3" class="card" />
    <rect :x="secrets.x - 1.5" :y="secrets.y - 1.5" :width="secrets.w + 3" :height="HB + 1.5" class="bar" />
    <text :x="secrets.x + 20" :y="secrets.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ secrets.title }}</text>
    <text :x="secrets.x + 20" :y="row(secrets, 0)" class="value" dominant-baseline="middle">NPM_TOKEN</text>
    <rect :x="secrets.x" :y="secrets.y" :width="secrets.w" :height="secrets.h" class="outline" />

    <!-- the attacker's commit, in the fork: it changes the script that publish.yml runs -->
    <rect :x="fork.x - 1.5" :y="fork.y - 1.5" :width="fork.w + 3" :height="fork.h + 3" class="card" />
    <rect :x="fork.x - 1.5" :y="fork.y - 1.5" :width="fork.w + 3" :height="HB + 1.5" class="bar" />
    <text :x="fork.x + 20" :y="fork.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ fork.title }}</text>
    <text :x="fork.x + 20" :y="fork.y + HB + 30" class="value" dominant-baseline="middle">publish-resolve-data.js</text>
    <rect :x="fork.x" :y="fork.y" :width="fork.w" :height="fork.h" class="outline" />

    <!-- click 1: with the token, the executed title pushes a branch in the repository, on the fork's commit -->
    <path :d="`M${bx} ${target.y + target.h}V${branch.y - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(pushed)" :style="d(0.3)" />
    <polygon :points="down(bx, branch.y - 2)" class="accent pop" :data-off="off(pushed)" :style="d(0.75)" />
    <text :x="bx + 14" :y="(target.y + target.h + branch.y) / 2 + 7" class="note hot pop" :data-off="off(pushed)" :style="d(0.5)">pousse avec le token</text>
    <path :d="`M${bx} ${fork.y}V${branch.y + branch.h + 16}`" pathLength="1" class="line draw" :data-off="off(pushed)" :style="d(0.3)" />
    <polygon :points="up(bx, branch.y + branch.h + 2)" class="ink pop" :data-off="off(pushed)" :style="d(0.75)" />
    <text :x="bx + 14" :y="(repoArea.y + repoArea.h + attacker.y) / 2 + 7" class="note pop" :data-off="off(pushed)" :style="d(0.5)">commit du fork</text>
    <g class="pop" :data-off="off(pushed)" :style="d(0.8)">
      <rect :x="branch.x - 1.5" :y="branch.y - 1.5" :width="branch.w + 3" :height="branch.h + 3" class="card" />
      <rect :x="branch.x - 1.5" :y="branch.y - 1.5" :width="branch.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="branch.x + 20" :y="branch.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ branch.title }}</text>
      <text :x="branch.x + 20" :y="EY" class="label" dominant-baseline="middle">commit</text>
      <text :x="branch.x + 150" :y="EY" class="value hot" dominant-baseline="middle">{{ commit }}</text>
      <rect :x="branch.x" :y="branch.y" :width="branch.w" :height="branch.h" class="outline" />
    </g>

    <!-- click 2: with the token, the executed title triggers publish.yml in the repository -->
    <path :d="trigger" pathLength="1" class="line hot-line draw" :data-off="off(triggered)" :style="d(0.3)" />
    <polygon :points="right(publish.x - 2, PY)" class="accent pop" :data-off="off(triggered)" :style="d(0.75)" />
    <text x="556" :y="TY + 32" class="note hot pop" :data-off="off(triggered)" :style="d(0.5)">déclenche avec le token</text>
    <g class="pop" :data-off="off(triggered)" :style="d(0.8)">
      <rect :x="publish.x - 1.5" :y="publish.y - 1.5" :width="publish.w + 3" :height="publish.h + 3" class="card" />
      <rect :x="publish.x - 1.5" :y="publish.y - 1.5" :width="publish.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="publish.x + 20" :y="publish.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ publish.title }}</text>
      <rect :x="publish.x" :y="publish.y" :width="publish.w" :height="publish.h" class="outline" :class="{ 'hot-outline': loaded }" />
    </g>

    <!-- click 3: the run takes the branch's code and the repository's npm token -->
    <path :d="`M${branch.x + branch.w} ${EY}H${publish.x - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(loaded)" />
    <polygon :points="right(publish.x - 2, EY)" class="accent pop" :data-off="off(loaded)" :style="d(0.45)" />
    <path :d="fromSecrets" pathLength="1" class="line draw" :data-off="off(loaded)" :style="d(0.3)" />
    <polygon :points="left(publish.x + publish.w + 2, PY)" class="ink pop" :data-off="off(loaded)" :style="d(0.75)" />
    <g class="pop" :data-off="off(loaded)" :style="d(0.8)">
      <text :x="publish.x + 20" :y="PY" class="label" dominant-baseline="middle">secrets</text>
      <text :x="publish.x + 130" :y="PY" class="value" dominant-baseline="middle">NPM_TOKEN</text>
      <text :x="publish.x + 20" :y="EY" class="label hot" dominant-baseline="middle">code</text>
      <text :x="publish.x + 130" :y="EY" class="value hot" dominant-baseline="middle">commit {{ commit }}</text>
    </g>

    <!-- click 4: the modified script sends the npm token out -->
    <path :d="out" pathLength="1" class="line hot-line draw" :data-off="off(sent)" />
    <polygon :points="down(hx, hook.y - 2)" class="accent pop" :data-off="off(sent)" :style="d(0.45)" />
    <text :x="hx + 14" :y="(repoArea.y + repoArea.h + attacker.y) / 2 + 7" class="note hot pop" :data-off="off(sent)" :style="d(0.3)">NPM_TOKEN</text>
    <g class="pop" :data-off="off(sent)" :style="d(0.5)">
      <rect :x="hook.x" :y="hook.y" :width="hook.w" :height="hook.h" class="box dashed" />
      <text :x="hx" :y="hook.y + hook.h / 2 + 1" class="value" text-anchor="middle" dominant-baseline="middle">webhook.site</text>
    </g>
  </svg>
</template>

<style scoped>
.fork-publish {
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
  transition: stroke 0.3s;
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
