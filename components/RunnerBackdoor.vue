<script setup lang="ts">
// The persistence of Shai-Hulud 2.0: the infected machine becomes a self-hosted GitHub Actions runner of a repository
// created by the worm, and a workflow of that repository runs the body of any new discussion on it. The machine on the
// left, GitHub on the right:
// - at the opening: the payload on the machine, with a stolen GitHub token;
// - click 1: it creates a repository and installs a runner registered on it;
// - click 2: the workflow of the repository: on a discussion, run its body on the self-hosted runner;
// - click 3: a discussion triggers it, and the command runs on the machine.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <RunnerBackdoor />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const registered = computed(() => step.value >= 1)
const listening = computed(() => step.value >= 2)
const triggered = computed(() => step.value >= 3)

// areas: the infected machine on the left, GitHub on the right
const machine = { x: 20, y: 20, w: 500, h: 550, label: 'machine infectée' }
const github = { x: 720, y: 20, w: 660, h: 550, label: 'github.com' }

// cards: header bar, then rows every RS; h(n) fits n rows with the same margin above and below
const HB = 44
const RS = 34
const h = (n: number) => HB + 18 + n * RS
const payload = { x: 60, y: 84, w: 420, h: h(1), title: 'bun_environment.js' }
const runner = { x: 60, y: 240, w: 420, h: h(2), title: 'runner SHA1HULUD' }
const repo = { x: 760, y: 84, w: 580, h: h(1), title: 'dépôt créé par le ver' }
const workflow = { x: 760, y: 240, w: 580, h: h(3), title: '.github/workflows/discussion.yaml' }
const discussion = { x: 760, y: 454, w: 580, h: h(1), title: 'nouvelle discussion' }
const ry = (c: { y: number }, i: number) => c.y + HB + 26 + i * RS
const cy = (c: { y: number, h: number }) => c.y + c.h / 2

const right = (x: number, y: number) => `${x},${y} ${x - 18},${y - 10} ${x - 18},${y + 10}`
const left = (x: number, y: number) => `${x},${y} ${x + 18},${y - 10} ${x + 18},${y + 10}`
const up = (x: number, y: number) => `${x},${y} ${x - 10},${y + 18} ${x + 10},${y + 18}`
const down = (x: number, y: number) => `${x},${y} ${x - 10},${y - 18} ${x + 10},${y - 18}`

