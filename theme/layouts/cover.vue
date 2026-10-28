<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Fingerprint from '../components/Fingerprint.vue'
import HudCorners from '../components/HudCorners.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import Readout from '../components/Readout.vue'

// Title (h1) and subtitle (p) in the default slot.
// Speaker plate at the bottom left: `speakerLabel` (kicker), speaker and org (default to
// themeConfig.speaker / themeConfig.org).
// `meta` (label → value) is shown at the bottom right, in place of the readout.
const props = withDefaults(defineProps<{
  status?: string
  meta?: Record<string, string>
  kicker?: string
  speakerLabel?: string
  speaker?: string
  org?: string
  minutiae?: boolean | string[]
  readout?: string | false
  readoutValue?: string
  readoutRatio?: number
}>(), {
  status: 'Analyse en cours',
  speakerLabel: 'Enquêteur',
  minutiae: true,
  readout: 'Minuties concordantes',
  readoutValue: '14 / 16',
  readoutRatio: 14 / 16,
})

const { $slidev } = useSlideContext()
const speaker = computed(() => props.speaker ?? $slidev?.themeConfigs?.speaker)
const org = computed(() => props.org ?? $slidev?.themeConfigs?.org)
</script>

<template>
  <div class="slidev-layout hud cover">
    <HudFrame :status="status" />
    <Fingerprint class="print" scan loop :minutiae="minutiae" />
    <HudCorners class="title" lock>
      <span class="coord" style="left: 0">X 0120  Y 0320</span>
      <span class="coord" style="right: 0">ZOOM 4.0×</span>
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </HudCorners>
    <div v-if="speaker || org" class="plate">
      <Kicker v-if="speakerLabel">{{ speakerLabel }}</Kicker>
      <div v-if="speaker" class="speaker">{{ speaker }}</div>
      <div v-if="org" class="org">{{ org }}</div>
    </div>
    <div v-if="meta" class="facts">
      <template v-for="(v, k) in meta" :key="k">
        <span class="k">{{ k }}</span><span>{{ v }}</span>
      </template>
    </div>
    <div v-else-if="readout" class="readout">
      <Readout :label="readout" :ratio="readoutRatio" :total="16" accent>
        <span class="readout-value">{{ readoutValue }}</span>
      </Readout>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.cover {
  .print {
    position: absolute;
    left: 1180px;
    top: 130px;
  }

  /* labels above the corners of the title box */
  .coord {
    position: absolute;
    top: -42px;
    font-family: var(--hud-font-mono);
    font-size: 18px;
    letter-spacing: 0.1em;
    color: var(--hud-muted);
    white-space: pre;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 320px;
    width: fit-content;
    max-width: 1060px;
  }

  h1 {
    font-size: 144px;
    line-height: 1;
    margin: 0 0 28px;
  }

  .title p {
    font-size: 48px;
    color: var(--hud-muted);
    margin: 0;
  }

  /* bottom aligned with the facts on the right */
  .plate {
    position: absolute;
    left: 120px;
    bottom: 75px;
  }

  .plate .hud-kicker {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .speaker {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 64px;
    line-height: 1;
  }

  .org {
    margin-top: 10px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 26px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
  }

  .facts {
    position: absolute;
    left: 1380px;
    top: 900px;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 40px;
    row-gap: 8px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 0.1em;
  }

  .facts .k {
    text-transform: uppercase;
    color: var(--hud-muted);
  }

  .readout {
    position: absolute;
    left: 1380px;
    top: 930px;
    width: 420px;
  }

  .readout .hud-readout {
    gap: 10px;
    margin: 0;
  }

  .readout-value {
    font-family: var(--hud-font-mono);
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
