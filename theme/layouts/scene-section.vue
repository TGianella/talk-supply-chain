<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import EvidenceMarker from '../components/EvidenceMarker.vue'
import ScenePhoto from '../components/ScenePhoto.vue'
import Schematic from '../components/Schematic.vue'
import Tape from '../components/Tape.vue'

// Section break at the scene. Title (h1) and optional subtitle (p) in the default slot.
// `part` is the 1-based index in themeConfig.parts: it numbers the marker and drives the agenda.
const props = defineProps<{
  part?: number
  kicker?: string
}>()

const { $slidev } = useSlideContext()
const parts = computed(() => ($slidev?.themeConfigs?.parts ?? []) as unknown as string[])
const kicker = computed(() => props.kicker ?? (props.part ? `Pièce ${String(props.part).padStart(3, '0')}` : undefined))
</script>

<template>
  <div class="slidev-layout hud scene scene-section">
    <ScenePhoto />
    <Schematic type="geometry" class="sch" style="left: 1180px; top: 227px" :opacity="0.6" />
    <EvidenceMarker v-if="part" class="marker" :number="part" />
    <div class="title">
      <div v-if="kicker" class="scene-kicker">{{ kicker }}</div>
      <slot />
    </div>
    <div v-if="parts.length" class="agenda">
      <div v-for="(p, i) in parts" :key="p" class="step" :class="{ current: part === i + 1 }">
        <span class="num">{{ i + 1 }}</span>
        <span>{{ p }}</span>
      </div>
    </div>
    <Tape class="tape" style="left: -200px; top: 30px" :rotate="-2.5" />
  </div>
</template>

<style>
.slidev-layout.hud.scene-section {
  .sch,
  .tape,
  .marker {
    position: absolute;
  }

  .marker {
    left: 1360px;
    top: 380px;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 360px;
    width: 960px;
  }

  h1 {
    font-size: 140px;
    line-height: 1;
    margin: 0 0 24px;
  }

  .title p {
    font-size: 36px;
    margin: 0;
  }

  .agenda {
    position: absolute;
    left: 120px;
    top: 900px;
    display: flex;
    gap: 56px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 20px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--scene-chalk-muted);
  }

  .num {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 2px var(--scene-chalk-muted);
    font-size: 22px;
    letter-spacing: 0;
  }

  .step.current {
    color: var(--scene-tape);
  }

  .step.current .num {
    background: var(--scene-tape);
    box-shadow: none;
    color: var(--scene-tape-ink);
  }
}
</style>
