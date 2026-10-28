<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, defineComponent, onMounted, provide, ref, useSlots, watch } from 'vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import SeriesChain from '../components/SeriesChain.vue'

// Changes told one by one, each kept as a card: title (h1) in the default slot, the cards (2 to 5 fit,
// on two rows: two per row up to four, bigger, 3 + 2 for five) from `cards`. Header like the defense layout: `series` names
// the themeConfig key of the chain at the top right (`platforms` by default), `label` prefixes the kicker
// ("Plateforme" by default), `actor` is the 1-based current one.
// A card with a slot ::window-n:: (n: its position, from 1) is presented in that window first: a click
// opens the window, the next one flies it onto the card, which folds it and appears (like <WindowRows>);
// a card without a window appears on a click of its own. More windows in ::window-n-2::, ::window-n-3::…
// each open at the click that closes the previous; the last one flies onto the card.
// `clicks` on a card keeps its windows open for more clicks, for steps inside them (a list, one number
// per window, or one number for all): a component in a window gets the click that opened it with
// inject('case-window-at') (a ref, as in the case layout) and counts its steps from there.
// Put the window itself in the slot: ::window-1::  <AppWindow title="github.blog · changelog">…</AppWindow>
// `img` (with `position`, its object-position) or the slot ::thumb-n:: fills the card's thumbnail.
// `reveal` is the click of the first step (1 by default); false shows every card, without the windows.
const props = withDefaults(defineProps<{
  status?: string
  series?: string
  label?: string
  actor?: number
  kicker?: string
  cards?: { label: string, date?: string, img?: string, position?: string, clicks?: number | number[] }[]
  reveal?: number | string | false
}>(), {
  series: 'platforms',
  label: 'Plateforme',
  cards: () => [],
  reveal: 1,
})

const slots = useSlots()
const { $clicks } = useSlideContext()

const pad = (n: number) => String(n).padStart(2, '0')
const kicker = computed(() => props.kicker ?? (props.actor ? `${props.label} ${pad(props.actor)}` : undefined))

// two (bigger) cards per row up to four, three for five
const cols = computed(() => props.cards.length > 4 ? 3 : Math.min(props.cards.length, 2))

// slots of the windows of card n: window-n, then window-n-2, window-n-3… while they exist
function windowSlots(n: number) {
  const names = slots[`window-${n}`] ? [`window-${n}`] : []
  for (let k = 2; names.length && slots[`window-${n}-${k}`]; k++)
    names.push(`window-${n}-${k}`)
  return names
}

// clicks of each card: its windows [open, close] one after the other (each opens at the click that
// closes the previous one), then the card at the close of the last (false: shown from the start)
const steps = computed(() => {
  let c = props.reveal === false ? 0 : +props.reveal
  return props.cards.map((card, i) => {
    if (props.reveal === false)
      return { windows: [], land: false as const }
    const windows = windowSlots(i + 1).map((slot, k) => {
      const extra = Array.isArray(card.clicks) ? card.clicks[k] ?? 0 : card.clicks ?? 0
      const open = c
      c += 1 + extra
      return { slot, at: [open, c] as [number, number] }
    })
    return { windows, land: c++ }
  })
})

// gives the content of a window the click that opened it (steps inside a window: see `clicks`)
const WindowScope = defineComponent({
  props: { at: { type: Number, required: true } },
  setup(p, { slots }) {
    provide('case-window-at', computed(() => p.at))
    return () => slots.default?.()
  },
})

// flight of the last window of each card onto it, in slide pixels: offsets from the body, measured without
// the transforms (the scale of the slide, the flight itself)
const body = ref<HTMLElement>()
const windowEls = ref<HTMLElement[]>([])
const cardEls = ref<HTMLElement[]>([])
const flights = ref<Record<string, string>[]>([])
function center(el: HTMLElement) {
  let x = el.offsetWidth / 2
  let y = el.offsetHeight / 2
  for (let e: HTMLElement | null = el; e && e !== body.value; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft
    y += e.offsetTop
  }
  return [x, y]
}
function measure() {
  flights.value = props.cards.map((_, i) => {
    const win = windowEls.value[i]
    const card = cardEls.value[i]
    if (!win || !card || !win.offsetWidth)
      return {}
    const [wx, wy] = center(win)
    const [cx, cy] = center(card)
    return {
      '--to-x': `${cx - wx}px`,
      '--to-y': `${cy - wy}px`,
      '--to-scale': String(card.offsetWidth / win.offsetWidth),
    }
  })
}
onMounted(measure)
watch($clicks, measure, { flush: 'post' })
</script>

