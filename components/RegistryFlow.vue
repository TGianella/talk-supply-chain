<script setup lang="ts">
// How the npm registry works: the source code and its maintainer publish to the registry together,
// which the project installs from; the weak spots of the chain are numbered on it one click at a time,
// and listed under the diagram.
// flaws: in click order, each one placed on a spot of the diagram:
// - account: the maintainer's account
// - tarball: the archive sent to the registry (the legit source code gives way to an unknown one)
// - namespace: the package name (a lookalike name shows up next to it)
// - publish: the registry receiving a new version
// - pointers: the `latest` tag (the dependency from outside npm shows up with it)
// - latest: the install arrow (a version range resolving to the newest version shows up under it)
// - install: node_modules, at install time
// - runtime: the running app
// <RegistryFlow :flaws="[{ spot: 'account', label: '…' }, …]" />
type Spot = 'account' | 'tarball' | 'namespace' | 'publish' | 'pointers' | 'latest' | 'install' | 'runtime'

const props = withDefaults(defineProps<{
  flaws: { spot: Spot, label: string }[]
  at?: number // click of the first flaw
  pkg?: string
  versions?: string[] // oldest first; `latest` points to the last one
  project?: string
  repo?: string // title of the legit source code card
  lookalike?: string // name shown with the namespace flaw
  range?: string // range in the project's package.json, shown with the latest flaw
}>(), {
  at: 1,
  pkg: '@acme/auth',
  versions: () => ['2.3.0', '2.3.1', '2.4.0'],
  project: 'mon-projet',
  repo: 'github.com',
  lookalike: 'acme-auth',
  range: '^2.3.0',
})

// cards: header bar, then the body
const HB = 48
// left column: source code on top, maintainer below
const source = { x: 20, y: 40, w: 300, h: 164 }
const maintainer = { x: 20, y: 230, w: 300, h: 140, title: 'mainteneur' }
const registry = { x: 600, y: 40, w: 440, h: 320, title: 'registry.npmjs.org' }
const project = { x: 1360, y: 80, w: 380, h: 240, title: props.project }
const cards = [maintainer, registry, project]
// a bracket joins the body centers of the two left cards, and one arrow goes from its middle to the registry;
// the arrow out of the registry runs at the height of the project's body center
const SY = source.y + (HB + source.h) / 2
const MY = maintainer.y + (HB + maintainer.h) / 2
const PY = (SY + MY) / 2
const BX = source.x + source.w + 40
const AY = 224

const arrow = (x0: number, x1: number, y: number) => ({
  d: `M${x0} ${y}H${x1 - 16}`,
  head: `${x1},${y} ${x1 - 18},${y - 10} ${x1 - 18},${y + 10}`,
})
const bracket = `M${source.x + source.w} ${SY}H${BX}V${MY}H${maintainer.x + maintainer.w}`
const publish = arrow(BX, registry.x - 2, PY)
const install = arrow(registry.x + registry.w, project.x - 2, AY)
// the archive on the publish arrow, and the command labels, halfway
const tx = (BX + registry.x) / 2
const ix = (registry.x + registry.w + project.x) / 2

// source code as lines of code; in the unknown source, one of them is injected
const code = [[0, 170], [24, 200], [24, 140], [0, 100]]
  .map(([dx, w], i) => ({ x: source.x + 24 + dx, y: source.y + HB + 20 + i * 22, w }))
const injected = [1, 2]

// versions in the registry, newest at the bottom, with the latest tag pointing to it
const rows = props.versions.map((v, i) => ({ v, y: 186 + i * 50 }))
const newest = rows[rows.length - 1]
const tag = { x: registry.x + 280, y: newest.y - 20, w: 120, h: 40 }
// lookalike package name, next to the real one (widths from the mono fonts: about 0.6em per character)
const twin = { x: registry.x + 70 + props.pkg.length * 17, y: 112, w: props.lookalike.length * 14.4 + 30, h: 38 }

// dependency from outside the registry (git, URL), under the cards, into the bottom of the project
const ext = { x: 1110, y: 330, w: 150, h: 48 }
const ey = ext.y + ext.h / 2
const ex = project.x + 70
const pb = project.y + project.h
const extArrow = {
  d: `M${ext.x + ext.w} ${ey}H${ex}V${pb + 18}`,
  head: `${ex},${pb + 2} ${ex - 10},${pb + 20} ${ex + 10},${pb + 20}`,
}

