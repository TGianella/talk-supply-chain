<script setup lang="ts">
// Dependency tree, upstream at the top (one package), downstream at the bottom (projects),
// showing how a weakness in the top package reaches the projects. Two clicks, from `at`:
// - mode "flaw": a flaw shows in the top package (at), then an attacker exploits it in one project (at + 1);
// - mode "poison": an attacker injects code into the top package (at), then it spreads to everything downstream (at + 1).
// The attacker comes from the left, rows are labelled on the right.
// <VulnTree mode="flaw" :at="1" pkg="lodash" project="ma-boutique" />
const props = withDefaults(defineProps<{
  mode: 'flaw' | 'poison'
  at: number
  pkg?: string // name of the top package, with an optional version: 'lodash@4.17.11'
  project?: string // name of the attacked project (flaw mode)
  attacker?: string
}>(), { attacker: 'attaque' })

// drawing area: from the start of the attack arrow on the first project (x 50) to the end of the row labels
const [X0, W] = [50, 1000]
// vertically, from just above the bracket tops (y 48) to just below the project name (y 566)
const [Y0, H] = [40, 532]
const P = 64 // package side
const [AW, AH] = [80, 64] // project size
const levels = [90, 290, 490]

const root = { x: 505, y: levels[0] }
const apps = [230, 340, 450, 560, 670, 780].map((x, i) => ({ x, y: levels[2], parent: Math.floor(i / 2) }))
// each middle package centered over its two projects
const mids = [0, 1, 2].map(i => ({ x: (apps[2 * i].x + apps[2 * i + 1].x) / 2, y: levels[1] }))

// right-angled edge from the bottom of a parent to the top of a child
const edge = (a: { x: number, y: number }, b: { x: number, y: number }, hb: number) => {
  const mid = (a.y + P / 2 + b.y - hb / 2) / 2
  return `M${a.x} ${a.y + P / 2}V${mid}H${b.x}V${b.y - hb / 2}`
}
const upper = mids.map(m => edge(root, m, P))
const lower = apps.map(a => edge(mids[a.parent], a, AH))

// flaw mode: the first project is attacked, through the first branch
const hit = 0

// attacker arrow, to the target's left side, with its label above it
const target = props.mode === 'flaw' ? { x: apps[hit].x - AW / 2, y: apps[hit].y } : { x: root.x - P / 2, y: root.y }
// the arrow starts where the label starts (label: about 105 units for "attaque", ending ~35 before the target)
const start = target.x - 140
const arrow = `M${start} ${target.y}H${target.x - 18}`
const head = `${target.x - 4},${target.y} ${target.x - 22},${target.y - 11} ${target.x - 22},${target.y + 11}`

// crack drawn across the flawed package
const crack = `M${root.x - 14} ${root.y - P / 2}L${root.x + 4} ${root.y - 8}L${root.x - 8} ${root.y + 6}L${root.x + 12} ${root.y + P / 2}`

// row labels on the right, with a bracket along the rows they cover, its arms toward the tree,
// reaching a little above and below the boxes
const ext = 10
const rows = [
  { label: 'dépendances', y0: levels[0] - P / 2 - ext, y1: levels[1] + P / 2 + ext },
  { label: 'projets', y0: levels[2] - AH / 2 - ext, y1: levels[2] + AH / 2 + ext },
]
const bx = 876

// version (after the last @, not a scope's leading one) shown lighter
const sep = props.pkg?.lastIndexOf('@') ?? -1
const [pkgName, pkgVersion] = sep > 0 ? [props.pkg!.slice(0, sep), props.pkg!.slice(sep + 1)] : [props.pkg, '']

