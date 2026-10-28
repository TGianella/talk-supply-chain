<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, ref, watch } from 'vue'
import { withBase } from '../utils/base'

// Full-screen video (files go in public/, e.g. src: /intro.mp4).
// It starts from the beginning when the slide is shown and pauses when you leave.
// It only plays in the audience view: the presenter view shows it paused, so the sound isn't doubled.
// `advance: true` moves to the next slide when the video ends.
const props = withDefaults(defineProps<{
  src: string
  poster?: string
  muted?: boolean
  loop?: boolean
  advance?: boolean
  fit?: 'cover' | 'contain'
}>(), {
  fit: 'cover',
})

const { $page, $nav, $renderContext } = useSlideContext()
const video = ref<HTMLVideoElement>()
const active = computed(() => $renderContext.value === 'slide' && $nav.value.currentSlideNo === $page.value)

watch([active, video], ([on, el]) => {
  if (!el)
    return
  if (on) {
    el.currentTime = 0
    el.play().catch(() => {})
  }
  else {
    el.pause()
  }
}, { immediate: true })

function onEnded() {
  if (props.advance && active.value)
    $nav.value.next()
}
</script>

<template>
  <div class="slidev-layout video">
    <video
      ref="video"
      :src="withBase(src)"
      :poster="withBase(poster)"
      :muted="muted"
      :loop="loop"
      :style="{ objectFit: fit }"
      playsinline
      preload="auto"
      @ended="onEnded"
    />
    <slot />
  </div>
</template>

<style>
.slidev-layout.video {
  position: relative;
  height: 100%;
  padding: 0;
  background: #000000;
}

.slidev-layout.video video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