// click 1: the payload creates the repository, then installs the runner
const toRepo = `M${payload.x + payload.w} ${cy(payload)}H${repo.x - 16}`
const rx = payload.x + payload.w / 2
const toRunner = `M${rx} ${payload.y + payload.h}V${runner.y - 16}`
// click 3: the discussion triggers the workflow, whose job runs on the runner
const dx = workflow.x + 120
const toWorkflow = `M${dx} ${discussion.y}V${workflow.y + workflow.h + 16}`
const toMachine = `M${workflow.x} ${cy(runner)}H${runner.x + runner.w + 16}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 590" class="runner-backdoor" fill="none">
    <!-- the two areas: the machine tinted, hot once a command from GitHub runs on it -->
    <rect :x="machine.x" :y="machine.y" :width="machine.w" :height="machine.h" class="area inside" :data-hot="triggered ? '' : undefined" />
    <text :x="machine.x + 20" :y="machine.y + 34" class="area-label">{{ machine.label }}</text>
    <rect :x="github.x" :y="github.y" :width="github.w" :height="github.h" class="area" />
    <text :x="github.x + 20" :y="github.y + 34" class="area-label">{{ github.label }}</text>

    <!-- the payload, with a GitHub token found on the machine -->
    <g>
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="payload.h + 3" class="card" />
      <rect :x="payload.x - 1.5" :y="payload.y - 1.5" :width="payload.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="payload.x + 20" :y="payload.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ payload.title }}</text>
      <text :x="payload.x + 20" :y="ry(payload, 0)" class="value" dominant-baseline="middle">avec un token GitHub volé</text>
      <rect :x="payload.x" :y="payload.y" :width="payload.w" :height="payload.h" class="outline" />
    </g>

    <!-- click 1: a repository on GitHub, and a runner registered on it on the machine -->
    <path :d="toRepo" pathLength="1" class="line draw" :data-off="off(registered)" :style="d(0.2)" />
    <polygon :points="right(repo.x - 2, cy(repo))" class="ink pop" :data-off="off(registered)" :style="d(0.55)" />
    <text :x="(payload.x + payload.w + repo.x) / 2" :y="cy(payload) - 14" class="note pop" :data-off="off(registered)" :style="d(0.35)" text-anchor="middle">crée un dépôt</text>
    <g class="pop" :data-off="off(registered)" :style="d(0.6)">
      <rect :x="repo.x - 1.5" :y="repo.y - 1.5" :width="repo.w + 3" :height="repo.h + 3" class="card" />
      <rect :x="repo.x - 1.5" :y="repo.y - 1.5" :width="repo.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="repo.x + 20" :y="repo.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ repo.title }}</text>
      <text :x="repo.x + 20" :y="ry(repo, 0)" class="value" dominant-baseline="middle">« Sha1-Hulud: The Second Coming. »</text>
      <rect :x="repo.x" :y="repo.y" :width="repo.w" :height="repo.h" class="outline" />
    </g>
    <path :d="toRunner" pathLength="1" class="line hot-line draw" :data-off="off(registered)" :style="d(0.8)" />
    <polygon :points="down(rx, runner.y - 2)" class="accent pop" :data-off="off(registered)" :style="d(1.15)" />
    <text :x="rx + 16" :y="(payload.y + payload.h + runner.y) / 2 + 7" class="note hot pop" :data-off="off(registered)" :style="d(0.95)">installe</text>
    <g class="pop" :data-off="off(registered)" :style="d(1.2)">
      <rect :x="runner.x - 1.5" :y="runner.y - 1.5" :width="runner.w + 3" :height="runner.h + 3" class="card" />
      <rect :x="runner.x - 1.5" :y="runner.y - 1.5" :width="runner.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="runner.x + 20" :y="runner.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ runner.title }}</text>
      <text :x="runner.x + 20" :y="ry(runner, 0)" class="value" dominant-baseline="middle">enregistré sur le dépôt</text>
      <text :x="runner.x + 20" :y="ry(runner, 1)" class="value hot" dominant-baseline="middle">attend des jobs</text>
      <rect :x="runner.x" :y="runner.y" :width="runner.w" :height="runner.h" class="outline hot-outline" />
    </g>

    <!-- click 2: the workflow of the repository runs the body of a discussion on the runner -->
    <g class="pop" :data-off="off(listening)" :style="d(0.2)">
      <rect :x="workflow.x - 1.5" :y="workflow.y - 1.5" :width="workflow.w + 3" :height="workflow.h + 3" class="card" />
      <rect :x="workflow.x - 1.5" :y="workflow.y - 1.5" :width="workflow.w + 3" :height="HB + 1.5" class="bar" />
      <text :x="workflow.x + 20" :y="workflow.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ workflow.title }}</text>
      <text :x="workflow.x + 20" :y="ry(workflow, 0)" class="value" dominant-baseline="middle">on: discussion</text>
      <text :x="workflow.x + 20" :y="ry(workflow, 1)" class="value" dominant-baseline="middle">runs-on: self-hosted</text>
      <text :x="workflow.x + 20" :y="ry(workflow, 2)" class="value hot" dominant-baseline="middle">run: ${{ '{{' }} github.event.discussion.body }}</text>
      <rect :x="workflow.x" :y="workflow.y" :width="workflow.w" :height="workflow.h" class="outline" />
    </g>

    <!-- click 3: anyone opens a discussion; its body runs on the machine -->
    <g class="pop" :data-off="off(triggered)" :style="d(0.2)">
      <rect :x="discussion.x - 1.5" :y="discussion.y - 1.5" :width="discussion.w + 3" :height="discussion.h + 3" class="card" />
      <rect :x="discussion.x - 1.5" :y="discussion.y - 1.5" :width="discussion.w + 3" :height="HB + 1.5" class="bar hot-bar" />
      <text :x="discussion.x + 20" :y="discussion.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ discussion.title }}</text>
      <text :x="discussion.x + 20" :y="ry(discussion, 0)" class="value hot" dominant-baseline="middle">corps : une commande</text>
      <rect :x="discussion.x" :y="discussion.y" :width="discussion.w" :height="discussion.h" class="outline hot-outline" />
    </g>
    <path :d="toWorkflow" pathLength="1" class="line hot-line draw" :data-off="off(triggered)" :style="d(0.5)" />
    <polygon :points="up(dx, workflow.y + workflow.h + 2)" class="accent pop" :data-off="off(triggered)" :style="d(0.85)" />
    <text :x="dx + 16" :y="(workflow.y + workflow.h + discussion.y) / 2 + 7" class="note hot pop" :data-off="off(triggered)" :style="d(0.65)">déclenche</text>
    <path :d="toMachine" pathLength="1" class="line hot-line draw" :data-off="off(triggered)" :style="d(0.9)" />
    <polygon :points="left(runner.x + runner.w + 2, cy(runner))" class="accent pop" :data-off="off(triggered)" :style="d(1.25)" />
    <text :x="(runner.x + runner.w + workflow.x) / 2" :y="cy(runner) - 14" class="note hot pop" :data-off="off(triggered)" :style="d(1.05)" text-anchor="middle">exécute</text>
  </svg>
</template>

<style scoped>
.runner-backdoor {
  display: block;
  width: 100%;
  padding: 24px 32px 32px;
  overflow: visible;
}

/* the two areas: dashed borders, the machine tinted; it turns hot once a command from GitHub runs on it */
.area {
  stroke: var(--hud-muted);
  stroke-width: 2;
  stroke-dasharray: 10 8;
  transition: stroke 0.3s ease 1.2s;
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
