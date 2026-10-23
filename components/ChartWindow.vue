<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue'

// Chart in an AppWindow (title bar, plot, credits), for the slides with data.
// <ChartWindow title="…" source="…" type="bar" :data="[[2015, 21], [2016, 59]]" :max="6000" :step="2000" unit=" Md" />
// data: [x, value] pairs, value null when missing; values are already in the displayed unit.
// last-partial: the last value is incomplete (bar: light and dashed; line: dashed segment up to it).
// With `figure` (and `caption`), the window shows that single number instead of a chart.
// Accent, used sparingly: the most recent value only (last bar, last point and its dashed segment).
// rescale (line only): the chart first shows the data up to `until` on its own axis (max, step, every),
// and the next click zooms out on both axes at once to the whole data.
// Without a unit, ticks from 10 000 up read in thousands (« 200 k »).
// <ChartWindow v-click … type="line" :max="1400000" :step="200000" :rescale="{ until: 2020, max: 1200, step: 200 }" />
// reference: a dashed horizontal line at a value to compare against, labelled at its left end.
// <ChartWindow … :reference="{ value: 6892, label: 'Maven Central : 6 892 plugins depuis 2005' }" />
const props = withDefaults(defineProps<{
  title: string
  source: string
  type?: 'bar' | 'line'
  data?: [number | string, number | null][] // x: a year, or a label such as '2015–19' (bar only)
  max?: number
  step?: number
  figure?: string
  caption?: string
  unit?: string
  decimals?: number
  lastPartial?: boolean
  // x labels on the line chart, every n years
  every?: number
  rescale?: { until: number, max: number, step: number, every?: number }
  reference?: { value: number, label: string }
}>(), { type: 'bar', data: () => [[0, 0]], max: 1, step: 1, unit: '', decimals: 0, every: 2 })

const W = 800
const H = 260
const m = { left: 100, right: 40, top: 36, bottom: 40 }
const plotW = W - m.left - m.right
const base = H - m.bottom

// rescale progress, 0 before the click and 1 after: both axes zoom out together
const u = ref(props.rescale ? 0 : 1)
const ease = (v: number) => v < 0.5 ? 4 * v ** 3 : 1 - (-2 * v + 2) ** 3 / 2
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const z = computed(() => ease(u.value))

// the rescale takes the click after the window's own v-click: a directive on this component
// registers when it is mounted, before this component's onMounted
const { $clicksContext: clicks, $renderContext: render } = useSlideContext()
const { isPrintMode } = useNav()
const id = `chart-rescale-${useId()}`
let raf = 0
function play(to: number) {
  cancelAnimationFrame(raf)
  // no animation in the overview, the next-slide preview or the export
  if (isPrintMode.value || !['slide', 'presenter'].includes(render.value)) {
    u.value = to
    return
  }
  const from = u.value
  const t0 = performance.now()
  const dur = 2000 * Math.abs(to - from)
  const frame = (now: number) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1
    u.value = from + (to - from) * k
    if (k < 1)
      raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  if (!props.rescale || !clicks)
    return
  const info = clicks.calculateSince('+1')
  if (!info)
    return
  clicks.register(id, info)
  // arriving on the slide already past the click (going back): no animation
  u.value = info.isActive.value ? 1 : 0
  watch(info.isActive, active => play(active ? 1 : 0))
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  clicks?.unregister(id)
})

// current y max: geometric between the two views, so that the zoom out keeps the same pace
const yMax = computed(() => props.rescale ? props.rescale.max * (props.max / props.rescale.max) ** z.value : props.max)
const y = (v: number) => base - (v / yMax.value) * (base - m.top)

const fmt = (v: number, decimals = props.decimals) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + props.unit
// ticks without decimals when the step is a whole number
const fmtTick = (v: number, step: number) =>
  !props.unit && v >= 10000 ? `${fmt(v / 1000, 0)} k` : fmt(v, Number.isInteger(step) ? 0 : props.decimals)

// ticks of both views: those of the first view fade out, those of the second enter from the top;
// all fade near the top edge
const tickSet = (max: number, step: number) => Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
const ticks = computed(() => {
  const full = tickSet(props.max, props.step).map(v => ({ v, label: fmtTick(v, props.step), o: 1 }))
  const r = props.rescale
  const first = r
    ? tickSet(r.max, r.step).filter(v => v > 0).map(v => ({ v, label: fmtTick(v, r.step), o: clamp(1 - z.value * 4) }))
    : []
  return [...first, ...full]
    .map(t => ({ ...t, y: y(t.v), o: t.o * clamp((y(t.v) - m.top + 8) / 30) }))
    .filter(t => t.o > 0)
})

