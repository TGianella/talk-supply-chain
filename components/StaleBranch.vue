<script setup lang="ts">
// Why reverting the workflow on master wasn't enough: pull_request_target runs the workflow of the PR's
// target branch, and an older branch, forked while the workflow was there, still had it.
// Two areas, as in <PwnRequest>: the main repository, with master (ending with whether the vulnerable
// workflow is on it) and the older branch as lines of commits, and below it the attacker's fork. The older
// branch ends at its last commit, the one it points to, which still has the workflow:
// - click 1: the older branch, forked from the commit adding the workflow;
// - click 2: the older branch is merged into master, but not deleted: it can still be a pull request target;
// - click 3: the revert on master, whose workflow goes away; the older branch keeps it;
// - click 4: the attacker's fork;
// - click 5: the attacker opens a pull request from the fork against the older branch, and its workflow runs.
// Steps count from the click that opened its window in the case layout (`clicks: [5]` on that modus row),
// or from `at`. `pauses` leaves a click free after each of these steps, for a <WindowStep> over the diagram
// (two more `clicks`): with `:pauses="[0, 3]"`, a window shows at step 1, the branch comes at step 2, and
// another window at step 5, after the revert. <StaleBranch />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
  repo?: string
  main?: string
  branch?: string
  fork?: string
  pauses?: number[]
}>(), { pauses: () => [], repo: 'nrwl/nx', main: 'master', branch: 'fix/typo', fork: 'fork' })

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
// the diagram's step: the clicks since its window opened, minus the free clicks passed
const pauses = [...props.pauses].sort((a, b) => a - b)
const step = computed(() => {
  const raw = $clicks.value - (props.at ?? opened?.value ?? 0)
  return raw - pauses.filter((p, i) => raw >= p + 1 + i).length
})
const branched = computed(() => step.value >= 1)
const merged = computed(() => step.value >= 2)
const reverted = computed(() => step.value >= 3)
const forked = computed(() => step.value >= 4)
const attacked = computed(() => step.value >= 5)

// areas: the main repository on top, the attacker's fork below
const repoArea = { x: 20, y: 20, w: 1360, h: 390, label: `dépôt ${props.repo}` }
const forkArea = { x: 20, y: 450, w: 1360, h: 160, label: 'fork de l’attaquant' }

// lanes, from the label column
const X0 = 260
const MY = 130
const BY = 250
const FY = 550
const M = 22 // commit side
// commits on master: the workflow added (the fork point of the older branch), its merge, the revert
const added = 480
const merge = 760
const revert = 900
// the commit the older branch points to; it is merged into master, then the pull request aims at it
const tip = (added + merge) / 2
// the attacker's commits; the pull request leaves from the last one, under the older branch's commit
const forkCommits = [360, 500]
const prX = tip

// tag of master, and the run started by the pull request, on the right
const tag = { x: 1080, w: 260, h: 44 }
const run = { x: 1070, y: 290, w: 280, h: 90 }
const RY = run.y + run.h / 2

// master's last commit so far, which its tag follows
const head = computed(() => reverted.value ? revert : merged.value ? merge : added)
// a segment of master between two commits, from edge to edge
const seg = (a: number, b: number) => `M${a + M / 2} ${MY}H${b - M / 2}`
// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
const HB = 38
</script>

