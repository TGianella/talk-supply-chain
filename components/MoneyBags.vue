<script setup lang="ts">
// Two money bags (money), seen slightly from above like CardboardBoxes:
// body at 10% ink darkening to 20% on the right, opening at 20%, 3.5 outlines, tie in accent.
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'
const tie = 'color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))'

// one bag drawn around x = 0, bottom at y = 0, then placed with a translate and scale
const body = 'M-30 -150C-40 -120 -110 -100 -110 -50C-110 -10 -70 0 0 0C70 0 110 -10 110 -50C110 -100 40 -120 30 -150Z'
const dark = 'M30 -150C40 -120 110 -100 110 -50C110 -10 70 0 0 0C48 -8 76 -30 76 -60C76 -100 34 -122 22 -150Z'
const ruffle = 'M-26 -162C-40 -175 -58 -188 -46 -200H46C58 -188 40 -175 26 -162Z'

// back to front: big bag, then a smaller one in front on the right
const bags = [
  { x: 0, y: 0, k: 1 },
  { x: 125, y: 30, k: 0.7 },
]
</script>

<template>
  <svg viewBox="-125 -215 345 255" fill="none" stroke="var(--hud-ink)" stroke-linejoin="round" stroke-linecap="round">
    <g v-for="(b, i) in bags" :key="i" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`" :stroke-width="3.5 / b.k">
      <path :d="body" :fill="shade1" />
      <path :d="dark" :fill="shade2" stroke="none" />
      <path :d="body" />
      <path :d="ruffle" :fill="shade1" />
      <ellipse cx="0" cy="-200" rx="46" ry="12" :fill="shade2" />
      <rect x="-34" y="-166" width="68" height="18" rx="9" :fill="tie" />
      <text
        x="0" y="-48" text-anchor="middle"
        fill="var(--hud-ink)" stroke="none" style="font: 700 56px var(--hud-font-head)"
      >€</text>
    </g>
  </svg>
</template>
