<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onMounted, onUnmounted } from 'vue'

// Wraps content in four HUD corner brackets.
// `lock` plays a focus lock every PERIOD, on its own cycle: the corners leave outward and vanish,
// then come back from further out, snap onto the content and blink (static when exporting).
const props = withDefaults(defineProps<{
  size?: number
  thickness?: number
  padding?: string
  lock?: boolean
}>(), {
  size: 48,
  thickness: 6,
  padding: '48px',
})

// Focus lock, in ms from its start: the corners leave by LEAVE px while fading out until GONE, wait
// hidden until BACK, come in from ARRIVE px out and land at SNAP, then blink twice; it all lasts LOCK.
// The first lock plays FIRST ms after the slide shows, then one every PERIOD.
const LEAVE = 24
const ARRIVE = 64
const GONE = 280
const BACK = 380
const SNAP = 680
const LOCK = 960
const PERIOD = 11000
const FIRST = 4000

const { $nav } = useSlideContext()
const corners: Record<string, HTMLElement> = {}
const animations: Animation[] = []

onMounted(() => {
  if (!props.lock || $nav.value.isPrintMode)
    return
  const at = (ms: number) => ms / PERIOD
  const directions = { tl: [-1, -1], tr: [1, -1], bl: [-1, 1], br: [1, 1] }
  for (const [corner, [x, y]] of Object.entries(directions)) {
    const out = (d: number) => `translate(${x * d}px, ${y * d}px)`
    animations.push(corners[corner].animate([
      { offset: 0, transform: 'none', opacity: 1, easing: 'ease-in' },
      { offset: at(GONE), transform: out(LEAVE), opacity: 0 },
      { offset: at(BACK), transform: out(ARRIVE), opacity: 0, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
      { offset: at(SNAP), transform: 'none', opacity: 1 },
      { offset: at(SNAP + 60), opacity: 0.25 },
      { offset: at(SNAP + 120), opacity: 1 },
      { offset: at(SNAP + 180), opacity: 0.25 },
      { offset: at(LOCK - 20), opacity: 1 },
      { offset: 1, transform: 'none', opacity: 1 },
    ], {
      duration: PERIOD,
      iterations: Infinity,
      delay: FIRST,
    }))
  }
})

onUnmounted(() => animations.forEach(a => a.cancel()))
</script>

<template>
  <div
    class="hud-corners"
    :style="{ '--size': `${size}px`, '--thickness': `${thickness}px`, 'padding': padding }"
  >
    <i v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" :ref="el => corners[c] = el as HTMLElement" :class="c" />
    <slot />
  </div>
</template>

<style scoped>
.hud-corners {
  position: relative;
}

i {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border: 0 solid var(--hud-accent);
  pointer-events: none;
}

.tl { top: 0; left: 0; border-top-width: var(--thickness); border-left-width: var(--thickness); }
.tr { top: 0; right: 0; border-top-width: var(--thickness); border-right-width: var(--thickness); }
.bl { bottom: 0; left: 0; border-bottom-width: var(--thickness); border-left-width: var(--thickness); }
.br { bottom: 0; right: 0; border-bottom-width: var(--thickness); border-right-width: var(--thickness); }
</style>
