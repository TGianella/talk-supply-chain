<script setup lang="ts">
// Cut diamond in the same shaded style as CardboardBoxes:
// light facets in --hud-bg, 10% and 20% ink tints toward the right and bottom.
const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'

// table corners (top), girdle points (widest line), culet (bottom tip)
const t = [[70, 40], [170, 40]]
const g = [30, 75, 120, 165, 210].map(x => [x, 90])
const c = [120, 190]

const pts = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ')
const facets = [
  // crown
  { points: pts(g[0], t[0], g[1]), fill: shade1 },
  { points: pts(t[0], g[2], g[1]), fill: bg },
  { points: pts(t[0], t[1], g[2]), fill: bg },
  { points: pts(t[1], g[3], g[2]), fill: shade1 },
  { points: pts(t[1], g[4], g[3]), fill: shade2 },
  // pavilion
  { points: pts(g[0], g[1], c), fill: shade1 },
  { points: pts(g[1], g[2], c), fill: shade1 },
  { points: pts(g[2], g[3], c), fill: shade2 },
  { points: pts(g[3], g[4], c), fill: shade2 },
]
</script>

<template>
  <svg viewBox="0 20 240 190" fill="none" stroke-linejoin="round">
    <polygon
      v-for="(f, i) in facets" :key="i"
      :points="f.points" :fill="f.fill"
      stroke="var(--hud-ink)" stroke-width="3.5"
    />
  </svg>
</template>
