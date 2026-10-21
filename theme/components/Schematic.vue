<script setup lang="ts">
// White outlined lab schematic, for the background of scene slides (CSI-style).
// <Schematic type="geometry" class="absolute" style="left: 1110px; top: -60px" :opacity="0.5" />
// They read on dark areas only: over the flashlight beam they disappear.
withDefaults(defineProps<{
  type?: 'molecule' | 'geometry' | 'table'
  opacity?: number
  rows?: string[][]
}>(), {
  type: 'geometry',
  opacity: 0.35,
  rows: () => [
    ['Éch.', 'RT', 'm/z', '%'],
    ['A-01', '3.42', '176.2', '98.1'],
    ['A-02', '4.07', '203.4', '61.7'],
    ['A-03', '5.88', '221.0', '12.4'],
    ['A-04', '7.15', '248.9', '4.0'],
  ],
})

const molecule = 'M150 128l53.7 31 0 62-53.7 31-53.7-31 0-62z m107.4 0l53.7 31 0 62-53.7 31-53.7-31 0-62z m-113.7 106.7l-29.3-16.9m0-55.6l29.3-16.9m155.6 27.8l0 33.8m-48.2 27.8l-29.3-16.9m-125.5-58.8l-54-31m215.1 0l0-62m53.7 155l54 31m0 0l54-31m0 0l54 31m-215.7-186l54-31m-48 31l54-31'
const geometry = 'M60 280a220 220 0 1 0 440 0 220 220 0 1 0-440 0m70 0a150 150 0 1 0 300 0 150 150 0 1 0-300 0m370 0l-22 0m21.2 19.2l-10-0.9m7.5 19.9l-9.9-1.7m5.7 20.4l-9.7-2.5m3.9 20.8l-9.4-3.4m2.1 21.2l-9.1-4.3m0.2 21.3l-19-11m8.7 27.2l-8.2-5.7m-3.5 20.9l-7.6-6.4m-5.3 20.6l-7.1-7.1m-7.1 20l-6.4-7.6m-8.8 19.3l-5.7-8.2m-10.5 18.5l-11-19m-6 27.9l-4.3-9.1m-13.5 16.4l-3.4-9.4m-14.9 15.2l-2.5-9.7m-16.2 13.9l-1.7-9.9m-17.3 12.4l-0.9-10m-18.3 10.8l0-22m-19.2 21.2l0.9-10m-19.9 7.5l1.7-9.9m-20.4 5.7l2.5-9.7m-20.8 3.9l3.4-9.4m-21.2 2.1l4.3-9.1m-21.3 0.2l11-19m-27.2 8.7l5.7-8.2m-20.9-3.5l6.4-7.6m-20.6-5.3l7.1-7.1m-20-7.1l7.6-6.4m-19.3-8.8l8.2-5.7m-18.5-10.5l19-11m-27.9-6l9.1-4.3m-16.4-13.5l9.4-3.4m-15.2-14.9l9.7-2.5m-13.9-16.2l9.9-1.7m-12.4-17.3l10-0.9m-10.8-18.3l22 0m-21.2-19.2l10 0.9m-7.5-19.9l9.9 1.7m-5.7-20.4l9.7 2.5m-3.9-20.8l9.4 3.4m-2.1-21.2l9.1 4.3m-0.2-21.3l19 11m-8.7-27.2l8.2 5.7m3.5-20.9l7.6 6.4m5.3-20.6l7.1 7.1m7.1-20l6.4 7.6m8.8-19.3l5.7 8.2m10.5-18.5l11 19m6-27.9l4.3 9.1m13.5-16.4l3.4 9.4m14.9-15.2l2.5 9.7m16.2-13.9l1.7 9.9m17.3-12.4l0.9 10m18.3-10.8l0 22m19.2-21.2l-0.9 10m19.9-7.5l-1.7 9.9m20.4-5.7l-2.5 9.7m20.8-3.9l-3.4 9.4m21.2-2.1l-4.3 9.1m21.3-0.2l-11 19m27.2-8.7l-5.7 8.2m20.9 3.5l-6.4 7.6m20.6 5.3l-7.1 7.1m20 7.1l-7.6 6.4m19.3 8.8l-8.2 5.7m18.5 10.5l-19 11m27.9 6l-9.1 4.3m16.4 13.5l-9.4 3.4m15.2 14.9l-9.7 2.5m13.9 16.2l-9.9 1.7m12.4 17.3l-10 0.9m-459.2 18.3l500 0m-250-250l0 500m0-250l163.5-147.2m-83.5 147.2a80 80 0 0 0-20.5-53.5m-209.5 243.5l300 0m-300-12l0 24m300-24l0 24'
const spectrum = 'M0 70l8-9.5 8-8 8-5.3 8-2 8 1.5 8 4.3 8 6.2 8 6.7 8 5.9 8-3.8 8-1.8 8 0.6 8 2.3 8 2.7 8-2.7 8-1.3 8 0.8 8 3.1 8-4.5 8-6.2 8-6.1 8-4.5 8-2 8 1.3 8 4.6 8-4.9 8 20.5 8-17.1 8-18.6 8-13.2 8-5.9 8 2 8 34.1 8 6.2 8 7.2 8 6.6 8-3.5 8-2.8 8-0.3 8 1.8 8 3 8 2.1 8-2 8-0.2 8 2.2 8-3.2 8-5.5 8-5.8 8-4.7 8-2.5 8 0.6 8 4 8 6.9 8 8.9 8-5.9 8-8.8 8-6.5 8-3.3 8 0.3 8 3.6 8 6.1 8 7.5 8 7.3 8-3 8-3.7 8-1.1 8 1.2 8 2.8 8 3.3 8 1.3'
</script>