const last = computed(() => props.data.length - 1)
// value labels only on the first and last values
const labelled = (i: number) => i === 0 || i === last.value

// bars: one slot per value, rounded top anchored to the baseline
const slot = computed(() => plotW / props.data.length)
const bars = computed(() => props.data.map(([x, v], i) => {
  const w = slot.value * 0.68
  const left = m.left + i * slot.value + (slot.value - w) / 2
  const r = 4
  const top = v === null ? base : Math.min(y(v), base - r)
  return {
    x,
    v,
    cx: left + w / 2,
    top,
    partial: props.lastPartial && i === last.value,
    latest: i === last.value,
    label: v !== null && labelled(i),
    d: `M${left} ${base}V${top + r}Q${left} ${top} ${left + r} ${top}H${left + w - r}Q${left + w} ${top} ${left + w} ${top + r}V${base}Z`,
  }
}))

// line: x on a continuous year scale
const x0 = computed(() => Number(props.data[0][0]))
const xEnd = computed(() => Math.ceil(Number(props.data[last.value][0])))
// current end of the x axis: the span grows geometrically too, at the same pace as y
const x1 = computed(() => props.rescale
  ? x0.value + (props.rescale.until - x0.value) * ((xEnd.value - x0.value) / (props.rescale.until - x0.value)) ** z.value
  : xEnd.value)
const lx = (x: number) => m.left + ((x - x0.value) / (x1.value - x0.value)) * plotW
const points = computed(() => props.data.map(([x, v]) => [lx(Number(x)), y(v ?? 0)]))
const line = (ps: number[][]) => ps.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('')
const solid = computed(() => points.value.slice(0, props.lastPartial ? last.value : undefined))
const dashed = computed(() => props.lastPartial ? points.value.slice(-2) : [])
const area = computed(() => `${line(points.value)}V${base}H${points.value[0][0]}Z`)
// the line stays in the plot while the axes move
const clip = `chart-clip-${useId()}`

// x labels of both views: those only in the first view fade out, the new ones slide in from the right
const yearSet = (to: number, every: number) =>
  Array.from({ length: Math.floor((to - x0.value) / every) + 1 }, (_, i) => x0.value + i * every)
const years = computed(() => {
  const full = yearSet(xEnd.value, props.every)
  const first = props.rescale ? yearSet(props.rescale.until, props.rescale.every ?? 1).filter(yr => !full.includes(yr)) : []
  return [...full.map(yr => ({ yr, o: 1 })), ...first.map(yr => ({ yr, o: clamp(1 - z.value * 3) }))]
    .map(t => ({ ...t, x: lx(t.yr), o: t.o * clamp((W - m.right + 20 - lx(t.yr)) / 30) }))
    .filter(t => t.o > 0)
})

// last point of the first view, marked until the rescale starts; the last point shows once it ends
const cut = computed(() => props.rescale ? props.data.findLastIndex(([x]) => Number(x) <= props.rescale!.until) : -1)
const cutO = computed(() => clamp(1 - z.value * 3))
const lastO = computed(() => props.rescale ? clamp(z.value * 3 - 2) : 1)
</script>

