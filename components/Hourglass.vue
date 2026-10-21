<script setup lang="ts">
// Hourglass nearly run out (scarcity), seen from slightly above like CardboardBoxes:
// round parts as 2:1 ellipses, tops in --hud-bg, sides at 10% ink darkening to 20% on the right,
// 3.5 outlines, sand in accent.
const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'
const sand = 'color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))'

const cx = 150
// disc of radius rx (on screen), top face centered at y, of thickness h
function disc(y: number, rx: number, h: number) {
  const ry = rx / 2
  const [l, r] = [cx - rx, cx + rx]
  return {
    top: { cx, cy: y, rx, ry },
    side: `M${l} ${y}V${y + h}A${rx} ${ry} 0 0 0 ${r} ${y + h}V${y}Z`,
    dark: `M${cx} ${y + ry}A${rx} ${ry} 0 0 0 ${r} ${y}V${y + h}A${rx} ${ry} 0 0 1 ${cx} ${y + h + ry}Z`,
  }
}
const top = disc(50, 110, 24)
const bottom = disc(310, 110, 24)

// four posts between the discs, on a circle of radius 95: two behind the glass, two in front
const posts = [-1, 1].flatMap(side => [-1, 1].map(depth => ({
  x: cx + side * 67,
  y0: 74 + depth * 34,
  y1: 310 + depth * 34,
  front: depth > 0,
  fill: side > 0 ? shade2 : shade1,
})))
const post = (x: number, y0: number, y1: number) =>
  `M${x - 7} ${y0}V${y1}A7 3.5 0 0 0 ${x + 7} ${y1}V${y0}Z`

const glass = 'M80 310C80 245 140 222 140 210C140 198 80 150 80 74H220C220 150 160 198 160 210C160 222 220 245 220 310A70 35 0 0 1 80 310Z'
</script>

<template>
  <svg viewBox="30 -10 240 410" fill="none" stroke="var(--hud-ink)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <!-- bottom disc -->
    <path :d="bottom.side" :fill="shade1" />
    <path :d="bottom.dark" :fill="shade2" stroke="none" />
    <path :d="bottom.side" />
    <ellipse v-bind="bottom.top" :fill="bg" />
    <!-- posts behind the glass -->
    <path v-for="(p, i) in posts.filter(p => !p.front)" :key="`b${i}`" :d="post(p.x, p.y0, p.y1)" :fill="p.fill" />
    <!-- glass, with the last grains: a little sand at the top, a thin stream, the pile below -->
    <path :d="glass" :fill="bg" />
    <path d="M94 132C98 158 110 176 122 186" stroke-width="3" :stroke="shade2" />
    <path d="M130 188A20 10 0 0 0 170 188C166 196 160 202 160 210H140C140 202 134 196 130 188Z" :fill="sand" stroke-width="2.5" />
    <ellipse cx="150" cy="188" rx="20" ry="10" :fill="sand" stroke-width="2.5" />
    <line x1="150" y1="210" x2="150" y2="282" stroke="var(--hud-accent)" stroke-width="2.5" />
    <path d="M86 308Q150 246 214 308A64 32 0 0 1 86 308Z" :fill="sand" stroke-width="2.5" />
    <!-- posts in front of the glass -->
    <path v-for="(p, i) in posts.filter(p => p.front)" :key="`f${i}`" :d="post(p.x, p.y0, p.y1)" :fill="p.fill" />
    <!-- top disc -->
    <path :d="top.side" :fill="shade1" />
    <path :d="top.dark" :fill="shade2" stroke="none" />
    <path :d="top.side" />
    <ellipse v-bind="top.top" :fill="bg" />
  </svg>
</template>
