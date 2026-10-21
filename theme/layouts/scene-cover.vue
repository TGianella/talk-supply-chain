<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import EvidenceMarker from '../components/EvidenceMarker.vue'
import ScenePhoto from '../components/ScenePhoto.vue'
import Schematic from '../components/Schematic.vue'
import Tape from '../components/Tape.vue'

// Title slide shown while people settle in. Title (h1) and subtitle (p) in the default slot.
// `meta` is the caption at the top left (label → value), built from themeConfig.event and
// themeConfig.date by default. Speaker and org (bottom left) default to themeConfig.speaker / org.
// `titleStyle`: `glow` is the typewriter title with a green phosphor glow (S1c in design.pen),
// `plain` the mono title with a yellow subtitle (S1).
const props = withDefaults(defineProps<{
  meta?: Record<string, string>
  marker?: number | string | false
  speaker?: string
  org?: string
  titleStyle?: 'glow' | 'plain'
}>(), {
  marker: 1,
  titleStyle: 'glow',
})

const { $slidev } = useSlideContext()
const config = computed(() => ($slidev?.themeConfigs ?? {}) as Record<string, string>)
const rows = computed(() => {
  if (props.meta)
    return Object.entries(props.meta)
  return Object.entries({
    Lieu: config.value.event,
    Date: config.value.date,
  }).filter(([, v]) => v)
})
const speaker = computed(() => props.speaker ?? config.value.speaker)
const org = computed(() => props.org ?? config.value.org)
</script>

<template>
  <div class="slidev-layout hud scene scene-cover" :class="titleStyle">
    <ScenePhoto variant="outline" />
    <Schematic type="molecule" class="sch" style="left: 600px; top: -10px" :opacity="0.25" />
    <Schematic type="geometry" class="sch" style="left: 1110px; top: -60px" :opacity="0.55" />
    <div v-if="rows.length" class="meta">
      <template v-for="[k, v] in rows" :key="k">
        <span class="k">{{ k }}</span><span>{{ v }}</span>
      </template>
    </div>
    <div class="title">
      <slot />
    </div>
    <div v-if="speaker || org" class="speaker">
      <span v-if="speaker">{{ speaker }}</span>
      <span v-if="org" class="org">{{ org }}</span>
    </div>
    <EvidenceMarker v-if="marker !== false" class="marker" :number="marker" />
    <Tape class="tape" style="left: 1250px; top: -80px" :rotate="28" />
    <Tape class="tape" style="left: -300px; top: 1270px" :rotate="-14" />
  </div>
</template>

<style>
.slidev-layout.hud.scene-cover {
  .sch,
  .tape,
  .marker {
    position: absolute;
  }

  .marker {
    left: 1250px;
    top: 560px;
  }

  .meta {
    position: absolute;
    left: 120px;
    top: 96px;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 60px;
    row-gap: 8px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 0.1em;
    color: var(--scene-chalk-muted);
  }

  .meta .k {
    text-transform: uppercase;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 380px;
    width: 1080px;
  }

  .speaker {
    position: absolute;
    left: 120px;
    top: 900px;
    display: flex;
    gap: 48px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 24px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .speaker .org {
    color: var(--scene-chalk-muted);
  }

  h1 {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 150px;
    line-height: 1;
    letter-spacing: -2px;
    margin: 0 0 20px;
  }

  .title p {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 76px;
    line-height: 1.05;
    color: var(--scene-tape);
    margin: 0;
  }
}

.slidev-layout.hud.scene-cover.glow {
  h1,
  .title p {
    font-family: var(--hud-font-typewriter);
    color: #ffffff;
    letter-spacing: 0;
  }

  h1 {
    font-weight: 700;
    font-size: 160px;
    text-shadow:
      0 0 3px color-mix(in srgb, var(--scene-glow) 90%, transparent),
      0 0 12px color-mix(in srgb, var(--scene-glow-deep) 50%, transparent);
  }

  .title p {
    font-weight: 400;
    font-size: 64px;
    text-shadow:
      0 0 2px color-mix(in srgb, var(--scene-glow) 80%, transparent),
      0 0 8px color-mix(in srgb, var(--scene-glow-deep) 35%, transparent);
  }
}
</style>