<template>
  <AppWindow :title="title">
    <div v-if="figure" class="figure">
      <span class="number">{{ figure }}</span>
      <span class="rule" />
      <span class="caption">{{ caption }}</span>
    </div>
    <svg v-else :viewBox="`0 0 ${W} ${H}`" class="plot">
      <!-- grid and y axis -->
      <g v-for="t in ticks" :key="t.v" :opacity="t.o">
        <line :x1="m.left" :x2="W - m.right" :y1="t.y" :y2="t.y" class="grid" />
        <text :x="m.left - 14" :y="t.y" class="tick" text-anchor="end" dominant-baseline="middle">{{ t.label }}</text>
      </g>
      <!-- reference line behind the data, its label (further down) in front -->
      <line v-if="reference" :x1="m.left" :x2="W - m.right" :y1="y(reference.value)" :y2="y(reference.value)" class="reference" />

      <template v-if="type === 'bar'">
        <g v-for="b in bars" :key="b.x">
          <path v-if="b.v !== null" :d="b.d" :class="b.partial ? 'mark-partial' : b.latest ? 'mark-latest' : 'mark'" />
          <text v-else :x="b.cx" :y="base - 12" class="tick" text-anchor="middle">n.d.</text>
          <text v-if="b.label" :x="b.cx" :y="b.top - 12" class="value" text-anchor="middle">{{ fmt(b.v!) }}</text>
          <text :x="b.cx" :y="base + 28" class="tick" text-anchor="middle">{{ b.x }}{{ b.partial ? '*' : '' }}</text>
        </g>
      </template>

      <template v-else>
        <clipPath :id="clip">
          <rect :x="m.left" y="0" :width="plotW" :height="base" />
        </clipPath>
        <g :clip-path="`url(#${clip})`">
          <path :d="area" class="area" />
          <path :d="line(solid)" class="stroke" />
          <path v-if="dashed.length" :d="line(dashed)" class="stroke dashed" />
        </g>
        <circle :cx="points[0][0]" :cy="points[0][1]" r="7" class="dot" />
        <g v-if="cut >= 0 && cutO > 0" :opacity="cutO">
          <circle :cx="points[cut][0]" :cy="points[cut][1]" r="7" class="dot-latest" />
          <text :x="points[cut][0] - 14" :y="points[cut][1] - 6" class="value" text-anchor="end">{{ fmt(data[cut][1]!) }}</text>
        </g>
        <g v-if="lastO > 0" :opacity="lastO">
          <circle :cx="points[last][0]" :cy="points[last][1]" r="7" class="dot-latest" />
          <text :x="points[last][0] - 14" :y="points[last][1] - 6" class="value" text-anchor="end">{{ fmt(data[last][1]!) }}</text>
        </g>
        <text v-for="t in years" :key="t.yr" :x="t.x" :y="base + 28" :opacity="t.o" class="tick" text-anchor="middle">{{ t.yr }}</text>
      </template>

      <text v-if="reference" :x="m.left + 10" :y="y(reference.value) - 10" class="reference-label">{{ reference.label }}</text>
      <line :x1="m.left" :x2="W - m.right" :y1="base" :y2="base" class="axis" />
    </svg>
    <div class="source">{{ source }}</div>
  </AppWindow>
</template>

<style scoped>
.plot {
  display: block;
  width: 100%;
  padding: 8px 15px 0;
}

.figure {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 24px 35px 16px;
}

.number {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 128px;
  line-height: 1;
  color: var(--hud-ink);
}

.rule {
  width: 96px;
  height: 8px;
  margin: 8px 0 6px;
  background: var(--hud-accent);
}

.caption {
  font-family: var(--hud-font-body);
  font-size: 28px;
  line-height: 1.3;
  color: var(--hud-ink);
}

.source {
  padding: 4px 23px 17px;
  font-family: var(--hud-font-mono);
  font-size: 16px;
  color: var(--hud-muted);
}

.grid {
  stroke: var(--hud-grid);
  stroke-width: 1.5;
}

.axis {
  stroke: var(--hud-ink);
  stroke-width: 2;
}

.tick {
  font-family: var(--hud-font-mono);
  font-size: 18px;
  fill: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 24px;
  fill: var(--hud-ink);
}

.mark {
  fill: var(--hud-ink);
}

.reference {
  stroke: var(--hud-ink);
  stroke-width: 2.5;
  stroke-dasharray: 10 8;
}

/* surface halo so the label stays readable over the data it crosses */
.reference-label {
  font-family: var(--hud-font-mono);
  font-size: 18px;
  fill: var(--hud-ink);
  stroke: var(--hud-surface);
  stroke-width: 6px;
  paint-order: stroke;
}

.mark-latest {
  fill: var(--hud-accent);
}

.mark-partial {
  fill: color-mix(in srgb, var(--hud-accent) 18%, var(--hud-surface));
  stroke: var(--hud-accent);
  stroke-width: 2;
  stroke-dasharray: 6 5;
}

.area {
  fill: color-mix(in srgb, var(--hud-ink) 8%, transparent);
}

.stroke {
  fill: none;
  stroke: var(--hud-ink);
  stroke-width: 4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.dashed {
  stroke: var(--hud-accent);
  stroke-dasharray: 10 10;
}

.dot-latest {
  fill: var(--hud-accent);
  stroke: var(--hud-surface);
  stroke-width: 2;
}

.dot {
  fill: var(--hud-ink);
  stroke: var(--hud-surface);
  stroke-width: 2;
}
</style>
