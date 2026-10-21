<script setup lang="ts">
import HudFrame from '../components/HudFrame.vue'

// Content centered in the slide body: a diagram, an image, a single component.
defineProps<{
  status?: string
}>()
</script>

<template>
  <div class="slidev-layout hud center">
    <HudFrame :status="status" />
    <div class="hud-body">
      <slot />
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.center .hud-body {
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
