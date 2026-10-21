<script setup lang="ts">
import beam from '../assets/asphalt-beam.jpg'
import outline from '../assets/asphalt-outline.jpg'

// Background photo for scene layouts, with a dark gradient on the left for the text.
// `beam`: asphalt lit by a flashlight, pushed to the right. `outline`: chalk body outline.
withDefaults(defineProps<{
  variant?: 'beam' | 'outline'
}>(), {
  variant: 'beam',
})
</script>

<template>
  <div class="scene-photo" :class="variant">
    <img :src="variant === 'outline' ? outline : beam" alt="">
    <i class="shade" />
  </div>
</template>

<style scoped>
.scene-photo {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

img {
  position: absolute;
  object-fit: cover;
  max-width: none;
}

.outline img {
  inset: 0;
  width: 100%;
  height: 100%;
}

.beam img {
  left: 560px;
  top: -260px;
  width: 1920px;
  height: 1400px;
}

.shade {
  position: absolute;
  inset: 0;
}

.outline .shade {
  background: linear-gradient(to right, #121314f2 0%, #121314b3 45%, #12131400 75%);
}

.beam .shade {
  background: linear-gradient(to right, #121314 0%, #121314cc 40%, #12131400 62%);
}
</style>
