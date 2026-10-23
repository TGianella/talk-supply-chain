<script lang="ts">
// Slidev remounts every slide when it switches between a view transition and a normal one (here, on
// the first click after a view transition). What a timeline showed last is kept per slide, so that
// once remounted it starts from there and still animates to the new state.
const memory = new Map<string, { state: 'idle' | 'sweep' | 'shown', zoomed: boolean, focused: string | null }>()
</script>

<script setup lang="ts">
// Timeline with a proportional time axis, that zooms on a period.
// At click `zoom`, the period widens to the full width, the events before it slide off to the left,
// the markers piled up in the period spread out along the axis, and their labels show.
// Going back plays the zoom out. Without `zoom`, the timeline doesn't zoom.
// At click `trail`, once zoomed, small dots pop from left to right around the axis after the events named
// in `trail-after` (default: the last one), up to the next event or the edge of the slide: scattered, denser
// right after the event, one every `trail-gap` px on average. The attacks go on.
// `highlights` single out events, one at a time: each one from its click `at` (0: from the start) until
// the next highlight or the zoom click, zoomed or not: the other events dim and a frame closes in on its
// label. A highlight can single out several events at once, with a list of names (without `morph`). With `morph`, its name takes that view-transition-name and its frame `<morph>-frame`, so that
// they morph into the elements of the next slide with the same names (both slides with
// `transition: view-transition`). Give that slide's frame `view-transition-class: focus-frame` too: its
// border then stays thin while it grows; and its text `view-transition-class: focus-text`,
// `display: inline-block` and `line-height: 1`: the text then scales without stretching, at the same size
// on both sides (styles below).
// A highlight from the start (`at` 0) with a morph is the slide you come back to from that event's slide:
// once the transition is over, the date and text of the label fade in and the highlight drops.
// <ZoomTimeline … :zoom="1" :highlights="[{ name: 'event-stream', morph: 'event-stream' }, { name: 'nx', at: 2, morph: 'nx' }]" />
// <ZoomTimeline zoom-from="2025-04-15" zoom-label="été 2025" :zoom="1" :events="[
//   { date: '2018-11-26', name: 'event-stream', text: 'Vol de bitcoins' },
//   { date: '2025-09-08', name: 'chalk, debug', text: '2,6 Md de téléchargements / semaine' },
// ]" />
// Dates are ISO ('2018-11-26'). Labels go in lanes above and below the axis, picked automatically;
// `lane` forces one (1, 2… above, -1, -2… below). `muted` is for events that are not attacks.
// The timeline spans the whole slide width (it bleeds into the gutters), the dates between the gutters.
// When the slide is entered, the timeline reveals itself from left to right: the axis draws itself,
// and the ticks, markers and labels show as it reaches them; the piled up markers stack one by one.
// Entered from the next slide, with `:reveal="false"`, or in the overview and the export, it shows at once.
import { useSlideContext } from '@slidev/client'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  events: { date: string, name: string, text?: string, lane?: number, muted?: boolean }[]
  from?: string // start of the timeline, defaults to January 1st of the first event's year
  to?: string // end of the timeline and of the zoomed period, defaults to January 1st after the last event
  zoomFrom: string
  zoomTo?: string
  zoomLabel?: string
  zoom?: number
  trail?: number
  trailAfter?: string[]
  trailGap?: number
  highlights?: { name: string | string[], at?: number, morph?: string }[]
  reveal?: boolean
}>(), { highlights: () => [], reveal: true, trailGap: 16 })

const SW = 1920 // slide width
const PAD = 120 // the time range maps to [PAD, SW - PAD]
const M = 20 // marker side
const STEP = 26 // vertical step between piled up markers
const BASE = 32 // from the axis to the first lane above
const BASE_DOWN = 64 // from the axis to the first lane below, under the scale
const LH = 96 // lane height (a label with a text is 84px tall)
const GAP = 32 // horizontal gap between two labels of a lane
const SWEEP = 4 // duration of the reveal, in s

