<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onMounted, ref, watch } from 'vue'
import { withBase } from '../theme/utils/base'

// Points told one by one: each opens as a large photo window over the area, then on the next click the
// window flies onto the thumbnail of its row and folds as it lands, and the row (label, short statement)
// appears. Like the windows of the case layout, two clicks per row, from `at`.
// <WindowRows :at="5" :rows="[{ label: 'Rareté', value: 'Des années pour une seule cible', img: '/photos/x.jpg', title: 'rarete.jpg' }]" />
// ::window-n:: replaces the window of row n (put the AppWindow in it), ::thumb-n:: its thumbnail.
// `alert` puts the row in accent; `position` crops the photo (object-position, e.g. 'top'), window and thumbnail;
// `fit` sizes the window to the photo's own aspect ratio (same height) instead of cropping it;
// `credit` is shown in the bottom-right corner of the photo.
const props = defineProps<{
  at: number
  rows: { label: string, value: string, img?: string, title?: string, alert?: boolean, position?: string, fit?: boolean, credit?: string }[]
}>()

const { $clicks } = useSlideContext()

const opens = (i: number) => props.at + 2 * i
const lands = (i: number) => props.at + 2 * i + 1

// flight of each window onto its thumbnail, in slide pixels: offsets from the root, measured without
// the transforms (the scale of the slide, the flight itself)
const root = ref<HTMLElement>()
const windowEls = ref<HTMLElement[]>([])
const thumbEls = ref<HTMLElement[]>([])
const flights = ref<Record<string, string>[]>([])
function center(el: HTMLElement) {
  let x = el.offsetWidth / 2
  let y = el.offsetHeight / 2
  for (let e: HTMLElement | null = el; e && e !== root.value; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft
    y += e.offsetTop
  }
  return [x, y]
}
function measure() {
  flights.value = props.rows.map((_, i) => {
    const win = windowEls.value[i]
    const thumb = thumbEls.value[i]
    if (!win || !thumb || !win.offsetWidth)
      return {}
    const [wx, wy] = center(win)
    const [tx, ty] = center(thumb)
    return {
      '--to-x': `${tx - wx}px`,
      '--to-y': `${ty - wy}px`,
      '--to-scale': String(thumb.offsetWidth / win.offsetWidth),
    }
  })
}
onMounted(measure)
watch($clicks, measure, { flush: 'post' })
</script>

<template>
  <div ref="root" class="window-rows">
    <div class="rows">
      <div
        v-for="(r, i) in rows"
        :key="i"
        v-click="lands(i)"
        class="row"
        :data-alert="r.alert ? '' : undefined"
      >
        <div :ref="el => thumbEls[i] = el as HTMLElement" class="thumb">
          <slot :name="`thumb-${i + 1}`">
            <img v-if="r.img" :src="withBase(r.img)" alt="" :style="{ objectPosition: r.position }">
          </slot>
        </div>
        <div class="text">
          <span class="label">{{ String(i + 1).padStart(2, '0') }} · {{ r.label }}</span>
          <span class="value">{{ r.value }}</span>
        </div>
      </div>
    </div>
    <div class="windows">
      <div
        v-for="(r, i) in rows"
        :key="i"
        :ref="el => windowEls[i] = el as HTMLElement"
        v-click="[opens(i), lands(i)]"
        class="open-center step-window"
        :data-closed="$clicks >= lands(i) ? '' : undefined"
        :style="flights[i]"
      >
        <slot :name="`window-${i + 1}`">
          <AppWindow :title="r.title ?? r.label">
            <img :src="withBase(r.img)" alt="" class="photo" :data-fit="r.fit ? '' : undefined" :style="{ objectPosition: r.position }">
            <div v-if="r.credit" class="credit">{{ r.credit }}</div>
          </AppWindow>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.window-rows {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* centered vertically in the area */
.rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 60px;
}

.row {
  display: flex;
  align-items: center;
  gap: 48px;
}

/* border drawn over the image (see AppWindow) */
.thumb {
  position: relative;
  flex: none;
  width: 240px;
  height: 150px;
  background: var(--hud-faint);
}

.thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid var(--hud-ink);
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-body);
  font-weight: 600;
  font-size: 52px;
  line-height: 1.15;
  color: var(--hud-ink);
}

.row[data-alert] .label,
.row[data-alert] .value {
  color: var(--hud-accent);
}

.photo {
  display: block;
  width: 1200px;
  height: 600px;
  object-fit: cover;
}

.photo[data-fit] {
  width: auto;
}

/* small label in the bottom-right corner of the photo, on the window's border */
.credit {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 7px 14px 6px;
  background: color-mix(in srgb, var(--hud-surface) 80%, transparent);
  backdrop-filter: blur(8px);
  font-family: var(--hud-font-mono);
  font-size: 16px;
  color: var(--hud-ink);
}

.windows {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
  pointer-events: none;
}

.windows > * {
  grid-area: 1 / 1;
  pointer-events: auto;
}

/* open: the open-center transition, plus the way back from the row when stepping backward */
.step-window.slidev-vclick-target:not(.slidev-vclick-hidden) {
  transition:
    --open-x 0.22s ease-in,
    --open-y 0.3s ease-out 0.2s,
    transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
    opacity 0.2s ease-out;
}

/* closed forward: flies onto its thumbnail (centers matched, shrunk to its width) and folds as it lands */
.step-window[data-closed].slidev-vclick-hidden {
  --open-x: 50%;
  --open-y: 49%;
  transform: translate(var(--to-x, 0px), var(--to-y, 0px)) scale(var(--to-scale, 0.2));
  transition:
    transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
    --open-y 0.18s ease-in 0.32s,
    --open-x 0.2s ease-out 0.48s;
}

/* the row appears once the window has folded (0.68 s) */
.row.slidev-vclick-target:not(.slidev-vclick-hidden) {
  transition: opacity 0.3s ease-out 0.7s;
}
</style>