<template>
  <div class="slidev-layout hud cards">
    <HudFrame :status="status" />
    <SeriesChain class="chain" :series="series" :actor="actor" />
    <div ref="body" class="hud-body">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
      <div class="grid">
        <div class="list" :style="{ '--cols': cols }" :data-cols="cols">
          <div
            v-for="(c, i) in cards"
            :key="i"
            :ref="el => cardEls[i] = el as HTMLElement"
            v-click="steps[i].land"
            class="card"
            :data-landing="steps[i].windows.length ? '' : undefined"
          >
            <div class="bar">
              <span class="id">C-{{ pad(i + 1) }}</span>
              <span v-if="c.date" class="date">{{ c.date }}</span>
            </div>
            <div v-if="c.img || $slots[`thumb-${i + 1}`]" class="thumb">
              <slot :name="`thumb-${i + 1}`">
                <img :src="c.img" alt="" :style="{ objectPosition: c.position }">
              </slot>
            </div>
            <div class="text">{{ c.label }}</div>
          </div>
        </div>
        <div class="windows">
          <template v-for="(s, i) in steps" :key="i">
            <div
              v-for="(w, k) in s.windows"
              :key="w.slot"
              :ref="el => { if (k === s.windows.length - 1) windowEls[i] = el as HTMLElement }"
              v-click="w.at"
              class="open-center card-window"
              :data-flies="k === s.windows.length - 1 ? '' : undefined"
              :data-closed="$clicks >= w.at[1] ? '' : undefined"
              :style="{ ...(k === s.windows.length - 1 ? flights[i] : {}), ...(k ? { '--enter-delay': '0.35s' } : {}) }"
            >
              <WindowScope :at="w.at[0]">
                <slot :name="w.slot" />
              </WindowScope>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.cards {
  --hud-top: 110px;
  --card-width: 533px;
  --card-gap: 40px;

  .hud-kicker {
    margin-bottom: 6px;
  }

  h1 {
    margin-bottom: 0;
  }

  .chain {
    position: absolute;
    top: 100px;
    right: var(--hud-gutter);
  }

  /* centered vertically under the title; the windows are centered over it too */
  .grid {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list:not([data-cols='3']) {
    --card-width: 700px;
    --thumb-height: 170px;
  }

  .list {
    width: calc(var(--cols) * var(--card-width) + (var(--cols) - 1) * var(--card-gap));
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--card-gap);
  }

  /* border drawn over the content (see AppWindow) */
  .list > .card {
    position: relative;
    width: var(--card-width);
    display: flex;
    flex-direction: column;
    background: var(--hud-surface);
  }

  .list > .card::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 3px solid var(--hud-ink);
    pointer-events: none;
  }

  .list > .card .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    padding: 0 16px;
    background: var(--hud-ink);
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-surface);
  }

  .list > .card .id {
    color: var(--hud-accent-bright);
  }

  .list > .card .thumb {
    height: var(--thumb-height, 150px);
    background: var(--hud-code);
  }

  .list > .card .thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .list > .card .text {
    flex: 1;
    display: flex;
    align-items: center;
    min-height: 120px;
    padding: 20px 24px;
    font-size: 30px;
    font-weight: 600;
    line-height: 1.2;
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

  /* open: the open-center transition (a window after the first of its card waits for the previous one
     to close), plus the way back from the card when stepping backward */
  .card-window.slidev-vclick-target:not(.slidev-vclick-hidden) {
    transition:
      --open-x 0.22s ease-in var(--enter-delay, 0s),
      --open-y 0.3s ease-out calc(0.2s + var(--enter-delay, 0s)),
      transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
      opacity 0.2s ease-out;
  }

  /* the last window of a card, closed forward: flies onto its card (centers matched, shrunk to its width)
     and folds as it lands; the others fold in place */
  .card-window[data-flies][data-closed].slidev-vclick-hidden {
    --open-x: 50%;
    --open-y: 49%;
    transform: translate(var(--to-x, 0px), var(--to-y, 0px)) scale(var(--to-scale, 0.2));
    transition:
      transform 0.5s cubic-bezier(0.5, 0, 0.3, 1),
      --open-y 0.18s ease-in 0.32s,
      --open-x 0.2s ease-out 0.48s;
  }

  /* a card presented in a window appears once the window has folded (0.68 s) */
  .list > .card[data-landing].slidev-vclick-target:not(.slidev-vclick-hidden) {
    transition: opacity 0.3s ease-out 0.7s;
  }
}
</style>
