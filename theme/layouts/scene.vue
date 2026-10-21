<script setup lang="ts">
import ScenePhoto from '../components/ScenePhoto.vue'

// Generic dark scene slide: photo backdrop, content placed freely on the 1920×1080 canvas.
withDefaults(defineProps<{
  photo?: 'beam' | 'outline' | 'none'
}>(), {
  photo: 'beam',
})
</script>

<template>
  <div class="slidev-layout hud scene scene-free">
    <ScenePhoto v-if="photo !== 'none'" :variant="photo" />
    <slot />
  </div>
</template>
