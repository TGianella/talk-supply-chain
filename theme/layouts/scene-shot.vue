<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

// Full-screen greyscale shot, for an opening sequence in the style of a TV crime series.
// `image`: photo (public/, e.g. /photos/intro-email.jpg), or the `::screen::` slot for content drawn
// in place of a photo (e.g. PublishLog). Both are slowly zoomed while the slide is shown
// (`zoom: in` or `out`, centered on `focus`, a CSS object-position).
// `place` and `time`: on-screen locator at the bottom left, shown after a short delay.
// `credit`: photo credit at the bottom right. The default slot is placed freely over the photo.
const props = withDefaults(defineProps<{
  image?: string
  place?: string
  time?: string
  credit?: string
  zoom?: 'in' | 'out'
  focus?: string
}>(), {
  zoom: 'in',
  focus: 'center',
})

const { $page, $nav } = useSlideContext()
const active = computed(() => $nav.value.currentSlideNo === $page.value)
</script>

<template>
  <div
    class="slidev-layout hud scene scene-shot"
    :data-zoom="zoom"
    :data-active="active || undefined"
    :style="{ '--shot-focus': props.focus }"
  >
    <div class="frame">
      <img v-if="image" class="photo" :src="image" alt="">
      <slot name="screen" />
    </div>
    <i class="shade" />
    <div v-if="place || time" class="locator">
      <div v-if="place" class="place">{{ place }}</div>
      <div v-if="time" class="time">{{ time }}</div>
    </div>
    <div v-if="credit" class="credit">{{ credit }}</div>
    <slot />
  </div>
</template>

<style>
.slidev-layout.hud.scene-shot {
  position: relative;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: #000000;

  .frame {
    position: absolute;
    inset: 0;
    transform-origin: var(--shot-focus);
    filter: grayscale(1) contrast(1.15) brightness(0.85);
  }

  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: var(--shot-focus);
  }

  &[data-zoom='out'] .frame {
    transform: scale(1.12);
  }

  &[data-active][data-zoom='in'] .frame {
    animation: shot-zoom-in 12s ease-out forwards;
  }

  &[data-active][data-zoom='out'] .frame {
    animation: shot-zoom-out 12s ease-out forwards;
  }

  /* vignette, darker at the bottom for the locator */
  .shade {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 80% at 50% 45%, #00000000 50%, #000000b3 100%),
      linear-gradient(to top, #000000b3 0%, #00000000 35%);
  }

  .locator {
    position: absolute;
    left: 120px;
    bottom: 110px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0;
  }

  &[data-active] .locator {
    animation: shot-locator 0.6s ease-out 0.8s forwards;
  }

  .place {
    font-size: 52px;
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--scene-chalk);
  }

  .time {
    font-size: 30px;
    letter-spacing: 0.1em;
    color: var(--scene-tape);
  }

  .credit {
    position: absolute;
    right: 40px;
    bottom: 30px;
    font-family: var(--hud-font-mono);
    font-size: 16px;
    color: #8a8e93;
  }
}

@keyframes shot-zoom-in {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}

@keyframes shot-zoom-out {
  from { transform: scale(1.12); }
  to { transform: scale(1); }
}

@keyframes shot-locator {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
</style>
