<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, onMounted, onUnmounted } from 'vue'

// Decorative fingerprint (Material Symbols Light "fingerprint").
// `scan` adds the orange scan line, `minutiae` adds labelled analysis markers
// (pass `true` for the default labels, or an array of up to 5 labels).
// `loop` runs the scan as a waiting screen: the line sweeps down the print and each marker appears
// as the line passes it, then everything fades and starts again (static when exporting).
const props = withDefaults(defineProps<{
  size?: number
  tone?: 'faint' | 'pale' | 'muted'
  scan?: boolean
  minutiae?: boolean | string[]
  loop?: boolean
}>(), {
  size: 760,
  tone: 'faint',
})

const points = [
  [0.33, 0.2],
  [0.605, 0.355],
  [0.237, 0.671],
  [0.684, 0.711],
  [0.447, 0.882],
]

const markers = computed(() => {
  if (!props.minutiae)
    return []
  const labels = Array.isArray(props.minutiae) ? props.minutiae : ['M-03', 'M-07', 'M-11', 'M-14', 'M-16']
  return labels.slice(0, points.length).map((label, i) => ({ label, x: points[i][0], y: points[i][1] }))
})

const color = computed(() => ({ faint: '#bfcbdb', pale: '#d9e1eb', muted: '#7f93ad' })[props.tone])

// Scan loop, as offsets of the scan (DURATION, followed by PAUSE where nothing moves): the line sweeps from FROM to TO (fractions of the print's
// height) between SWEEP_START and SWEEP_END, fading in until FADE_IN and out from FADE_OUT on, so it
// is never seen standing still; the markers stay until EXIT_START then close one
// after the other, EXIT_STAGGER apart, in a scrambled order (EXIT_RANK: rank of each marker).
const DURATION = 8000
const PAUSE = 7000
const FROM = 0
const FADE_IN = 0.15
const TO = 1
const FADE_OUT = 0.88
const SWEEP_START = 0.04
const SWEEP_END = 0.38
const EXIT_START = 0.88
const EXIT_STAGGER = 0.012
const EXIT_RANK = [2, 4, 0, 3, 1]
const REST = 0.524 // static position of the line
const BAND = 0.184 // height of the trail above the line

const { $nav } = useSlideContext()
let scanEl: HTMLElement | undefined
const markerEls: HTMLElement[] = []
const animations: Animation[] = []

// time for the line to cover the trail's height, as an offset of the cycle
const TRAIL = BAND / (TO - FROM) * (SWEEP_END - SWEEP_START)
// offset in the cycle at which the line reaches y (fraction of the print's height)
const passes = (y: number) => SWEEP_START + (y - FROM) / (TO - FROM) * (SWEEP_END - SWEEP_START)

onMounted(() => {
  if (!props.loop || $nav.value.isPrintMode || !scanEl)
    return
  const at = (y: number) => `translateY(${y * props.size}px)`
  const timing = { duration: DURATION + PAUSE, iterations: Infinity }
  // offsets are written for DURATION; squeeze them so that the pause comes at the end of the cycle
  const loop = (frames: Keyframe[]) => frames.map(f => ({ ...f, offset: f.offset === 1 ? 1 : f.offset! * DURATION / (DURATION + PAUSE) }))
  animations.push(scanEl.animate(loop([
    { offset: 0, transform: at(FROM), opacity: 0 },
    { offset: SWEEP_START, transform: at(FROM), opacity: 0 },
    { offset: passes(FADE_IN), transform: at(FADE_IN), opacity: 1 },
    { offset: passes(FADE_OUT), transform: at(FADE_OUT), opacity: 1 },
    { offset: SWEEP_END, transform: at(TO), opacity: 0 },
    { offset: 1, transform: at(TO), opacity: 0 },
  ]), timing))
  // the trail is the distance covered: it grows from nothing as the line starts moving, until the
  // line has covered the band's height, then fades out with the line
  const band = scanEl.querySelector('.scan-band')
  if (band) {
    animations.push(band.animate(loop([
      { offset: 0, transform: 'scaleY(0)' },
      { offset: SWEEP_START, transform: 'scaleY(0)' },
      { offset: SWEEP_START + TRAIL, transform: 'scaleY(1)' },
      { offset: 1, transform: 'scaleY(1)' },
    ]), timing))
  }
  markers.value.forEach((m, i) => {
    const el = markerEls[i]
    if (!el)
      return
    // the marker opens in three steps (box, leader, label) from the pass of the line, and closes
    // in reverse, faster; `open` and `close` are [start, end] offsets of the cycle from p and q
    const p = passes(m.y)
    const q = EXIT_START + EXIT_RANK[i] * EXIT_STAGGER
    const step = (part: string, hidden: Keyframe, shown: Keyframe, open: number[], close: number[]) => {
      const target = el.querySelector(part)
      if (target) {
        animations.push(target.animate(loop([
          { ...hidden, offset: 0 },
          { ...hidden, offset: p + open[0] },
          { ...shown, offset: p + open[1] },
          { ...shown, offset: q + close[0] },
          { ...hidden, offset: q + close[1] },
          { ...hidden, offset: 1 },
        ]), timing))
      }
    }
    step('.box', { opacity: 0, transform: 'scale(1.6)' }, { opacity: 1, transform: 'scale(1)' }, [0, 0.012], [0.014, 0.022])
    step('.leader', { transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }, [0.012, 0.027], [0.008, 0.014])
    step('.label', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }, [0.027, 0.048], [0, 0.008])
  })
})

