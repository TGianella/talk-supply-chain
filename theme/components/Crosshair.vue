<script setup lang="ts">
// Target with concentric rings, used on section slides.
withDefaults(defineProps<{
  label?: string
  size?: number
}>(), {
  size: 720,
})
</script>

<template>
  <div class="hud-crosshair" :style="{ width: `${size}px`, height: `${size}px` }">
    <i class="ring" style="--d: 88.9%" />
    <i class="ring" style="--d: 61.1%" />
    <i class="ring hot" style="--d: 33.3%" />
    <i class="axis h" />
    <i class="axis v" />
    <i class="target" />
    <span v-if="label" class="label">{{ label }}</span>
  </div>
</template>

<style scoped>
.hud-crosshair {
  position: relative;
  pointer-events: none;
}

.ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--d);
  height: var(--d);
  transform: translate(-50%, -50%);
  border: 2px solid var(--hud-faint);
  border-radius: 50%;
}

.ring.hot {
  border: 4px solid var(--hud-accent);
}

.axis {
  position: absolute;
  background: var(--hud-faint);
}

.axis.h { left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; }
.axis.v { top: 0; bottom: 0; left: 50%; width: 2px; margin-left: -1px; }

.target {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  background: var(--hud-accent);
}

.label {
  position: absolute;
  left: calc(50% + 40px);
  top: calc(50% - 90px);
  padding: 4px 10px;
  background: var(--hud-accent);
  color: var(--hud-surface);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