// ISO date → decimal year
function year(iso: string) {
  const [y, m = 1, d = 1] = iso.split('-').map(Number)
  const start = Date.UTC(y, 0, 1)
  return y + (Date.UTC(y, m - 1, d) - start) / (Date.UTC(y + 1, 0, 1) - start)
}

const ts = props.events.map(e => year(e.date))
const a0 = props.from ? year(props.from) : Math.floor(Math.min(...ts))
const a1 = props.to ? year(props.to) : Math.floor(Math.max(...ts)) + 1
const b0 = year(props.zoomFrom)
const b1 = props.zoomTo ? year(props.zoomTo) : a1

// scales (px per year) before and after the zoom. The zoom interpolates the scale exponentially
// around the date p that keeps the same position in both views, at X: x = X + (t - p) * s0 * r^z
const s0 = (SW - 2 * PAD) / (a1 - a0)
const s1 = (SW - 2 * PAD) / (b1 - b0)
const p = (a0 * s0 - b0 * s1) / (s0 - s1)
const X = PAD + (p - a0) * s0
const x0 = (t: number) => PAD + (t - a0) * s0
const x1 = (t: number) => PAD + (t - b0) * s1

const month = new Intl.DateTimeFormat('fr', { month: 'short', timeZone: 'UTC' })
const day = (iso: string) => new Date(`${iso}T00:00:00Z`)

const items = props.events.map((e, i) => {
  const t = ts[i]
  const zoomed = t >= b0 && t <= b1
  const d = day(e.date)
  const date = zoomed ? `${d.getUTCDate()} ${month.format(d)}` : `${month.format(d)} ${d.getUTCFullYear()}`
  // rough label width: name in the title font 26px, mono date 18px, sans text 20px, plus the padding
  const w = 16 + Math.max(e.name.length * 14.6, date.length * 11.5, (e.text?.length ?? 0) * 10.4)
  return { ...e, i, t, zoomed, date, w, x: zoomed ? x1(t) : x0(t), level: 0, slot: 1, right: false }
})

// before the zoom, markers too close to each other pile up, each on the lowest free level
const levels: number[] = []
for (const it of [...items].sort((a, b) => a.t - b.t)) {
  const x = x0(it.t)
  let k = levels.findIndex(end => x - end >= M + 6)
  if (k < 0)
    k = levels.length
  levels[k] = x
  it.level = k
}

// bracket around the zoomed period, before the zoom: above the highest pile, with its label on top
const pile = Math.max(0, ...items.filter(it => it.zoomed).map(it => it.level))
const bracketH = pile * STEP + M / 2 + 20
// the bracket spans the period, widened to hold its markers whole, with a margin
const inside = items.filter(it => it.zoomed).map(it => x0(it.t))
const zoomL = Math.min(x0(b0), ...inside.map(x => x - M / 2 - 12))
const zoomR = Math.max(x0(b1), ...inside.map(x => x + M / 2 + 12))
const date0 = (x: number) => a0 + (x - PAD) / s0 // inverse of x0

