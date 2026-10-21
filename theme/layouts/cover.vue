<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Fingerprint from '../components/Fingerprint.vue'
import HudCorners from '../components/HudCorners.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import Readout from '../components/Readout.vue'

// Title (h1) and subtitle (p) in the default slot.
// Speaker and org default to themeConfig.speaker / themeConfig.org.
const props = withDefaults(defineProps<{
  status?: string
  kicker?: string
  speaker?: string
  org?: string
  minutiae?: boolean | string[]
  readout?: string | false
  readoutValue?: string
  readoutRatio?: number
}>(), {
  status: 'Analyse en cours',
  kicker: 'Sujet identifié',
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
    <Fingerprint class="print" scan :minutiae="minutiae" />
    <span class="coord" style="left: 120px">X 0120  Y 0260</span>
    <span class="coord" style="left: 1180px">ZOOM 4.0×</span>
    <HudCorners class="title">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </HudCorners>
    <div class="meta">
      <span v-if="speaker" class="speaker">{{ speaker }}</span>
      <span v-if="org" class="org">{{ org }}</span>
    </div>
    <div v-if="readout" class="readout">
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
    top: 180px;
  }

  .coord {
    position: absolute;
    top: 226px;
    font-family: var(--hud-font-mono);
    font-size: 18px;
    letter-spacing: 0.1em;
    color: var(--hud-muted);
    white-space: pre;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 260px;
    width: 1180px;
  }

  h1 {
    font-size: 112px;
    line-height: 1;
    margin: 0 0 28px;
  }

  .title p {
    font-size: 34px;
    color: var(--hud-muted);
    margin: 0;
  }

  .meta {
    position: absolute;
    left: 168px;
    top: 900px;
    display: flex;
    gap: 48px;
    font-family: var(--hud-font-mono);
    font-size: 24px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .speaker {
    font-weight: 600;
  }

  .org {
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
