<script setup lang="ts">
import Fingerprint from '../components/Fingerprint.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'

// One sentence, in large type. `source` adds an attribution underneath.
withDefaults(defineProps<{
  status?: string
  kicker?: string
  source?: string
}>(), {
  kicker: 'Note d’analyse',
})
</script>

<template>
  <div class="slidev-layout hud statement">
    <HudFrame :status="status" />
    <Fingerprint class="print" :size="820" tone="pale" />
    <div class="statement-block">
      <i class="bar" />
      <div class="content">
        <Kicker v-if="kicker">{{ kicker }}</Kicker>
        <slot />
        <div v-if="source" class="source">— {{ source }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.statement {
  .print {
    position: absolute;
    left: 1240px;
    top: 220px;
  }

  .statement-block {
    position: absolute;
    left: 120px;
    top: 50%;
    transform: translateY(-40%);
    width: 1400px;
    display: flex;
    gap: 48px;
  }

  .bar {
    flex: none;
    width: 12px;
    background: var(--hud-accent);
  }

  .content p {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 96px;
    line-height: 1.08;
    margin: 0;
  }

  .source {
    margin-top: 36px;
    font-family: var(--hud-font-mono);
    font-size: 26px;
    color: var(--hud-muted);
  }
}
</style>
