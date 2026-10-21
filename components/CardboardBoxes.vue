<script setup lang="ts">
// Three isometric cardboard boxes, overlapping, drawn back to front.
// x, y: top corner of the lid; w: half-width of the lid; h: height of the sides.
const boxes = [
  { x: 230, y: 20, w: 100, h: 90 },
  { x: 140, y: 110, w: 110, h: 100 },
  { x: 290, y: 170, w: 90, h: 80 },
].map(({ x, y, w, h }) => {
  const T = [x, y], R = [x + w, y + w / 2], B = [x, y + w], L = [x - w, y + w / 2]
  const down = (p: number[]) => [p[0], p[1] + h]
  const pts = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ')
  const seamStart = [x - w / 2, y + w / 4]
  const seamEnd = [x + w / 2, y + (3 * w) / 4]
  return {
    top: pts(T, R, B, L),
    left: pts(L, B, down(B), down(L)),
    right: pts(B, R, down(R), down(B)),
    tape: pts(seamStart, seamEnd, [seamEnd[0], seamEnd[1] + h * 0.4]),
    seam: pts(seamStart, seamEnd),
    tapeWidth: w * 0.16,
  }
})
</script>

<template>
  <svg viewBox="0 0 400 360" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <g v-for="(b, i) in boxes" :key="i" stroke="var(--hud-ink)" stroke-width="3.5">
      <polygon :points="b.left" fill="color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))" />
      <polygon :points="b.right" fill="color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))" />
      <polygon :points="b.top" fill="var(--hud-bg)" />
      <polyline :points="b.tape" stroke="color-mix(in srgb, var(--hud-accent) 45%, var(--hud-bg))" :stroke-width="b.tapeWidth" stroke-linecap="butt" />
      <polyline :points="b.seam" stroke-width="2" />
    </g>
  </svg>
</template>