const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg :viewBox="`${X0} ${Y0} ${W} ${H}`" class="vuln-tree" fill="none">
    <!-- row labels -->
    <g v-for="r in rows" :key="r.label">
      <path :d="`M${bx - 12} ${r.y0}H${bx}V${r.y1}H${bx - 12}`" class="bracket" />
      <text :x="bx + 20" :y="(r.y0 + r.y1) / 2" class="row" dominant-baseline="middle">{{ r.label }}</text>
    </g>

    <!-- tree, at rest -->
    <path v-for="(e, i) in [...upper, ...lower]" :key="`e${i}`" :d="e" class="edge" />
    <rect :x="root.x - P / 2" :y="root.y - P / 2" :width="P" :height="P" class="pkg" />
    <rect v-for="(m, i) in mids" :key="`m${i}`" :x="m.x - P / 2" :y="m.y - P / 2" :width="P" :height="P" class="pkg" />
    <rect v-for="(a, i) in apps" :key="`a${i}`" :x="a.x - AW / 2" :y="a.y - AH / 2" :width="AW" :height="AH" class="app" />
    <text v-if="pkg" :x="root.x + P / 2 + 20" :y="root.y + 14" class="name">{{ pkgName }}<tspan v-if="pkgVersion" class="version">@{{ pkgVersion }}</tspan></text>
    <text v-if="project && mode === 'flaw'" :x="apps[hit].x" :y="apps[hit].y + AH / 2 + 36" class="name" text-anchor="middle">{{ project }}</text>

    <template v-if="mode === 'flaw'">
      <!-- the flaw, there from the start -->
      <g v-click="at" class="fade">
        <rect :x="root.x - P / 2" :y="root.y - P / 2" :width="P" :height="P" class="pkg flawed" />
        <path :d="crack" class="crack" />
      </g>
      <!-- an attacker exploits it in one project, one step at a time (draws take 0.5s):
           path from the flawed package, then from the middle package, the project turns accent, then the attack -->
      <path v-click="at + 1" :d="upper[apps[hit].parent]" pathLength="1" class="hot draw" />
      <path v-click="at + 1" :d="lower[hit]" pathLength="1" class="hot draw" :style="d(0.5)" />
      <rect v-click="at + 1" :x="apps[hit].x - AW / 2" :y="apps[hit].y - AH / 2" :width="AW" :height="AH" class="hit fade" :style="d(1)" />
      <path v-click="at + 1" :d="arrow" pathLength="1" class="hot draw" :style="d(1.35)" />
      <polygon v-click="at + 1" :points="head" class="head fade" :style="d(1.8)" />
      <text v-click="at + 1" :x="start" :y="target.y - 22" class="tag fade" :style="d(1.35)">{{ attacker }}</text>
    </template>

    <template v-else>
      <!-- an attacker injects code into the package -->
      <path v-click="at" :d="arrow" pathLength="1" class="hot draw" />
      <polygon v-click="at" :points="head" class="head fade" :style="d(0.45)" />
      <text v-click="at" :x="start" :y="target.y - 22" class="tag fade">{{ attacker }}</text>
      <rect v-click="at" :x="root.x - P / 2" :y="root.y - P / 2" :width="P" :height="P" class="hit boxed fade" :style="d(0.5)" />
      <!-- and it reaches everything downstream, level by level -->
      <path v-for="(e, i) in upper" :key="`hu${i}`" v-click="at + 1" :d="e" pathLength="1" class="hot draw" />
      <rect v-for="(m, i) in mids" :key="`hm${i}`" v-click="at + 1" :x="m.x - P / 2" :y="m.y - P / 2" :width="P" :height="P" class="hit boxed fade" :style="d(0.5)" />
      <path v-for="(e, i) in lower" :key="`hl${i}`" v-click="at + 1" :d="e" pathLength="1" class="hot draw" :style="d(0.7)" />
      <rect v-for="(a, i) in apps" :key="`ha${i}`" v-click="at + 1" :x="a.x - AW / 2" :y="a.y - AH / 2" :width="AW" :height="AH" class="hit fade" :style="d(1.2)" />
    </template>
  </svg>
</template>

<style scoped>
.vuln-tree {
  display: block;
  width: 100%;
  overflow: visible;
}

.edge {
  stroke: var(--hud-faint);
  stroke-width: 3;
}

.pkg {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.app {
  fill: var(--hud-ink);
}

.flawed {
  stroke: var(--hud-accent);
  stroke-width: 4;
}

.crack {
  stroke: var(--hud-accent);
  stroke-width: 4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.hit {
  fill: var(--hud-accent);
}

/* on a package, covers its whole outline too (same stroke as .pkg) */
.boxed {
  stroke: var(--hud-accent);
  stroke-width: 3;
}

.hot {
  stroke: var(--hud-accent);
  stroke-width: 4;
}

.head {
  fill: var(--hud-accent);
}

.bracket {
  stroke: var(--hud-muted);
  stroke-width: 2;
}

.row {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.name {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 28px;
  fill: var(--hud-ink);
}

.version {
  font-weight: 400;
  fill: var(--hud-muted);
}

.tag {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--hud-accent);
}

/* --d delays each part, so that a click plays as a sequence; hiding is immediate */
.fade.slidev-vclick-target {
  transition: opacity 0.25s ease var(--d, 0s);
}

.draw.slidev-vclick-target {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.5s ease-in-out var(--d, 0s);
}

.slidev-vclick-hidden {
  transition: none;
}

.draw.slidev-vclick-hidden {
  opacity: 1 !important;
  stroke-dashoffset: 1;
}
</style>
