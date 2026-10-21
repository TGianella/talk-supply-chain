<script setup lang="ts">
import { computed } from 'vue'

// Police tape strip. Position and rotate it with a class or style, e.g.
// <Tape class="absolute" style="left: 1250px; top: -80px" :rotate="28" />
const props = withDefaults(defineProps<{
  text?: string
  rotate?: number
  width?: number
}>(), {
  text: 'CRIME SCENE   DO NOT CROSS',
  rotate: 0,
  width: 2400,
})

const repeat = computed(() => Math.ceil(props.width / 640) + 1)
</script>

<template>
  <div class="scene-tape" :style="{ width: `${width}px`, transform: `rotate(${rotate}deg)` }">
    <span v-for="i in repeat" :key="i">{{ text }}</span>
  </div>
</template>

<style scoped>
.scene-tape {
  display: flex;
  align-items: center;
  gap: 72px;
  height: 84px;
  padding: 0 40px;
  overflow: hidden;
  transform-origin: top left;
  background: var(--scene-tape);
  border-top: 3px solid var(--scene-tape-ink);
  border-bottom: 3px solid var(--scene-tape-ink);
  pointer-events: none;
}

span {
  flex: none;
  font-family: var(--hud-font-tape);
  font-size: 56px;
  line-height: 1;
  letter-spacing: 1.5px;
  color: var(--scene-tape-ink);
  white-space: pre;
}
</style>
