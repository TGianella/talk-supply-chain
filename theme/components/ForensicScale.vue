<script setup lang="ts">
// Black and white evidence scale, placed next to an object on scene slides.
withDefaults(defineProps<{
  width?: number
  rotate?: number
}>(), {
  width: 520,
  rotate: 0,
})
</script>

<template>
  <div class="scene-scale" :style="{ width: `${width}px`, transform: `rotate(${rotate}deg)` }">
    <div class="bar">
      <i v-for="i in 10" :key="i" :class="{ dark: i % 2 === 0 }" />
    </div>
    <div class="labels">
      <span>0</span><span>5</span><span>10 CM</span>
    </div>
  </div>
</template>

<style scoped>
.scene-scale {
  transform-origin: top left; /* as in design.pen */
  pointer-events: none;
}

.bar {
  display: flex;
  height: 22px;
  border: 2px solid var(--scene-chalk);
}

i {
  flex: 1;
  background: var(--scene-chalk);
}

i.dark {
  background: #111111;
}

.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.1em;
  color: var(--scene-chalk);
}
</style>
