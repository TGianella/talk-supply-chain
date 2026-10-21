<script setup lang="ts">
// Columned government building with a flag (the state), shaded like CardboardBoxes:
// tops in --hud-bg, facade-side faces at 10% ink, right faces at 20%, 3.5 outlines, flag in accent.
// Seen mostly from the front (facade on +y), turned a little to show the right side.
import { axo, fit, prism, pts } from './iso'

const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'
const shadow = 'color-mix(in srgb, var(--hud-ink) 35%, var(--hud-bg))'
const flag = 'color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))'

const { p, ellipse, view } = axo(28, 22, 1.3)

// drawn back to front, bottom to top
const steps = [
  prism(p, [-16, 216], [-16, 136], [0, 12]),
  prism(p, [-8, 208], [-8, 128], [12, 24]),
  prism(p, [0, 200], [0, 120], [24, 36]),
]
// core set back from the facade, in shadow behind the columns
const core = prism(p, [10, 190], [0, 95], [36, 140])
// columns: cylinders on the front edge of the top step
const [rx, ry] = ellipse(9)
const columns = [20, 60, 100, 140, 180].map((x) => {
  const [cx, bottom] = p(x, 108, 36)
  const [, top] = p(x, 108, 140)
  return {
    body: `M${cx - rx} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`,
    dark: `M${cx + rx * 0.35} ${top}V${bottom + ry * 0.94}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`,
  }
})
const entablature = prism(p, [-4, 204], [-4, 124], [140, 166])
// gable roof, ridge running back from the facade; the left slope shows only if it faces the viewer
const [ex0, ex1, ey0, ey1, ez, rz] = [-4, 204, -4, 124, 166, 216]
const slope = Math.atan2(rz - ez, 100 - ex0)
const backVisible = -Math.sin(slope) * view[0] + Math.cos(slope) * view[2] > 0
const roofBack = pts(p(ex0, ey0, ez), p(ex0, ey1, ez), p(100, ey1, rz), p(100, ey0, rz))
const roofFront = pts(p(100, ey0, rz), p(100, ey1, rz), p(ex1, ey1, ez), p(ex1, ey0, ez))
const pediment = pts(p(ex0, ey1, ez), p(ex1, ey1, ez), p(100, ey1, rz))
const tympanum = pts(p(22, ey1, ez + 8), p(178, ey1, ez + 8), p(100, ey1, rz - 12))
// flag standing on the middle of the ridge, parallel to the facade
const pole = [p(100, 60, rz), p(100, 60, 292)]
const cloth = pts(p(100, 60, 290), p(150, 60, 292), p(150, 60, 264), p(100, 60, 262))

const viewBox = fit([
  ...[-16, 216].flatMap(x => [-16, 136].map(y => p(x, y, 0))),
  p(ex0, ey0, ez), p(ex1, ey0, ez), p(100, ey0, rz),
  pole[1], p(150, 60, 292),
])
</script>

<template>
  <svg :viewBox="viewBox" fill="none" stroke="var(--hud-ink)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <g v-for="(s, i) in steps" :key="i">
      <polygon :points="s.top" :fill="bg" />
      <polygon :points="s.left" :fill="shade1" />
      <polygon :points="s.right" :fill="shade2" />
    </g>
    <polygon :points="core.left" :fill="shadow" />
    <polygon :points="core.right" :fill="shade2" />
    <g v-for="(c, i) in columns" :key="i">
      <path :d="c.body" :fill="shade1" />
      <path :d="c.dark" :fill="shade2" stroke="none" />
      <path :d="c.body" />
    </g>
    <polygon :points="entablature.left" :fill="shade1" />
    <polygon :points="entablature.right" :fill="shade2" />
    <polygon v-if="backVisible" :points="roofBack" :fill="bg" />
    <polygon :points="roofFront" :fill="shade2" />
    <polygon :points="pediment" :fill="shade1" />
    <polygon :points="tympanum" stroke-width="2" opacity=".3" />
    <line :x1="pole[0][0]" :y1="pole[0][1]" :x2="pole[1][0]" :y2="pole[1][1]" />
    <polygon :points="cloth" :fill="flag" />
  </svg>
</template>
