<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Crosshair from '../components/Crosshair.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'

// Section break. Title (h1) in the default slot.
// `part` is the 1-based index in themeConfig.parts, which drives the agenda bar.
const props = defineProps<{
  status?: string
  part?: number
  kicker?: string
  target?: string
}>()

const { $slidev } = useSlideContext()
const parts = computed(() => ($slidev?.themeConfigs?.parts ?? []) as unknown as string[])
const pad = (n: number) => String(n).padStart(2, '0')
const kicker = computed(() => props.kicker ?? (props.part ? `Partie ${pad(props.part)}` : undefined))
const status = computed(() => props.status ?? kicker.value)
</script>

<template>
  <div class="slidev-layout hud section">
    <HudFrame :status="status" />
    <Crosshair class="crosshair" :label="target" />
    <div class="title">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </div>
    <div v-if="parts.length" class="agenda">
      <div v-for="(p, i) in parts" :key="p" class="step" :class="{ done: part && i < part, current: part === i + 1 }">
        <i />
        <span>{{ pad(i + 1) }} {{ p }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.section {
  .crosshair {
    position: absolute;
    left: 1100px;
    top: 200px;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 330px;
    width: 900px;
  }

  h1 {
    font-size: 120px;
    line-height: 1;
    margin: 0;
  }

  .agenda {
    position: absolute;
    left: 120px;
    top: 860px;
    width: 900px;
    display: flex;
    gap: 12px;
  }

  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
  }

  .step i {
    height: 12px;
    background: var(--hud-grid);
  }

  .step.done i {
    background: var(--hud-accent);
  }

  .step.current {
    color: var(--hud-accent);
  }
}
</style>