// labels go in the first free lane, trying 1, -1, 2, -2…, on the right of their date or on its left.
// A lane is free when the label overlaps no label of that lane, and no pole crosses a label on its
// side: the pole of a farther lane goes through the nearer ones. Above the axis, the piles and the
// bracket take room too. Once all are placed, labels come down to the nearest lane still free.
type Box = { l: number, r: number, h: number }
type Item = typeof items[number]
const POLE = 16 // horizontal gap between a pole and a label it passes by
function place(list: Item[], obstacles: Box[]) {
  const span = (it: Item, right: boolean) => right ? [it.x - it.w, it.x] : [it.x, it.x + it.w]
  const placed = new Map<Item, { lane: number, l: number, r: number }>()

  const free = (it: Item, lane: number, right: boolean) => {
    const [l, r] = span(it, right)
    const near = (b: Box) => l < b.r + POLE && r > b.l - POLE // piles and bracket: thin, like poles
    const bottom = BASE + (lane - 1) * LH
    const clash = [...placed].some(([o, b]) => {
      if (o === it || Math.sign(b.lane) !== Math.sign(lane))
        return false
      if (b.lane === lane)
        return l < b.r + GAP && r > b.l - GAP
      if (Math.abs(b.lane) < Math.abs(lane)) // this pole through the other label
        return it.x > b.l - POLE && it.x < b.r + POLE
      return o.x > l - POLE && o.x < r + POLE // the other pole through this label
    })
    return !clash && !(lane > 0 && obstacles.some(b => b.h > bottom && near(b)))
  }
  const put = (it: Item, lane: number, right: boolean) => {
    const [l, r] = span(it, right)
    it.slot = lane
    it.right = right
    placed.set(it, { lane, l, r })
  }

  for (const it of [...list].sort((a, b) => b.x - a.x)) {
    const fits = (right: boolean) => right ? it.x - it.w > PAD / 2 : it.x + it.w < SW - PAD / 2
    // labels are placed from right to left: a label covering the dates of later events is checked
    // against their poles, but one covering earlier dates in the first lane would leave them no lane
    // on that side (from the second lane, they can still go under it)
    const clear = (right: boolean) => {
      const [l, r] = span(it, right)
      return !list.some(o => o.x < it.x && o.x > l - POLE && o.x < r + POLE)
    }
    const sides = [false, true].filter(fits)
    if (!sides.length)
      sides.push(it.x > SW / 2)
    const lanes = it.lane ? [it.lane] : [1, -1, 2, -2, 3, -3, 4, -4]
    const options = lanes.flatMap(lane => sides.map(right => ({ lane, right })))
    const pick = options.find(o => (Math.abs(o.lane) > 1 || clear(o.right)) && free(it, o.lane, o.right))
      ?? options.find(o => free(it, o.lane, o.right))
      ?? options[0]
    put(it, pick.lane, pick.right)
  }

  // the first pass can leave a label above an empty lane: bring it down while it fits
  for (let moved = true; moved;) {
    moved = false
    for (const it of list) {
      const side = Math.sign(it.slot)
      for (let k = 1; !it.lane && k < Math.abs(it.slot); k++) {
        if (free(it, k * side, it.right)) {
          put(it, k * side, it.right)
          moved = true
          break
        }
      }
    }
  }
}
place(items.filter(it => !it.zoomed), [
  ...items.filter(it => it.level > 0).map(it => ({ l: x0(it.t) - M / 2, r: x0(it.t) + M / 2, h: it.level * STEP + M / 2 })),
  ...(props.zoomLabel ? [{ l: zoomL, r: zoomR, h: bracketH + 40 }] : []),
])
place(items.filter(it => it.zoomed), [])

// trailing dots, zoomed: between an event and the next one (or the edge of the slide), at a distance from
// the event drawn from an exponential distribution cut at the next one (most of them in the first third),
// a little above or below the axis, less so farther away. Seeded, so that they stay put
const hotX = items.filter(it => it.zoomed).map(it => ({ name: it.name, x: x1(it.t) })).sort((a, b) => a.x - b.x)
let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const dots = hotX.flatMap((e, k) => {
  if (!(props.trailAfter ?? [hotX.at(-1)?.name]).includes(e.name))
    return []
  const L = (hotX[k + 1]?.x ?? SW + 20) - e.x - 24
  const lambda = L / 3.2
  return Array.from({ length: Math.max(0, Math.round(L / props.trailGap)) }, () => {
    const d = -lambda * Math.log(1 - rnd() * (1 - Math.exp(-L / lambda)))
    return { x: e.x + 22 + d, y: (rnd() * 2 - 1) * 11 * (1 - d / L / 2) }
  })
}).sort((a, b) => a.x - b.x)

// height: as many lanes as used above and below, and room for the bracket
const up = Math.max(0, ...items.map(it => it.slot))
const down = Math.max(0, ...items.map(it => -it.slot))
const axisY = Math.max(BASE + up * LH, bracketH + 48)
const height = axisY + (down ? BASE_DOWN + down * LH : 48)

