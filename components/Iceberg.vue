<script setup lang="ts">
// Iceberg (a visible tip, a much larger mass below), shaded like the other illustrations:
// tip in faceted ridges alternating --hud-bg and 20% ink, submerged mass as one angular 10% shape without ridges,
// darkening to 20% on the right, 3.5 outlines, no stroke along the waterline.
const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'

const pts = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ')

// 30% of the height above the water (10 to 130), 70% below (130 to 415)
const water = 130

// tip: a main peak and a lower one, each split by a ridge running down to the water
const [left, right] = [[95, water], [310, water]]
const [peak, valley, peak2] = [[175, 10], [222, 58], [255, 52]]
const foot = [[185, water], [240, water], [275, water]]
const tip = [
  { points: pts(left, peak, foot[0]), fill: bg },
  { points: pts(peak, valley, foot[1], foot[0]), fill: shade2 },
  { points: pts(valley, peak2, foot[2], foot[1]), fill: bg },
  { points: pts(peak2, right, foot[2]), fill: shade2 },
]
const ridges = [[peak, foot[0]], [valley, foot[1]], [peak2, foot[2]]]

// submerged mass: open outline from the right end of the waterline around to the left one,
// first following the slopes of the tip, then widening and narrowing to a point near the bottom
const below = [right, [345, 185], [365, 250], [330, 320], [240, 415], [170, 370], [90, 310], [45, 240], [60, 190], left]
const shadow = [right, [345, 185], [365, 250], [330, 320], [240, 415], [285, 320], [315, 250], [300, 185], [285, 130]]

// waterline: small waves across the whole width
const waves = `M0 ${water}` + 'q10 -5 20 0t20 0'.repeat(10)
</script>

<template>
  <svg viewBox="-4 0 408 420" fill="none" stroke="var(--hud-ink)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <polygon :points="pts(...below)" :fill="shade1" stroke="none" />
    <polygon :points="pts(...shadow)" :fill="shade2" stroke="none" />
    <polyline :points="pts(...below)" />
    <polygon v-for="(f, i) in tip" :key="i" :points="f.points" :fill="f.fill" stroke="none" />
    <polyline :points="pts(left, peak, valley, peak2, right)" />
    <polyline v-for="(r, i) in ridges" :key="`r${i}`" :points="pts(...r)" />
    <path :d="waves" />
  </svg>
</template>
