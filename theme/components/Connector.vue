<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Right-angled line between two elements of the same slide, found by CSS selector.
// With v-click, the line draws itself from `from` to `to` when it appears.
// <Connector v-click from=".machine" to=".bug" />
// Elements meant to show up once the line is drawn take the `after-draw` class.
// The line is an overlay on the slide body: it takes no room in the layout.
type Side = 'top' | 'bottom' | 'left' | 'right'

const props = withDefaults(defineProps<{
  from: string
  to: string
  fromSide?: Side
  toSide?: Side
  color?: string
  width?: number
  duration?: number // drawing time, in ms
}>(), {
  fromSide: 'bottom',
  toSide: 'top',
  color: 'var(--hud-ink)',
  width: 3,
  duration: 900,
})

const root = ref<HTMLElement>()
const d = ref('')

function anchor(rect: DOMRect, side: Side) {
  switch (side) {
    case 'top': return [rect.left + rect.width / 2, rect.top]
    case 'bottom': return [rect.left + rect.width / 2, rect.bottom]
    case 'left': return [rect.left, rect.top + rect.height / 2]
    case 'right': return [rect.right, rect.top + rect.height / 2]
  }
}

function update() {
  const el = root.value
  const slide = el?.closest('.slidev-layout')
  const a = slide?.querySelector(props.from)
  const b = slide?.querySelector(props.to)
  if (!el || !a || !b)
    return
  // the slide is scaled to fit the window: convert screen pixels back to slide pixels
  const box = el.getBoundingClientRect()
  const scale = box.width / el.offsetWidth || 1
  const local = ([x, y]: number[]) => [(x - box.left) / scale, (y - box.top) / scale]
  const [x1, y1] = local(anchor(a.getBoundingClientRect(), props.fromSide))
  const [x2, y2] = local(anchor(b.getBoundingClientRect(), props.toSide))
  const vertical = props.fromSide === 'top' || props.fromSide === 'bottom'
  d.value = vertical
    ? `M${x1} ${y1}V${(y1 + y2) / 2}H${x2}V${y2}`
    : `M${x1} ${y1}H${(x1 + x2) / 2}V${y2}H${x2}`
}

let observer: ResizeObserver | undefined
// wait a frame so that elements placed after the connector in the slide exist too;
// the observer then follows size changes (images loading, slide shown from preload)
onMounted(() => requestAnimationFrame(() => {
  update()
  observer = new ResizeObserver(update)
  const slide = root.value?.closest('.slidev-layout')
  for (const sel of [props.from, props.to]) {
    const target = slide?.querySelector(sel)
    if (target)
      observer.observe(target)
  }
  if (root.value)
    observer.observe(root.value)
}))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="hud-connector" :style="{ '--draw-duration': `${duration}ms` }">
    <svg fill="none">
      <path :d="d" pathLength="1" :stroke="color" :stroke-width="width" />
    </svg>
  </div>
</template>

<style scoped>
.hud-connector {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hud-connector svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* hidden by v-click: keep the element visible, hide the line by its dash offset */
.hud-connector.slidev-vclick-hidden {
  opacity: 1 !important;
}

path {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--draw-duration) ease-in-out;
}

.slidev-vclick-hidden path {
  stroke-dashoffset: 1;
  transition-duration: 0s;
}
</style>