// scale: years, and the months of the zoomed period (January shows the year)
const years: number[] = []
for (let y = Math.ceil(a0); y <= Math.floor(a1); y++)
  years.push(y)
const months: { t: number, label: string }[] = []
for (let y = Math.floor(b0); y <= Math.floor(b1); y++) {
  for (let m = 1; m < 12; m++) {
    const t = year(`${y}-${m + 1}-01`)
    if (t >= b0 && t <= b1)
      months.push({ t, label: month.format(Date.UTC(y, m, 1)) })
  }
}

// the reveal reaches a date when the axis, drawn over the slide width, gets to its position
const at = (t: number) => ({ '--dt': t - p, '--d': `${(x0(t) / SW) * SWEEP}s` })
const end = `${SWEEP + (pile + 1) * 0.12 + 0.3}s`

// idle: waiting for the slide, sweep: revealing, shown: everything visible, no animation.
// Leaving the slide resets it once the slide transition is over.
// The reveal uses animations: a hidden slide is display: none, and transitions don't run when it shows.
const { $page, $nav, $clicks, $renderContext } = useSlideContext()
const key = `${$renderContext.value}-${$page.value}`
const last = memory.get(key)
const live = computed(() => props.reveal && ($renderContext.value === 'slide' || $renderContext.value === 'presenter'))
const active = computed(() => live.value && $nav.value.currentSlideNo === $page.value)
const state = ref<'idle' | 'sweep' | 'shown'>(!live.value ? 'shown' : last && last.state !== 'idle' ? 'shown' : 'idle')
let reset: ReturnType<typeof setTimeout> | undefined
watch(active, (on) => {
  clearTimeout(reset)
  if (on && state.value === 'idle')
    state.value = $clicks.value > 0 ? 'shown' : 'sweep'
  else if (!on && live.value)
    reset = setTimeout(() => state.value = 'idle', 1000)
}, { immediate: true })

// clicks: the hidden steps in the template register them with the slide.
// A remounted timeline first shows its last state, computes its styles, then switches to the current
// one, so that the change transitions.
// coming back from the slide of the highlighted event: `arriving` during the transition (0.8s, as in
// the view transition styles below), `released` after it, until the slide is left
const onScreen = computed(() => ($renderContext.value === 'slide' || $renderContext.value === 'presenter')
  && $nav.value.currentSlideNo === $page.value)
const arriving = ref(false)
const released = ref(false)
let arrival: ReturnType<typeof setTimeout> | undefined

const zoomNow = computed(() => props.zoom != null && $clicks.value >= props.zoom)
// the highlight of the current click: the last one started, unless a later highlight or the zoom ended it
// each highlight goes by a key, its names joined
const marks = props.highlights
  .map(h => ({ at: 0, ...h, names: [h.name].flat(), key: [h.name].flat().join('\n') }))
  .sort((a, b) => a.at - b.at)
const ends = [...marks.map(h => h.at), ...(props.zoom != null ? [props.zoom] : [])]
const back = marks.find(h => h.at === 0 && h.morph) // the highlight you come back to
const focusNow = computed(() => {
  const c = $clicks.value
  const h = marks.findLast(h => c >= h.at)
  if (!h || ends.some(e => e > h.at && e <= c) || (h === back && released.value))
    return null
  return h.key
})
// whether an event is among those of a highlight key
const among = (key: string | null, name: string) => !!key && key.split('\n').includes(name)

watch(onScreen, (on) => {
  clearTimeout(arrival)
  released.value = false
  arriving.value = on && !!back && focusNow.value === back.key
  if (arriving.value) {
    arrival = setTimeout(() => {
      arriving.value = false
      released.value = true
    }, 800)
  }
})
const zoomed = ref(last?.zoomed ?? zoomNow.value)
const focused = ref(last ? last.focused : focusNow.value)
// the event styled as highlighted: the current one, or the last one while its highlight fades out
const shown = ref(focused.value)
watch(focused, f => f && (shown.value = f))
const morph = computed(() => marks.find(h => h.key === focused.value)?.morph)
const framed = new Set(marks.flatMap(h => h.names))
const root = ref<HTMLElement>()
onMounted(() => {
  root.value?.getBoundingClientRect()
  watch([zoomNow, focusNow], ([z, f]) => {
    zoomed.value = z
    focused.value = f
  }, { immediate: true })
})
watch([state, zoomed, focused], ([s, z, f]) => memory.set(key, { state: s, zoomed: z, focused: f }), { immediate: true })
</script>

