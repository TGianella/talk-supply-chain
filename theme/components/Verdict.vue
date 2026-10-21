<script setup lang="ts">
import Kicker from './Kicker.vue'
import Segments from './Segments.vue'

// Large verdict with a scan gauge and an optional caption.
// <Verdict label="Provenance de la version" value="Aucune correspondance"
//   caption="Analyse terminée · 1 284 commits · 0 résultat">Explication…</Verdict>
withDefaults(defineProps<{
  label?: string
  value: string
  ratio?: number
  caption?: string
  size?: number
}>(), {
  ratio: 1,
  size: 140,
})
</script>

<template>
  <div class="hud-verdict">
    <Kicker v-if="label">{{ label }}</Kicker>
    <div class="value" :style="{ fontSize: `${size}px` }">{{ value }}</div>
    <Segments :ratio="ratio" :total="20" :height="20" />
    <div v-if="caption" class="caption">{{ caption }}</div>
    <div class="body"><slot /></div>
  </div>
</template>

<style scoped>
.hud-verdict .hud-kicker {
  margin-bottom: 16px;
}

.value {
  font-family: var(--hud-font-head);
  font-weight: 700;
  line-height: 0.95;
  color: var(--hud-accent);
  text-transform: uppercase;
  margin-bottom: 24px;
}

.caption {
  margin-top: 14px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.body {
  margin-top: 28px;
}

.body :deep(p) {
  font-size: 32px;
}
</style>
