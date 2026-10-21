<script setup lang="ts">
import { computed } from 'vue'

// Segmented gauge. `value` filled segments out of `total`.
// Pass `ratio` (0–1) instead of `value` to fill proportionally.
const props = withDefaults(defineProps<{
  value?: number
  ratio?: number
  total?: number
  height?: number
  color?: 'accent' | 'ink'
}>(), {
  total: 18,
  height: 12,
  color: 'ink',
})

const filled = computed(() => props.ratio !== undefined
  ? Math.round(props.ratio * props.total)
  : (props.value ?? props.total))
</script>

<template>
  <div class="hud-segments" :style="{ height: `${height}px` }">
    <i v-for="i in total" :key="i" :class="i <= filled ? color : 'off'" />
  </div>
</template>

<style scoped>
.hud-segments {
  display: flex;
  gap: 4px;
  width: 100%;
}

i {
  flex: 1;
}

.ink { background: var(--hud-ink); }
.accent { background: var(--hud-accent); }
.off { background: var(--hud-grid); }
</style>