<template>
  <div
    ref="root"
    class="zoom-timeline"
    :data-reveal="state"
    :data-zoomed="zoomed || undefined"
    :data-focus="focused || undefined"
    :data-arriving="arriving || undefined"
    :style="{ '--X': X, '--s0': s0, '--r': s1 / s0, 'height': `${height}px`, '--axis': `${axisY}px`, '--sweep': `${SWEEP}s` }"
  >
    <i v-for="h in marks.filter(h => h.at > 0)" :key="h.key" v-click="h.at" class="step" />
    <i v-if="zoom" v-click="zoom" class="step" />
    <div v-if="trail" v-click="trail" class="trail">
      <i v-for="(d, k) in dots" :key="k" class="dot" :style="{ left: `${d.x}px`, top: `calc(var(--axis) + ${d.y}px)`, '--k': k }" />
    </div>
    <i class="axis" />

    <!-- scale -->
    <div v-for="y in years" :key="y" class="at" :style="at(y)">
      <i class="tick" />
      <span class="scale">{{ y }}</span>
    </div>
    <div v-for="m in months" :key="m.t" class="at in" :style="at(m.t)">
      <i class="tick" />
      <span class="scale">{{ m.label }}</span>
    </div>

    <!-- zoomed period, before the zoom -->
    <div v-if="zoomLabel" class="dim">
      <div class="at out-fast" :style="{ ...at(date0(zoomL)), '--h': `${bracketH}px`, '--d': end }">
        <i class="bracket" />
        <span class="zoom-label">{{ zoomLabel }}</span>
      </div>
      <div class="at out-fast" :style="{ ...at(date0(zoomR)), '--h': `${bracketH}px`, '--d': end }">
        <i class="bracket end" />
      </div>
    </div>

    <!-- events -->
    <div
      v-for="it in items"
      :key="it.i"
      class="at"
      :class="{ hot: it.zoomed, muted: it.muted, focus: among(shown, it.name), dim: !among(shown, it.name) }"
      :style="{ ...at(it.t), '--level': it.level }"
    >
      <div
        class="flag"
        :class="[it.zoomed ? 'in' : 'out', it.slot > 0 ? 'up' : 'down', { right: it.right }]"
        :style="{ '--offset': `${it.slot > 0 ? BASE + (it.slot - 1) * LH : BASE_DOWN + (-it.slot - 1) * LH}px` }"
      >
        <div class="label">
          <span
            v-if="framed.has(it.name)"
            class="frame"
            :style="among(focused, it.name) && morph ? { viewTransitionName: `${morph}-frame`, viewTransitionClass: 'focus-frame' } : undefined"
          />
          <div class="date">{{ it.date }}</div>
          <div class="name">
            <span :style="among(focused, it.name) && morph ? { viewTransitionName: morph, viewTransitionClass: 'focus-text' } : undefined">{{ it.name }}</span>
          </div>
          <div v-if="it.text" class="text">{{ it.text }}</div>
        </div>
      </div>
      <i class="marker" />
    </div>
  </div>
</template>

<style>
/* registered so that it can be transitioned: 0 before the zoom, 1 after */
@property --z {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

/* view transitions, between the timeline and the slide of its highlighted event: slower than the default 0.25s */
::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 0.8s;
}

/* the event name morphing into a title: the snapshots scale with the height of the box, keeping their
   aspect ratio (jakearchibald.com/2024/view-transitions-handling-aspect-ratio-changes). Both boxes are
   inline blocks with line-height: 1, so their height is the font size and the letters match in size */
