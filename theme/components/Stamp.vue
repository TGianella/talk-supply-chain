<script setup lang="ts">
// Rubber stamp: <Stamp>NON RÉSOLU</Stamp>
withDefaults(defineProps<{
  rotate?: number
  size?: number
}>(), {
  rotate: -8,
  size: 64,
})
</script>

<template>
  <div class="hud-stamp" :style="{ transform: `rotate(${rotate}deg)`, fontSize: `${size}px` }">
    <slot />
  </div>
</template>

<style scoped>
.hud-stamp {
  transform-origin: top left; /* as in design.pen */
  display: inline-block;
  padding: 0.15em 0.45em;
  border: 6px solid var(--hud-accent);
  color: var(--hud-accent);
  font-family: var(--hud-font-head);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
