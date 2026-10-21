<script setup lang="ts">
import { nextTick, onMounted, onUpdated, ref } from 'vue'

// Printed sheet lying at the scene. Put a code block in the slot;
// `alert` lists the line numbers (1-based) printed in red.
// <EvidenceSheet title="package.json" :alert="[5]"> ```json … ``` </EvidenceSheet>
const props = withDefaults(defineProps<{
  title?: string
  alert?: number[]
  rotate?: number
  width?: number
}>(), {
  alert: () => [],
  rotate: 7,
  width: 620,
})

const root = ref<HTMLElement>()
function mark() {
  root.value?.querySelectorAll('.slidev-code .line').forEach((line, i) =>
    line.classList.toggle('sheet-alert', props.alert.includes(i + 1)))
}
onMounted(() => nextTick(mark))
onUpdated(() => nextTick(mark))
</script>

<template>
  <div ref="root" class="scene-sheet" :style="{ width: `${width}px`, transform: `rotate(${rotate}deg)` }">
    <div v-if="title" class="title">{{ title }}</div>
    <slot />
  </div>
</template>

<style scoped>
.scene-sheet {
  transform-origin: top left; /* as in design.pen */
  padding: 36px;
  background: #f4f3ee;
  color: #222222;
  box-shadow: 0 18px 40px #000000aa;
}

.title {
  margin-bottom: 10px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.1em;
  color: #6b6f75;
}

.scene-sheet :deep(.slidev-code-wrapper) {
  margin: 0 !important;
}

.scene-sheet :deep(.slidev-code) {
  padding: 0 !important;
  border: none;
  background: transparent;
  font-size: 24px !important;
  line-height: 38px !important;
}

.scene-sheet :deep(.slidev-code span) {
  color: #222222 !important;
}

.scene-sheet :deep(.slidev-code .sheet-alert span) {
  color: #b4231a !important;
  font-weight: 600;
}
</style>
