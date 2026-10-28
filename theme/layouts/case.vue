<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, defineComponent, onMounted, provide, ref, useSlots, watch } from 'vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import SubjectCard from '../components/SubjectCard.vue'

// One attack on a single slide: header (kicker, title and subtitle from the default slot),
// the package card on the left, the "mode opératoire" on the right, a short timeline at the bottom.
// `subject` takes the props of <SubjectCard> (shown compact); ::subject:: and ::modus:: replace
// the card and the right column.
// `reveal` (a click number) shows the card, the timeline and the heading of the right column at that click;
// then each row of `modus` is a step of its own:
//   - a click focuses its dates on the timeline (`at`: one date or a list, as written in `timeline`),
//   - a click opens its window, the content of the slot ::window-<n>:: (n: position of the row, from 1);
//     more windows in ::window-<n>-2::, ::window-<n>-3::… each open at the click that closes the previous,
//   - a click closes the (last) window and shows the row; the focus stays until the next step.
// A row without `at` or without a window skips that click. Without `reveal`, everything is shown.
// `clicks` on a row keeps its windows open for more clicks, for steps inside them (a list, one number per
// window, or one number for all): a component in the window gets the click that opened it with
// inject('case-window-at') (a ref) and counts its steps from there.
// Windows are opened with the `open-center` transition; put the window itself in the slot, e.g.
// ::window-1::  <AppWindow title="…">…</AppWindow>
// Closing forward, a window flies onto its row and folds as it lands, and the row appears;
// closing backward (before its opening click), it folds back like any open-center window.
// ::windows:: is a free layer over the slide body for other windows, stacked and centered, opened
// and closed with absolute clicks after the steps: <AppWindow v-click="[12, 13]" class="open-center">
const props = withDefaults(defineProps<{
  status?: string
  reveal?: number | string | false
  kicker?: string
  subject?: {
    header?: string
    flag?: string
    name: string
    meta?: string
    logo?: string
    fields?: { label: string, value: string, alert?: boolean }[]
  }
  modusLabel?: string
  modus?: { label: string, value: string, alert?: boolean, at?: string | string[], clicks?: number | number[] }[]
  timeline?: { date: string, label: string, hot?: boolean }[]
  cols?: string
}>(), {
  reveal: false,
  modusLabel: 'Mode opératoire',
  modus: () => [],
  timeline: () => [],
  cols: '760px 1fr',
})

const slots = useSlots()
const { $clicks } = useSlideContext()

const start = computed(() => props.reveal === false ? false : +props.reveal)
const atStart = computed(() => start.value)

// slots of the windows of step n: window-n, then window-n-2, window-n-3… while they exist
function windowSlots(n: number) {
  const names = slots[`window-${n}`] ? [`window-${n}`] : []
  for (let k = 2; names.length && slots[`window-${n}-${k}`]; k++)
    names.push(`window-${n}-${k}`)
  return names
}

// clicks of each step: focus of its dates, its windows [open, close] one after the other (each opens
// at the click that closes the previous one), its row (false: no such click)
const steps = computed(() => {
  let c = start.value === false ? 0 : start.value + 1
  return props.modus.map((m, i) => {
    const dates = m.at == null ? [] : [m.at].flat().map(String)
    if (start.value === false)
      return { dates, focus: false, windows: [], row: false } as const
    const focus = dates.length ? c++ : false
    const windows = windowSlots(i + 1).map((slot, k) => {
      const extra = Array.isArray(m.clicks) ? m.clicks[k] ?? 0 : m.clicks ?? 0
      const open = c
      c += 1 + extra
      return { slot, at: [open, c] as [number, number] }
    })
    return { dates, focus, windows, row: c++ }
  })
})

// the step whose dates are focused at the current click: from its focus click until the next focus
const focused = computed(() => {
  const step = steps.value.findLast(s => s.focus !== false && $clicks.value >= s.focus)
  return step?.dates ?? []
})