// marker centers
const spots: Record<Spot, number[]> = {
  account: [maintainer.x + maintainer.w, maintainer.y + HB],
  tarball: [tx + 28, PY - 22],
  namespace: [twin.x + twin.w, twin.y],
  publish: [registry.x, PY - 70],
  pointers: [tag.x + tag.w, tag.y],
  latest: [ix + 118, AY + 38],
  install: [project.x + project.w, 180],
  runtime: [project.x + project.w, 272],
}
const M = 44

const tarballAt = props.flaws.findIndex(f => f.spot === 'tarball')
const pointersAt = props.flaws.findIndex(f => f.spot === 'pointers')
const namespaceAt = props.flaws.findIndex(f => f.spot === 'namespace')
const latestAt = props.flaws.findIndex(f => f.spot === 'latest')
// legend on two rows
const columns = Math.ceil(props.flaws.length / 2)
</script>

<template>
  <div class="registry-flow">
    <svg viewBox="0 30 1780 360" class="diagram" fill="none">
      <!-- source code: the legit one, covered by an unknown one (opaque, same place) with the tarball flaw -->
      <g>
        <rect :x="source.x" :y="source.y" :width="source.w" :height="source.h" class="card" />
        <rect :x="source.x" :y="source.y" :width="source.w" :height="HB" class="bar" />
        <text :x="source.x + 20" :y="source.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ repo }}</text>
        <rect v-for="(l, i) in code" :key="i" :x="l.x" :y="l.y" :width="l.w" height="10" class="code" />
        <rect :x="source.x" :y="source.y" :width="source.w" :height="source.h" class="outline" />
      </g>
      <g v-if="tarballAt >= 0" v-click="at + tarballAt">
        <rect :x="source.x" :y="source.y" :width="source.w" :height="source.h" class="card" />
        <rect :x="source.x" :y="source.y" :width="source.w" :height="HB" class="bar hot" />
        <text :x="source.x + 20" :y="source.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">source inconnue</text>
        <rect v-for="(l, i) in code" :key="i" :x="l.x" :y="l.y" :width="l.w" height="10" :class="injected.includes(i) ? 'code hot' : 'code'" />
        <rect :x="source.x" :y="source.y" :width="source.w" :height="source.h" class="outline" />
      </g>

      <!-- cards: header bar first, outline on top -->
      <g v-for="c in cards" :key="c.title">
        <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="card" />
        <rect :x="c.x" :y="c.y" :width="c.w" :height="HB" class="bar" />
        <text :x="c.x + 20" :y="c.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ c.title }}</text>
        <rect :x="c.x" :y="c.y" :width="c.w" :height="c.h" class="outline" />
      </g>

      <!-- maintainer -->
      <circle :cx="source.x + 60" :cy="MY - 16" r="15" class="ink" />
      <path :d="`M${source.x + 34} ${MY + 28}Q${source.x + 34} ${MY + 4} ${source.x + 60} ${MY + 4}Q${source.x + 86} ${MY + 4} ${source.x + 86} ${MY + 28}Z`" class="ink" />
      <text :x="source.x + 108" :y="MY + 1" class="note" dominant-baseline="middle">compte npm</text>

      <!-- publish: the source code and the maintainer's account, together, send the archive -->
      <path :d="bracket" class="line" />
      <path :d="publish.d" class="flow" />
      <polygon :points="publish.head" class="ink" />
      <text :x="tx" :y="PY - 56" class="cmd" text-anchor="middle">npm publish</text>
      <rect :x="tx - 28" :y="PY - 22" width="56" height="44" class="box" />
      <path :d="`M${tx - 28} ${PY - 10}H${tx + 28}M${tx} ${PY - 22}V${PY - 10}`" class="line" />
      <text :x="tx" :y="PY + 52" class="note" text-anchor="middle">.tgz</text>

      <!-- registry: one package, its versions and the latest tag -->
      <text :x="registry.x + 40" y="138" class="name">{{ pkg }}</text>
      <g v-for="r in rows" :key="r.v">
        <rect :x="registry.x + 40" :y="r.y - 12" width="30" height="24" class="box small" />
        <text :x="registry.x + 86" :y="r.y + 1" class="version" dominant-baseline="middle">{{ r.v }}</text>
      </g>
      <rect :x="tag.x" :y="tag.y" :width="tag.w" :height="tag.h" class="box" />
      <text :x="tag.x + tag.w / 2" :y="newest.y + 1" class="tag" text-anchor="middle" dominant-baseline="middle">latest</text>
      <path :d="`M${tag.x} ${newest.y}H${registry.x + 190}`" class="line" />
      <polygon :points="`${registry.x + 176},${newest.y} ${registry.x + 192},${newest.y - 9} ${registry.x + 192},${newest.y + 9}`" class="ink" />

      <!-- lookalike name, with the namespace flaw -->
      <g v-if="namespaceAt >= 0" v-click="at + namespaceAt">
        <rect :x="twin.x" :y="twin.y" :width="twin.w" :height="twin.h" class="box dashed" />
        <text :x="twin.x + twin.w / 2" :y="twin.y + twin.h / 2 + 1" class="version" text-anchor="middle" dominant-baseline="middle">{{ lookalike }}</text>
      </g>

      <!-- install -->
      <path :d="install.d" class="flow" />
      <polygon :points="install.head" class="ink" />
      <text :x="ix" y="168" class="cmd" text-anchor="middle">npm install</text>
      <!-- the range resolves to the newest version, with the latest flaw -->
      <text v-if="latestAt >= 0" v-click="at + latestAt" :x="ix" :y="AY + 44" class="note" text-anchor="middle">{{ range }} → {{ newest.v }}</text>

      <!-- project: installed dependencies, then the running app -->
      <path :d="`M${project.x + 30} 168h12l4 6h18v18h-34z`" class="box small" />
      <text :x="project.x + 82" y="181" class="version" dominant-baseline="middle">node_modules/</text>
      <path :d="`M${project.x + 20} ${AY}H${project.x + project.w - 20}`" class="divider" />
      <polygon :points="`${project.x + 34},260 ${project.x + 58},272 ${project.x + 34},284`" class="ink" />
      <text :x="project.x + 82" y="273" class="version" dominant-baseline="middle">node app.js</text>

      <!-- dependency from outside npm, with the pointers flaw -->
      <g v-if="pointersAt >= 0" v-click="at + pointersAt">
        <rect :x="ext.x" :y="ext.y" :width="ext.w" :height="ext.h" class="box dashed" />
        <text :x="ext.x + ext.w / 2" :y="ey + 1" class="version" text-anchor="middle" dominant-baseline="middle">git / URL</text>
        <path :d="extArrow.d" class="flow dashed" />
        <polygon :points="extArrow.head" class="ink" />
      </g>

      <!-- numbered markers -->
      <g v-for="(f, i) in flaws" :key="f.spot" v-click="at + i">
        <rect :x="spots[f.spot][0] - M / 2" :y="spots[f.spot][1] - M / 2" :width="M" :height="M" class="marker" />
        <text :x="spots[f.spot][0]" :y="spots[f.spot][1] + 2" class="marker-number" text-anchor="middle" dominant-baseline="middle">{{ i + 1 }}</text>
      </g>
    </svg>

    <!-- divs rather than a list: the theme numbers the items of every ol on a slide -->
    <div class="legend" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
      <div v-for="(f, i) in flaws" :key="f.spot" v-click="at + i" class="item">
        <span class="number">{{ i + 1 }}</span>
        <span class="label">{{ f.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registry-flow {
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.diagram {
  display: block;
  width: 100%;
  overflow: visible;
}

.card {
  fill: var(--hud-surface);
}

.bar {
  fill: var(--hud-ink);
}

.code {
  fill: var(--hud-faint);
}

.bar.hot,
.code.hot {
  fill: var(--hud-accent);
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

.ink {
  fill: var(--hud-ink);
}

.box {
  fill: var(--hud-surface);
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.small {
  stroke-width: 2.5;
}

.line,
.flow {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.dashed {
  stroke-dasharray: 8 6;
}

.divider {
  stroke: var(--hud-grid);
  stroke-width: 2;
}

.name {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 28px;
  fill: var(--hud-ink);
}

.version {
  font-family: var(--hud-font-mono);
  font-size: 24px;
  fill: var(--hud-ink);
}

.cmd {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  fill: var(--hud-ink);
}

.note,
.tag {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.tag {
  fill: var(--hud-ink);
}

.marker {
  fill: var(--hud-accent);
}

.marker-number,
.number {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 28px;
  fill: var(--hud-surface);
  color: var(--hud-surface);
}

.legend {
  display: grid;
  gap: 28px 48px;
  padding: 0 20px;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.number {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: var(--hud-accent);
  line-height: 1;
}

.label {
  font-family: var(--hud-font-body);
  font-size: 26px;
  line-height: 1.3;
  color: var(--hud-ink);
  padding-top: 4px;
}
</style>
