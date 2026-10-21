<script setup lang="ts">
// Yellow numbered evidence tent: <EvidenceMarker :number="3" />
withDefaults(defineProps<{
  number?: number | string
  size?: number
}>(), {
  number: 1,
  size: 200,
})
</script>

<template>
  <div class="scene-marker" :style="{ width: `${size}px`, fontSize: `${size * 0.75}px` }">
    <i class="top" />
    <div class="body">{{ number }}</div>
  </div>
</template>

<style scoped>
.scene-marker {
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.top {
  height: 0.427em;
  background: #d9ae00;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.body {
  height: 1.267em;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--scene-tape);
  color: var(--scene-tape-ink);
  font-family: var(--hud-font-head);
  font-weight: 700;
  line-height: 1;
}
</style>
