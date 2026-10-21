<script setup lang="ts">
// Padlock in the same shaded style as CardboardBoxes:
// light top face, front at 10% ink, side at 20% ink, 3.5 outlines.
// `open` lifts the shackle out of the left hole.
const props = defineProps<{ open?: boolean }>()
const ink = 'var(--hud-ink)'
const bg = 'var(--hud-bg)'
const shade1 = 'color-mix(in srgb, var(--hud-ink) 10%, var(--hud-bg))'
const shade2 = 'color-mix(in srgb, var(--hud-ink) 20%, var(--hud-bg))'
const plates = [160, 192, 224, 256]
const rivets = [[44, 144], [180, 144], [44, 264], [180, 264]]
const holes = [72, 168]
const lift = props.open ? 28 : 0
const shackle = `M72 ${122 - lift}V${80 - lift}a48 48 0 0 1 96 0v${42 + lift}`
const highlight = `M78 ${122 - lift}V${80 - lift}a42 42 0 0 1 14-31`
const empty = 'color-mix(in srgb, var(--hud-ink) 45%, var(--hud-bg))'
</script>

<template>
  <svg viewBox="0 -30 240 330" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <g :stroke="ink" stroke-width="3.5">
      <!-- body: top, side, front -->
      <polygon points="28,128 196,128 212,116 44,116" :fill="bg" />
      <polygon points="196,128 212,116 212,268 196,280" :fill="shade2" />
      <polygon points="28,128 196,128 196,280 28,280" :fill="shade1" />
      <!-- holes in the top face -->
      <ellipse
        v-for="cx in holes" :key="cx"
        :cx="cx" cy="122" rx="17" ry="4"
        :fill="open && cx === holes[0] ? empty : shade2"
      />
    </g>
    <!-- shackle: dark tube with a shaded core, legs ending at the center of each hole -->
    <path :d="shackle" :stroke="ink" stroke-width="28" stroke-linecap="butt" />
    <path :d="shackle" :stroke="shade2" stroke-width="21" stroke-linecap="butt" />
    <path :d="highlight" :stroke="bg" stroke-width="4" stroke-linecap="butt" />
    <!-- free end of the shackle when open -->
    <ellipse v-if="open" :cx="holes[0]" :cy="122 - lift" rx="14" ry="3.5" :fill="shade2" :stroke="ink" stroke-width="3.5" />
    <!-- front lip of each hole the shackle goes into -->
    <path
      v-for="cx in (open ? holes.slice(1) : holes)" :key="cx"
      :d="`M${cx - 17} 122a17 4 0 0 0 34 0`"
      :stroke="ink" stroke-width="3.5" :fill="shade2"
    />
    <line
      v-for="y in plates" :key="y"
      x1="34" :y1="y" x2="190" :y2="y"
      :stroke="ink" stroke-width="2" opacity=".3"
    />
    <circle v-for="([cx, cy], i) in rivets" :key="i" :cx="cx" :cy="cy" r="5" :fill="shade2" :stroke="ink" stroke-width="2.5" />
    <!-- keyhole plate -->
    <circle cx="112" cy="204" r="38" :fill="bg" :stroke="ink" stroke-width="3.5" />
    <path d="M112 184a12 12 0 0 1 7 21.8l5 18.2h-24l5-18.2a12 12 0 0 1 7-21.8z" :fill="ink" />
  </svg>
</template>