<template>
  <svg viewBox="0 0 1400 630" class="stale-branch" fill="none">
    <!-- the main repository; master runs from commit to commit, each segment drawn before its commit shows -->
    <rect :x="repoArea.x" :y="repoArea.y" :width="repoArea.w" :height="repoArea.h" class="area inside" />
    <text :x="repoArea.x + 20" :y="repoArea.y + 34" class="area-label">{{ repoArea.label }}</text>
    <text x="50" :y="MY" class="lane" dominant-baseline="middle">{{ main }}</text>
    <path :d="`M${X0} ${MY}H${added - M / 2}`" class="line" />
    <rect :x="320 - M / 2" :y="MY - M / 2" :width="M" :height="M" class="commit" />
    <rect :x="added - M / 2" :y="MY - M / 2" :width="M" :height="M" class="commit hot" />
    <text :x="added" :y="MY - 34" class="note hot" text-anchor="middle">21.08 · workflow ajouté</text>

    <!-- click 1: the older branch, forked from the commit adding the workflow, down to the commit it points to -->
    <text x="50" :y="BY" class="lane pop" dominant-baseline="middle" :data-off="off(branched)">{{ branch }}</text>
    <path :d="`M${added} ${MY + M / 2}V${BY}H${tip - M / 2}`" pathLength="1" class="line draw" :data-off="off(branched)" />
    <rect :x="tip - M / 2" :y="BY - M / 2" :width="M" :height="M" class="commit pop" :data-off="off(branched)" :style="d(0.4)" />
    <text :x="tip - M / 2 - 4" :y="BY + 38" class="note hot pop" text-anchor="end" :data-off="off(branched)" :style="d(0.5)">workflow vulnérable</text>

    <!-- click 2: the older branch merged into master (master goes on to the merge commit), and still there -->
    <path :d="`M${tip + M / 2} ${BY}H${merge}V${MY + M / 2}`" pathLength="1" class="line draw" :data-off="off(merged)" />
    <path :d="seg(added, merge)" pathLength="1" class="line draw" :data-off="off(merged)" />
    <rect :x="merge - M / 2" :y="MY - M / 2" :width="M" :height="M" class="commit pop" :data-off="off(merged)" :style="d(0.4)" />
    <text :x="merge + 16" :y="BY - 44" class="note pop" :data-off="off(merged)" :style="d(0.5)">fusionnée, non supprimée</text>

    <!-- click 3: the revert on master -->
    <path :d="seg(merge, revert)" pathLength="1" class="line draw" :data-off="off(reverted)" />
    <rect :x="revert - M / 2" :y="MY - M / 2" :width="M" :height="M" class="commit pop" :data-off="off(reverted)" :style="d(0.4)" />
    <text :x="revert" :y="MY - 34" class="note pop" text-anchor="middle" :data-off="off(reverted)" :style="d(0.4)">22.08 · workflow retiré</text>

    <!-- tag of master, following its last commit: is the vulnerable workflow on it? -->
    <g class="follow" :style="{ transform: `translateX(${head + 30}px)` }">
      <rect x="0" :y="MY - tag.h / 2" :width="tag.w" :height="tag.h" class="tag" :class="{ 'hot-tag': !reverted }" />
      <text :x="tag.w / 2" :y="MY + 1" class="tag-text" :class="{ hot: !reverted }" text-anchor="middle" dominant-baseline="middle">
        {{ reverted ? 'workflow retiré' : 'workflow vulnérable' }}
      </text>
    </g>

    <!-- click 4: the attacker's fork, its line drawn through its commits -->
    <g class="pop" :data-off="off(forked)">
      <rect :x="forkArea.x" :y="forkArea.y" :width="forkArea.w" :height="forkArea.h" class="area" />
      <text :x="forkArea.x + 20" :y="forkArea.y + 34" class="area-label">{{ forkArea.label }}</text>
      <text x="50" :y="FY" class="lane" dominant-baseline="middle">{{ fork }}</text>
    </g>
    <path :d="`M${X0} ${FY}H${forkCommits.at(-1)! - M / 2}`" pathLength="1" class="line draw" :data-off="off(forked)" :style="d(0.3)" />
    <rect
      v-for="(x, k) in forkCommits" :key="`f${x}`" :x="x - M / 2" :y="FY - M / 2" :width="M" :height="M"
      class="commit pop" :data-off="off(forked)" :style="d(0.3 + 0.5 * (x - X0) / (forkCommits.at(-1)! - X0) + k * 0.05)"
    />

    <!-- click 5: the attacker's commit, then the pull request against the older branch, that is its commit,
         which starts a run of that commit's workflow -->
    <path :d="`M${forkCommits.at(-1)! + M / 2} ${FY}H${prX - M / 2}`" pathLength="1" class="line draw" :data-off="off(attacked)" />
    <rect :x="prX - M / 2" :y="FY - M / 2" :width="M" :height="M" class="commit hot pop" :data-off="off(attacked)" :style="d(0.45)" />
    <path :d="`M${prX} ${FY - M / 2}V${BY + M / 2 + 18}`" pathLength="1" class="line hot-line draw" :data-off="off(attacked)" :style="d(0.5)" />
    <polygon :points="`${prX},${BY + M / 2 + 2} ${prX - 10},${BY + M / 2 + 20} ${prX + 10},${BY + M / 2 + 20}`" class="accent pop" :data-off="off(attacked)" :style="d(0.95)" />
    <text :x="prX - 16" :y="(repoArea.y + repoArea.h + forkArea.y) / 2 + 7" class="note hot pop" text-anchor="end" :data-off="off(attacked)" :style="d(0.5)">24.08 · pull request vers « {{ branch }} »</text>

    <path :d="`M${prX} ${RY}H${run.x - 16}`" pathLength="1" class="line hot-line draw" :data-off="off(attacked)" :style="d(1.1)" />
    <polygon :points="`${run.x - 2},${RY} ${run.x - 20},${RY - 10} ${run.x - 20},${RY + 10}`" class="accent pop" :data-off="off(attacked)" :style="d(1.55)" />
    <g class="pop" :data-off="off(attacked)" :style="d(1.6)">
      <!-- fills drawn under the whole stroke of the outline, so that no light seam shows on the scaled slide -->
      <rect :x="run.x - 1.5" :y="run.y - 1.5" :width="run.w + 3" :height="run.h + 3" class="card" />
      <rect :x="run.x - 1.5" :y="run.y - 1.5" :width="run.w + 3" :height="HB + 1.5" class="hot-bar" />
      <text :x="run.x + 16" :y="run.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">pull_request_target</text>
      <text :x="run.x + 16" :y="run.y + HB + 30" class="value" dominant-baseline="middle">workflow du commit</text>
      <rect :x="run.x" :y="run.y" :width="run.w" :height="run.h" class="outline hot-outline" />
    </g>
  </svg>
</template>

<style scoped>
.stale-branch {
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

.lane {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  fill: var(--hud-ink);
}

.line {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.hot-line {
  stroke: var(--hud-accent);
}

.commit {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.commit.hot {
  fill: var(--hud-accent);
  stroke: var(--hud-accent);
}

.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.hot,
.note.hot {
  fill: var(--hud-accent);
}

.tag {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 2.5;
  transition: stroke 0.4s;
}

.hot-tag {
  stroke: var(--hud-accent);
}

.tag-text {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  fill: var(--hud-muted);
}

.tag-text.hot {
  fill: var(--hud-accent);
}

.card {
  fill: var(--hud-surface);
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
  font-size: 20px;
  fill: var(--hud-surface);
}

.accent {
  fill: var(--hud-accent);
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

/* the tag of master slides along to its last commit */
.follow {
  transition: transform 0.5s ease-in-out;
}
</style>
