<script setup lang="ts">
import Segments from './Segments.vue'

// Label/value pair with an optional segmented gauge underneath.
// <Readout label="Paquets" value="18" :ratio="1" />
defineProps<{
  label: string
  value?: string | number
  ratio?: number
  segments?: number
  total?: number
  accent?: boolean
}>()
</script>

<template>
  <div class="hud-readout">
    <div class="row">
      <span class="label">{{ label }}</span>
      <span class="value" :class="{ accent }"><slot>{{ value }}</slot></span>
    </div>
    <Segments
      v-if="ratio !== undefined || segments !== undefined"
      :ratio="ratio"
      :value="segments"
      :total="total ?? 18"
      :color="accent ? 'accent' : 'ink'"
    />
  </div>
</template>

<style scoped>
.hud-readout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 48px;
  line-height: 1;
}

.value.accent {
  color: var(--hud-accent);
}
</style>