<template>
  <div class="scene-schematic" :style="{ opacity }">
    <svg v-if="type === 'molecule'" width="560" height="380" viewBox="0 0 560 380" aria-hidden="true">
      <path :d="molecule" />
      <circle cx="257.4" cy="66" r="9" />
      <circle cx="473.1" cy="252" r="9" />
      <text x="-2" y="138" style="font-size: 22px">HO</text>
      <text x="321" y="40" style="font-size: 22px">O</text>
      <text x="223" y="76" style="font-size: 22px">N</text>
      <text x="487" y="262" style="font-size: 22px">NH₂</text>
      <text x="20" y="347" style="font-size: 16px">FIG. 03 — C₁₀H₁₂N₂O · M = 176.2 g/mol</text>
    </svg>
    <svg v-else-if="type === 'geometry'" width="560" height="560" viewBox="0 0 560 560" aria-hidden="true">
      <path :d="geometry" />
      <text x="372" y="254" style="font-size: 20px">42.7°</text>
      <text x="246" y="498" style="font-size: 18px">Ø 300</text>
      <text x="440" y="82" style="font-size: 16px">R 220</text>
    </svg>
    <div v-else class="table">
      <table>
        <tr v-for="(row, i) in rows" :key="i" :class="{ head: i === 0 }">
          <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
        </tr>
      </table>
      <svg width="560" height="80" viewBox="0 0 560 80" aria-hidden="true">
        <path :d="spectrum" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.scene-schematic {
  pointer-events: none;
  color: var(--scene-chalk);
}

svg {
  display: block;
  overflow: visible;
}

path {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

circle {
  fill: var(--scene-bg);
  stroke: currentColor;
  stroke-width: 3;
}

text {
  fill: currentColor;
  font-family: var(--hud-font-mono);
  letter-spacing: 1px;
}

.table {
  width: 560px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.scene-schematic .table table {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  border: 2px solid currentColor;
}

.scene-schematic .table td {
  padding: 8px 12px;
  border: 1px solid currentColor;
  font-family: var(--hud-font-mono);
  font-size: 16px;
  line-height: 1.3;
  color: currentColor;
}

.scene-schematic .table .head td {
  font-weight: 600;
  text-transform: uppercase;
}
</style>