::view-transition-old(*.focus-text),
::view-transition-new(*.focus-text) {
  height: 100%;
  width: auto;
}

/* the highlight frame morphing into another slide's frame: the border is drawn on the transition box
   rather than on its snapshots, which would stretch it */
::view-transition-group(*.focus-frame) {
  box-sizing: border-box;
  border: 2px solid var(--hud-ink);
}

::view-transition-old(*.focus-frame),
::view-transition-new(*.focus-frame) {
  display: none;
}
</style>

<style scoped>
.zoom-timeline {
  --z: 0;
  position: relative;
  flex: none;
  margin: auto calc(-1 * var(--hud-gutter));
  overflow-x: clip;
  mask-image: linear-gradient(to right, transparent, #000 80px, #000 calc(100% - 80px), transparent);
  transition: --z 1.8s cubic-bezier(0.65, 0, 0.35, 1);
}

.zoom-timeline[data-zoomed] {
  --z: 1;
}

/* only there to count the clicks */
.step {
  display: none;
}

.axis {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--axis);
  height: 3px;
  margin-top: -1.5px;
  background: var(--hud-ink);
  transform-origin: left;
}

/* anchor at a date on the axis */
.at {
  position: absolute;
  left: 0;
  top: var(--axis);
  transform: translateX(calc((var(--X) + var(--dt) * var(--s0) * pow(var(--r), var(--z))) * 1px));
}

.tick {
  position: absolute;
  left: -1.5px;
  top: 0;
  width: 3px;
  height: 14px;
  background: var(--hud-ink);
}

.scale {
  position: absolute;
  top: 20px;
  transform: translateX(-50%);
  font-family: var(--hud-font-mono);
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--hud-muted);
}

/* what shows only once zoomed, or only before */
.in {
  opacity: clamp(0, var(--z) * 3 - 2, 1);
}

.out {
  opacity: clamp(0, 1 - var(--z) * 2.5, 1);
}

.out-fast {
  opacity: clamp(0, 1 - var(--z) * 4, 1);
}

.bracket {
  position: absolute;
  left: 0;
  bottom: -16px;
  width: 14px;
  height: calc(var(--h) + 16px);
  border: 3px solid var(--hud-accent);
  border-right: none;
}

.bracket.end {
  left: auto;
  right: 0;
  border: 3px solid var(--hud-accent);
  border-left: none;
}

.zoom-label {
  position: absolute;
  left: 0;
  bottom: calc(var(--h) + 12px);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--hud-accent);
}

/* markers pile up before the zoom, and settle on the axis as they spread */
.marker {
  position: absolute;
  z-index: 1;
  left: -10px;
  top: -10px;
  width: 20px; /* M */
  height: 20px;
  background: var(--hud-surface);
  box-shadow: inset 0 0 0 3px var(--hud-ink);
  transform: translateY(calc(var(--level) * -26px /* STEP */ * (1 - var(--z))));
}

.hot .marker {
  background: var(--hud-accent);
  box-shadow: none;
}

.muted .marker {
  box-shadow: inset 0 0 0 3px var(--hud-faint);
}

/* trailing dots: hidden until their click, then they pop one after the other. Outlined in the background
   color, so that overlapping dots stay apart */
.trail {
  position: absolute;
  inset: 0;
}

.dot {
  position: absolute;
  z-index: 1;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  background: var(--hud-accent);
  outline: 2px solid var(--hud-bg);
}

.trail:not(.slidev-vclick-hidden) .dot {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--k) * 0.03s) both;
}

/* label on a pole from the axis */
.flag {
  position: absolute;
  left: -1px;
  padding-left: 14px;
  border-left: 2px solid var(--hud-muted);
  white-space: nowrap;
}

.flag.up {
  bottom: 0;
  padding-bottom: var(--offset);
}

.flag.down {
  top: 0;
  padding-top: var(--offset);
}

.flag.right {
  left: auto;
  right: -1px;
  padding: 0 14px 0 0;
  border-left: none;
  border-right: 2px solid var(--hud-muted);
  text-align: right;
}

