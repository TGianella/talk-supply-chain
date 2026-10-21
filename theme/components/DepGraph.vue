<script setup lang="ts">
import { computed } from 'vue'

// Dependency graph, laid out left to right.
// Columns come from the longest path from the roots (override with `col`),
// nodes are spread vertically in each column in declaration order (override with `y`, 0–1).
// Edges leading to a flagged node are drawn in accent color.
//
// <DepGraph
//   :nodes="[
//     { id: 'app', label: 'mon-app' },
//     { id: 'express' },
//     { id: 'debug', version: '4.4.2', flagged: true },
//   ]"
//   :edges="['app>express', 'express>debug']"
// />
interface GraphNode {
  id: string
  label?: string
  version?: string
  flagged?: boolean
  col?: number
  y?: number
}

const props = withDefaults(defineProps<{
  nodes: GraphNode[]
  edges: (string | [string, string])[]
  width?: number
  height?: number
  nodeWidth?: number
  nodeHeight?: number
  flagLabel?: string
}>(), {
  width: 1680,
  height: 560,
  nodeWidth: 320,
  nodeHeight: 76,
  flagLabel: '■ Signalé',
})

const pairs = computed(() => props.edges.map(e => (typeof e === 'string' ? e.split('>').map(s => s.trim()) : e) as [string, string]))

const layout = computed(() => {
  const parents = new Map<string, string[]>()
  const children = new Map<string, string[]>()
  for (const [a, b] of pairs.value) {
    parents.set(b, [...(parents.get(b) ?? []), a])
    children.set(a, [...(children.get(a) ?? []), b])
  }

  const depthCache = new Map<string, number>()
  const depth = (id: string, seen = new Set<string>()): number => {
    const node = props.nodes.find(n => n.id === id)
    if (node?.col !== undefined)
      return node.col
    if (depthCache.has(id))
      return depthCache.get(id)!
    if (seen.has(id))
      return 0
    seen.add(id)
    const d = Math.max(-1, ...(parents.get(id) ?? []).map(p => depth(p, seen))) + 1
    depthCache.set(id, d)
    return d
  }

  const hotCache = new Map<string, boolean>()
  const reachesFlag = (id: string, seen = new Set<string>()): boolean => {
    if (hotCache.has(id))
      return hotCache.get(id)!
    if (seen.has(id))
      return false
    seen.add(id)
    const node = props.nodes.find(n => n.id === id)
    const hot = !!node?.flagged || (children.get(id) ?? []).some(c => reachesFlag(c, seen))
    hotCache.set(id, hot)
    return hot
  }

  const cols = props.nodes.map(n => depth(n.id))
  const maxCol = Math.max(0, ...cols)
  const step = maxCol ? (props.width - props.nodeWidth) / maxCol : 0

  const pos = new Map<string, { x: number, y: number }>()
  const nodes = props.nodes.map((n, i) => {
    const col = cols[i]
    const siblings = props.nodes.filter((_, j) => cols[j] === col)
    const rank = siblings.indexOf(n)
    const y = (n.y ?? (rank + 0.5) / siblings.length) * props.height
    const x = col * step
    pos.set(n.id, { x, y })
    return { ...n, x, y, root: !parents.has(n.id) && children.has(n.id) }
  })

  const lines = pairs.value
    .filter(([a, b]) => pos.has(a) && pos.has(b))
    .map(([a, b]) => {
      const p1 = pos.get(a)!
      const p2 = pos.get(b)!
      const x1 = p1.x + props.nodeWidth
      const mx = p2.x - 60
      return { key: `${a}>${b}`, hot: reachesFlag(b), d: `M${x1} ${p1.y} H${mx} V${p2.y} H${p2.x}` }
    })
    .sort((l1, l2) => Number(l1.hot) - Number(l2.hot))

  return { nodes, lines }
})
</script>

<template>
  <div class="hud-graph" :style="{ width: `${width}px`, height: `${height}px` }">
    <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
      <path v-for="l in layout.lines" :key="l.key" :d="l.d" :class="{ hot: l.hot }" />
    </svg>
    <div
      v-for="n in layout.nodes"
      :key="n.id"
      class="node"
      :class="{ flagged: n.flagged, root: n.root }"
      :style="{ left: `${n.x}px`, top: `${n.y - nodeHeight / 2}px`, width: `${nodeWidth}px`, height: `${nodeHeight}px` }"
    >
      <span>{{ n.label ?? n.id }}</span>
      <span v-if="n.version" class="version">{{ n.version }}</span>
      <span v-if="n.flagged && flagLabel" class="flag">{{ flagLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.hud-graph {
  position: relative;
}

svg {
  position: absolute;
  inset: 0;
  overflow: visible;
}

path {
  fill: none;
  stroke: var(--hud-faint);
  stroke-width: 3;
}

path.hot {
  stroke: var(--hud-accent);
  stroke-width: 4;
}

.node {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--hud-surface);
  box-shadow: inset 0 0 0 2px var(--hud-ink);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 26px;
  white-space: nowrap;
}

.node.root {
  background: var(--hud-ink);
  color: var(--hud-surface);
  box-shadow: none;
}

.node.flagged {
  background: var(--hud-accent);
  color: var(--hud-surface);
  box-shadow: none;
}

.version {
  font-size: 20px;
}

.flag {
  position: absolute;
  left: 0;
  bottom: calc(100% + 4px);
  padding: 4px 10px;
  background: var(--hud-ink);
  color: var(--hud-accent-bright);
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
