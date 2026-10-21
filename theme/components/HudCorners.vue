<script setup lang="ts">
// Wraps content in four HUD corner brackets.
withDefaults(defineProps<{
  size?: number
  thickness?: number
  padding?: string
}>(), {
  size: 48,
  thickness: 6,
  padding: '48px',
})
</script>

<template>
  <div
    class="hud-corners"
    :style="{ '--size': `${size}px`, '--thickness': `${thickness}px`, 'padding': padding }"
  >
    <i class="tl" /><i class="tr" /><i class="bl" /><i class="br" />
    <slot />
  </div>
</template>

<style scoped>
.hud-corners {
  position: relative;
}

i {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border: 0 solid var(--hud-accent);
  pointer-events: none;
}

.tl { top: 0; left: 0; border-top-width: var(--thickness); border-left-width: var(--thickness); }
.tr { top: 0; right: 0; border-top-width: var(--thickness); border-right-width: var(--thickness); }
.bl { bottom: 0; left: 0; border-bottom-width: var(--thickness); border-left-width: var(--thickness); }
.br { bottom: 0; right: 0; border-bottom-width: var(--thickness); border-right-width: var(--thickness); }
</style>