// gives the content of a window the click that opened it (steps inside a window: see `clicks`)
const WindowScope = defineComponent({
  props: { at: { type: Number, required: true } },
  setup(p, { slots }) {
    provide('case-window-at', computed(() => p.at))
    return () => slots.default?.()
  },
})

// States toggled by clicks on elements that also have a v-click go in data attributes: a :class
// binding rewrites the whole class attribute when it changes and drops the classes of v-click.

// flight of the last window of each step onto its row, in slide pixels: offsets from the slide body (the parent of the
// windows layer and the offset parent of the rows), measured without the scale of the slide
const rowEls = ref<HTMLElement[]>([])
const windowEls = ref<Record<number, HTMLElement>>({})
const flights = ref<Record<number, Record<string, string>>>({})
function measure() {
  const out: Record<number, Record<string, string>> = {}
  for (const [i, win] of Object.entries(windowEls.value)) {
    const row = rowEls.value[+i]
    if (!win || !row || !win.offsetWidth)
      continue
    const dx = row.offsetLeft + row.offsetWidth / 2 - (win.offsetLeft + win.offsetWidth / 2)
    const dy = row.offsetTop + row.offsetHeight / 2 - (win.offsetTop + win.offsetHeight / 2)
    out[+i] = {
      '--to-x': `${dx}px`,
      '--to-y': `${dy}px`,
      '--to-scale': String(Math.min(1, row.offsetWidth / win.offsetWidth)),
    }
  }
  flights.value = out
}
onMounted(measure)
watch($clicks, measure, { flush: 'post' })
</script>

