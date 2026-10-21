<script setup lang="ts">
import HudFrame from '../components/HudFrame.vue'

defineProps<{
  status?: string
}>()
</script>

<template>
  <div class="slidev-layout hud default">
    <HudFrame :status="status" />
    <div class="hud-body">
      <slot />
    </div>
  </div>
</template>
