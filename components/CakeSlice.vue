<script setup lang="ts">
// Slice of layer cake ("c'est du gâteau": easy), tip toward the viewer and turned to the left (the left cut is hidden), shaded like CardboardBoxes:
// icing and cream in --hud-bg, left cut at 10% ink, right cut at 20%, 3.5 outlines, cherry in accent.
import { axo, fit, pts } from './iso'

const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'
const cherry = 'color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))'

const { p } = axo(70, 30)
const R = 220
const H = 110
// the slice spans 40° around the direction pointing away from the viewer (225°)
const at = (deg: number, r = R) => [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)]
const [A, B] = [at(205), at(245)]
const arc = Array.from({ length: 9 }, (_, i) => at(205 + i * 5))

// a vertical cut face from the tip to `end`, between heights z0 and z1
const cut = (end: number[], z0: number, z1: number) =>
  pts(p(0, 0, z1), p(end[0], end[1], z1), p(end[0], end[1], z0), p(0, 0, z0))

const top = pts(p(0, 0, H), ...arc.map(([x, y]) => p(x, y, H)))
const faces = [
  { body: cut(A, 0, H), cream: cut(A, 0.34 * H, 0.62 * H), fill: shade1 },
  { body: cut(B, 0, H), cream: cut(B, 0.34 * H, 0.62 * H), fill: shade2 },
]

const r = 20
const [chx, chy] = at(225, 0.6 * R)
const [cx, cy] = p(chx, chy, H)
const viewBox = fit([...arc.flatMap(([x, y]) => [p(x, y, H), p(x, y, 0)]), p(0, 0, 0), [cx, cy - 2 * r - 30]])
</script>

<template>
  <svg :viewBox="viewBox" fill="none" stroke="var(--hud-ink)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <g v-for="(f, i) in faces" :key="i">
      <polygon :points="f.body" :fill="f.fill" />
      <polygon :points="f.cream" :fill="bg" stroke-width="2.5" />
    </g>
    <polygon :points="top" :fill="bg" />
    <path :d="`M${cx} ${cy - 2 * r + 2}Q${cx + 4} ${cy - 2 * r - 22} ${cx + 22} ${cy - 2 * r - 28}`" stroke-width="3" />
    <circle :cx="cx" :cy="cy - r + 4" :r="r" :fill="cherry" />
  </svg>
</template>
