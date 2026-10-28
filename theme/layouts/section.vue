<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'

// Section break. Title (h1) in the default slot.
// `part` is the 1-based index in themeConfig.parts: it sets the kicker, the status,
// the large number behind the title and the current step of the agenda.
const props = defineProps<{
  status?: string
  part?: number
  kicker?: string
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
    <div v-if="part" class="number" aria-hidden="true">{{ pad(part) }}</div>
    <div class="title">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
      <i class="rule" />
    </div>
    <div v-if="parts.length" class="agenda">
      <div v-for="(p, i) in parts" :key="p" class="step" :class="{ done: part && i + 1 < part, current: part === i + 1 }">
        <i />
        <span>{{ pad(i + 1) }}  {{ p }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.section {
  .number {
    position: absolute;
    left: 1072px;
    top: 170px;
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 640px;
    line-height: 1;
    color: var(--hud-grid);
  }

  .title {
    position: absolute;
    left: var(--hud-gutter);
    top: 300px;
    width: 1100px;
  }

  h1 {
    font-size: 136px;
    line-height: 1;
    margin: 0;
  }

  .rule {
    display: block;
    width: 120px;
    height: 8px;
    margin-top: 28px;
    background: var(--hud-accent);
  }

  .agenda {
    position: absolute;
    left: var(--hud-gutter);
    right: var(--hud-gutter);
    top: 880px;
    display: flex;
    gap: 16px;
  }

  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: pre;
    color: var(--hud-muted);
  }

  .step i {
    height: 8px;
    background: var(--hud-grid);
  }

  .step.done {
    color: var(--hud-ink);
  }

  .step.done i {
    background: var(--hud-ink);
  }

  .step.current {
    color: var(--hud-accent);
  }

  .step.current i {
    background: var(--hud-accent);
  }
}
</style>
