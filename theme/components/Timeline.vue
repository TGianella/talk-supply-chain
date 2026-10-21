<script setup lang="ts">
import { computed } from 'vue'

// Horizontal timeline. Events marked `hot` are drawn in accent color;
// `highlight` adds a labelled bracket above the hot events (they should be consecutive).
// <Timeline highlight="3 incidents en 3 semaines" :events="[
//   { date: '2018', name: 'event-stream', text: 'Vol de portefeuilles bitcoin' },
//   { date: 'sept. 2025', name: 'Shai-Hulud', text: 'Ver auto-réplicant', hot: true },
// ]" />
const props = defineProps<{
  events: { date: string, name: string, text?: string, hot?: boolean }[]
  highlight?: string
}>()

const hotRange = computed(() => {
  const idx = props.events.map((e, i) => (e.hot ? i : -1)).filter(i => i >= 0)
  return idx.length ? [idx[0] + 1, idx[idx.length - 1] + 2] : null
})
</script>

<template>
  <div class="hud-timeline" :style="{ gridTemplateColumns: `repeat(${events.length}, 1fr)` }">
    <div
      v-if="highlight && hotRange"
      class="bracket"
      :style="{ gridColumn: `${hotRange[0]} / ${hotRange[1]}` }"
    >
      <span>{{ highlight }}</span>
    </div>
    <i class="axis" />
    <template v-for="(e, i) in events" :key="i">
      <div class="date" :class="{ hot: e.hot }" :style="{ gridColumn: i + 1 }">{{ e.date }}</div>
      <i class="marker" :class="{ hot: e.hot }" :style="{ gridColumn: i + 1 }" />
      <div class="name" :class="{ hot: e.hot }" :style="{ gridColumn: i + 1 }">{{ e.name }}</div>
      <div v-if="e.text" class="text" :style="{ gridColumn: i + 1 }">{{ e.text }}</div>
    </template>
  </div>
</template>

<style scoped>
.hud-timeline {
  display: grid;
  grid-template-rows: auto auto 24px auto auto;
  column-gap: 32px;
  row-gap: 20px;
  align-items: end;
}

.bracket {
  grid-row: 1;
  padding-bottom: 10px;
  border-bottom: 4px solid var(--hud-accent);
  margin-bottom: 20px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-accent);
}

.date {
  grid-row: 2;
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 44px;
  line-height: 1.1;
}

.axis {
  grid-row: 3;
  grid-column: 1 / -1;
  align-self: center;
  height: 3px;
  background: var(--hud-ink);
}

.marker {
  grid-row: 3;
  z-index: 1;
  width: 24px;
  height: 24px;
  background: var(--hud-surface);
  box-shadow: inset 0 0 0 3px var(--hud-ink);
}

.name {
  grid-row: 4;
  align-self: start;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 26px;
}

.text {
  grid-row: 5;
  align-self: start;
  font-size: 24px;
  line-height: 1.25;
  color: var(--hud-muted);
}

.hot {
  color: var(--hud-accent);
}

.marker.hot {
  background: var(--hud-accent);
  box-shadow: none;
}
</style>