onUnmounted(() => animations.forEach(a => a.cancel()))
</script>

<template>
  <div class="hud-fingerprint" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 24 24" :style="{ color }" aria-hidden="true">
      <path fill="currentColor" d="M11.987 4.571q2.636 0 4.973 1.138q2.338 1.137 3.894 3.268q.136.167.083.314q-.053.145-.183.232t-.282.076t-.264-.176q-1.414-1.989-3.595-3.036T11.986 5.34q-2.425 0-4.569 1.067T3.854 9.423q-.131.187-.292.193q-.162.005-.293-.1q-.108-.087-.13-.217t.069-.272q1.569-2.086 3.87-3.271q2.3-1.185 4.909-1.185m0 2.35q3.336 0 5.732 2.223t2.396 5.506q0 1.209-.853 2.019q-.854.81-2.081.81q-1.217 0-2.101-.81t-.884-2.019q0-.863-.64-1.465q-.641-.6-1.531-.6q-.905 0-1.557.596q-.652.595-.652 1.469q0 2.483 1.475 4.146q1.476 1.664 3.751 2.314q.178.057.248.19t.02.284q-.05.133-.162.239t-.317.056q-2.523-.65-4.154-2.56t-1.63-4.669q0-1.211.88-2.023t2.1-.812t2.078.812t.86 2.023q0 .874.658 1.47t1.552.596t1.533-.601t.638-1.465q0-2.949-2.17-4.957q-2.168-2.009-5.18-2.009T6.831 9.7t-2.154 4.945q0 .61.141 1.524t.548 2.115q.055.167-.003.294q-.06.127-.22.202t-.302.005q-.139-.07-.195-.228q-.394-1.033-.566-1.976t-.172-1.93q0-3.284 2.384-5.506t5.696-2.223m.037-4.8q1.575 0 3.076.388q1.5.387 2.903 1.112q.205.106.233.252t-.027.283t-.202.198q-.146.062-.3-.025q-1.306-.733-2.747-1.086q-1.44-.352-2.945-.352q-1.48 0-2.899.375q-1.419.376-2.752 1.063q-.103.067-.255.024t-.214-.186t-.04-.276q.021-.133.163-.22q1.381-.769 2.906-1.16t3.1-.39m.001 7.245q2.286 0 3.913 1.524t1.627 3.76q0 .173-.106.279t-.28.106q-.141 0-.263-.106q-.12-.106-.12-.279q0-1.914-1.417-3.215t-3.355-1.3t-3.349 1.3t-1.41 3.213q0 2.066.719 3.488t2.069 2.882q.15.153.121.305t-.121.244q-.112.112-.263.122t-.283-.122q-1.417-1.511-2.215-3.133t-.797-3.785q0-2.235 1.622-3.76t3.908-1.523m-.05 4.9q.172 0 .28.115q.11.115.11.269q0 1.934 1.378 3.172t3.237 1.238q.246 0 .521-.025t.556-.075q.148-.031.253.043t.155.245q.05.153-.056.267t-.268.164q-.276.067-.595.109q-.318.04-.566.04q-2.168 0-3.776-1.472q-1.609-1.472-1.609-3.706q0-.154.105-.27q.105-.114.276-.114" />
    </svg>
    <div v-if="scan" :ref="el => scanEl = el as HTMLElement" class="scan" :style="{ transform: `translateY(${REST * size}px)` }">
      <i class="scan-band" :style="{ height: `${BAND * size}px` }" />
      <i class="scan-line" />
    </div>
    <div
      v-for="(m, i) in markers"
      :key="m.label"
      :ref="el => markerEls[i] = el as HTMLElement"
      class="minutia"
      :style="{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }"
    >
      <i class="box" /><i class="leader" /><span class="label">{{ m.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.hud-fingerprint {
  position: relative;
  pointer-events: none;
}

svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* the line sits at the top of .scan, moved down by translateY; the band trails above it */
.scan {
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
}

.scan-band {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  transform-origin: bottom;
  background: linear-gradient(to bottom, #c2410c00, #c2410c2e);
}

.scan-line {
  display: block;
  height: 4px;
  background: var(--hud-accent);
}

.minutia {
  position: absolute;
  display: flex;
  align-items: center;
  transform: translate(-14px, -50%);
}

.box {
  width: 28px;
  height: 28px;
  border: 3px solid var(--hud-accent);
}

.leader {
  transform-origin: left;
  width: 46px;
  height: 2px;
  background: var(--hud-accent);
}

.label {
  padding: 2px 8px;
  background: var(--hud-accent);
  color: var(--hud-surface);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  line-height: 1.3;
}
</style>
