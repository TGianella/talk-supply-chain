<script setup lang="ts">
import HudCorners from '../components/HudCorners.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'

// Key number. `value` is the number, the default slot is the context line,
// and the optional ::aside:: slot sits on the right (e.g. <Readout> components).
defineProps<{
  status?: string
  kicker?: string
  value: string | number
}>()
</script>

<template>
  <div class="slidev-layout hud fact">
    <HudFrame :status="status" />
    <HudCorners class="number">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <div class="value">{{ value }}</div>
      <div class="context">
        <slot />
      </div>
    </HudCorners>
    <div v-if="$slots.aside" class="aside">
      <slot name="aside" />
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.fact {
  .number {
    position: absolute;
    left: 168px;
    top: 260px;
    min-width: 760px;
    max-width: 1100px;
    padding: 40px 48px;
  }

  .number .hud-kicker {
    margin-bottom: 20px;
  }

  .value {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 300px;
    line-height: 0.95;
    color: var(--hud-accent);
    white-space: nowrap;
  }

  .context {
    margin-top: 20px;
  }

  .context p {
    font-size: 36px;
    font-weight: 500;
    margin: 0;
  }

  .aside {
    position: absolute;
    left: 1340px;
    top: 300px;
    width: 460px;
  }
}
</style>
