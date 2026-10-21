<script setup lang="ts">
// Target with a crosshair (military objectives), seen straight on and flat.
// Rings in --hud-bg and 10% ink like CardboardBoxes' faces, 3.5 outlines, bullseye in accent.
const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const bullseye = 'color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))'

const rings = [
  { r: 180, fill: shade1 },
  { r: 135, fill: bg },
  { r: 90, fill: shade1 },
  { r: 45, fill: bullseye },
]
</script>

<template>
  <svg viewBox="-190 -190 380 380" fill="none" stroke="var(--hud-ink)" stroke-width="3.5" stroke-linecap="round">
    <circle v-for="ring in rings" :key="ring.r" :r="ring.r" :fill="ring.fill" />
    <!-- crosshair, open around the bullseye -->
    <g stroke-width="3">
      <line x1="-180" y1="0" x2="-56" y2="0" />
      <line x1="56" y1="0" x2="180" y2="0" />
      <line x1="0" y1="-180" x2="0" y2="-56" />
      <line x1="0" y1="56" x2="0" y2="180" />
    </g>
  </svg>
</template>