.flag.right.up {
  padding-bottom: var(--offset);
}

.flag.right.down {
  padding-top: var(--offset);
}

.hot .flag {
  border-color: var(--hud-accent);
}

.date {
  font-family: var(--hud-font-mono);
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.hot .date {
  color: var(--hud-accent);
}

.name {
  font-family: var(--hud-font-head); /* the title font: a name morphs into a slide title */
  font-weight: 700;
  font-size: 26px;
  line-height: 34px;
  color: var(--hud-ink);
}

/* its box is the text, one font size tall, for the morph into a title */
.name span {
  display: inline-block;
  line-height: 1;
}

.muted .name {
  color: var(--hud-muted);
}

.text {
  font-size: 20px;
  line-height: 26px;
  color: var(--hud-muted);
}

/* reveal: hidden before the slide is entered, then shown in order along the axis (--d);
   a label unrolls from the axis along its pole, a little after its marker
   (once unrolled, it isn't clipped any more, so that the highlight frame shows) */
[data-reveal='idle'] .axis {
  transform: scaleX(0);
}

[data-reveal='idle'] :is(.tick, .scale, .bracket, .zoom-label) {
  opacity: 0;
}

[data-reveal='idle'] .marker {
  scale: 0;
}

[data-reveal='idle'] .flag.up {
  clip-path: inset(100% 0 0 0);
}

[data-reveal='idle'] .flag.down {
  clip-path: inset(0 0 100% 0);
}

[data-reveal='sweep'] .axis {
  animation: draw var(--sweep) linear both;
}

[data-reveal='sweep'] :is(.tick, .scale, .bracket, .zoom-label) {
  animation: appear 0.3s var(--d) both;
}

[data-reveal='sweep'] .marker {
  animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--d) + var(--level) * 0.12s) both;
}

[data-reveal='sweep'] .flag.up {
  animation: unroll-up 0.5s ease-out calc(var(--d) + 0.2s + var(--level) * 0.12s) backwards;
}

[data-reveal='sweep'] .flag.down {
  animation: unroll-down 0.5s ease-out calc(var(--d) + 0.2s + var(--level) * 0.12s) backwards;
}

@keyframes draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pop {
  from { scale: 0; }
  to { scale: 1; }
}

@keyframes unroll-up {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0); }
}

@keyframes unroll-down {
  from { clip-path: inset(0 0 100% 0); }
  to { clip-path: inset(0); }
}

/* highlight: the other events dim, the highlighted one turns accent */
.dim {
  transition: opacity 0.5s;
}

[data-focus] .dim {
  opacity: 0.2;
}

.focus :is(.marker, .flag, .date, .name, .text) {
  transition: background-color 0.5s, box-shadow 0.5s, border-color 0.5s, color 0.5s, opacity 0.5s;
}

/* coming back to the timeline: only the name moves into place, the rest of the label fades in after */
[data-arriving] .focus :is(.date, .text) {
  opacity: 0;
}

[data-focus] .focus .marker {
  background: var(--hud-accent);
  box-shadow: none;
}

[data-focus] .focus .flag {
  border-color: var(--hud-accent);
}

[data-focus] .focus :is(.date, .name) {
  color: var(--hud-accent);
}

/* frame around the highlighted label, closing in on it. On the pole side it is wider, to hold the pole
   with some room (the pole is 15px from the label, the frame 16px beyond it): the pole goes in through
   the edge of the frame on the axis side and runs inside it */
.label {
  position: relative;
}

.frame {
  position: absolute;
  inset: -28px -30px -28px -47px;
  border: 2px solid var(--hud-ink);
  opacity: 0;
  pointer-events: none;
  transition: inset 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s;
}

.flag.right .frame {
  inset: -28px -47px -28px -30px;
}

[data-focus] .focus .frame {
  inset: -12px -14px -12px -31px;
  opacity: 1;
}

[data-focus] .focus .flag.right .frame {
  inset: -12px -31px -12px -14px;
}
</style>