<template>
  <div class="slidev-layout hud case">
    <HudFrame :status="status" />
    <div class="hud-body">
      <header>
        <Kicker v-if="kicker">{{ kicker }}</Kicker>
        <slot />
      </header>
      <div class="content">
        <div class="cols" :style="{ gridTemplateColumns: cols }">
          <div v-click="atStart" class="col">
            <slot name="subject">
              <SubjectCard v-if="subject" v-bind="subject" compact />
            </slot>
          </div>
          <div class="col">
            <slot name="modus">
              <template v-if="modus.length">
                <Kicker v-click="atStart">{{ modusLabel }}</Kicker>
                <div
                  v-for="(m, i) in modus"
                  :key="`${m.label}-${steps[i].row}`"
                  :ref="el => rowEls[i] = el as HTMLElement"
                  v-click="steps[i].row"
                  class="modus-row"
                  :data-landing="steps[i].windows.length ? '' : undefined"
                  :data-alert="m.alert ? '' : undefined"
                >
                  <span class="label">{{ m.label }}</span>
                  <span class="value" :class="{ alert: m.alert }">{{ m.value }}</span>
                </div>
              </template>
            </slot>
          </div>
        </div>
        <div v-if="timeline.length" v-click="atStart" class="timeline" :data-focusing="focused.length ? '' : undefined">
          <div
            v-for="t in timeline"
            :key="t.date"
            class="step"
            :class="{ hot: t.hot, focused: focused.includes(String(t.date)) }"
          >
            <div class="date"><i />{{ t.date }}</div>
            <div class="text">{{ t.label }}</div>
          </div>
        </div>
      </div>
      <div v-if="$slots.windows || steps.some(s => s.windows.length)" class="windows">
        <template v-for="(s, i) in steps" :key="i">
          <!-- keyed by their clicks too: v-click reads its value once, so a window remounts when its clicks
               change (on hot reload, after an edit of `clicks`) -->
          <template v-for="(w, k) in s.windows" :key="`${w.slot}-${w.at}`">
            <!-- the last window of a step flies onto its row; the next window waits for the previous to fold -->
            <div
              v-if="k === s.windows.length - 1"
              :ref="el => windowEls[i] = el as HTMLElement"
              v-click="w.at"
              class="open-center step-window"
              :data-closed="$clicks >= w.at[1] ? '' : undefined"
              :style="{ ...flights[i], '--enter-delay': k ? '0.4s' : undefined }"
            >
              <WindowScope :at="w.at[0]">
                <slot :name="w.slot" />
              </WindowScope>
            </div>
            <div v-else v-click="w.at" class="open-center" :style="{ '--enter-delay': k ? '0.4s' : undefined }">
              <WindowScope :at="w.at[0]">
                <slot :name="w.slot" />
              </WindowScope>
            </div>
          </template>
        </template>
        <slot name="windows" />
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.case {
  /* a taller header: through the variable, so that what is placed from the body (FocusTarget) follows */
  --hud-top: 116px;

  .hud-body {
    gap: 48px;
  }

  header .hud-kicker {
    margin-bottom: 6px;
  }

  header h1 {
    font-size: 104px;
    margin: 0;
  }

  header p {
    margin: 0;
    font-size: 34px;
    font-weight: 500;
    color: var(--hud-muted);
  }

  .content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .cols {
    flex: 1;
    min-height: 0;
    display: grid;
    gap: 120px;
    align-items: start;
  }

  .col .hud-kicker {
    margin-bottom: 22px;
  }

  /* label above value, marked by a vertical rule on the left: horizontal dividers would mix with the
     lines of the background grid */
  .modus-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 0 4px 24px;
    margin-bottom: 28px;
    border-left: 4px solid var(--hud-ink);
  }

  .modus-row[data-alert] {
    border-left-color: var(--hud-accent);
  }

  .modus-row .label {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
  }

  .modus-row .value {
    font-size: 30px;
    line-height: 1.25;
  }

  .modus-row .value.alert {
    color: var(--hud-accent);
    font-weight: 600;
  }

  .timeline {
    display: flex;
  }

  .windows {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    /* one cell the size of the body: the tallest window doesn't grow it, which would push the others down */
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
      --open-x 0.22s ease-in var(--enter-delay, 0s),
      --open-y 0.3s ease-out calc(0.2s + var(--enter-delay, 0s)),
      transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
      opacity 0.2s ease-out;
  }

  /* closed forward: flies onto its row (centers matched, shrunk to its width) and, as it lands, folds
     like an open-center window closing (to a thin strip, then nothing) */
  .step-window[data-closed].slidev-vclick-hidden {
    --open-x: 50%;
    --open-y: 49%;
    transform: translate(var(--to-x, 0px), var(--to-y, 0px)) scale(var(--to-scale, 0.5));
    transition:
      transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
      --open-y 0.18s ease-in 0.32s,
      --open-x 0.2s ease-out 0.48s;
  }

  /* the row of a window appears once the window has folded (0.68 s) */
  .modus-row[data-landing].slidev-vclick-target:not(.slidev-vclick-hidden) {
    transition: opacity 0.3s ease-out 0.7s;
  }

  .step {
    flex: 1;
    padding-top: 14px;
    border-top: 3px solid var(--hud-ink);
  }

  .step .date {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 0.1em;
  }

  .step .date i {
    width: 12px;
    height: 12px;
    background: currentColor;
  }

  .step .text {
    margin-top: 10px;
    font-size: 24px;
    line-height: 1.25;
    color: var(--hud-muted);
  }

  .step {
    transition: opacity 0.3s, border-color 0.3s;
  }

  .step .date,
  .step .text {
    transition: color 0.3s;
  }

  .step.hot {
    border-top-color: var(--hud-accent);
  }

  /* while a step of the mode opératoire is told: its dates in accent, the others dimmed */
  .timeline[data-focusing] .step:not(.focused) {
    opacity: 0.3;
  }

  .step.focused {
    border-top-color: var(--hud-accent);
  }

  .step.focused .date {
    color: var(--hud-accent);
  }

  .step.focused .text {
    color: var(--hud-ink);
  }

  .step.hot .date {
    color: var(--hud-accent);
  }
}
</style>
