<script setup lang="ts">
import HudFrame from '../components/HudFrame.vue'

// Status bar and grid only. Content is positioned freely on the 1920×1080 canvas,
// e.g. <div class="absolute left-[120px] top-[300px]">…</div>
defineProps<{
  status?: string
}>()
</script>

<template>
  <div class="slidev-layout hud blank">
    <HudFrame :status="status" />
    <slot />
  </div>
</template>
