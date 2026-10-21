<script setup lang="ts">
import HudCorners from '../components/HudCorners.vue'
import Fingerprint from '../components/Fingerprint.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import Stamp from '../components/Stamp.vue'

// Closing slide. Title (h1) and subtitle (p) in the default slot.
// `contacts` is a label → value map, e.g. { Slides: 'example.com', Contact: '@handle' }.
withDefaults(defineProps<{
  status?: string
  kicker?: string
  stamp?: string
  contacts?: Record<string, string>
}>(), {
  status: 'Statut : ouvert',
  kicker: 'En attente de témoignages',
  stamp: 'Non résolu',
  contacts: () => ({}),
})
</script>

<template>
  <div class="slidev-layout hud end">
    <HudFrame :status="status" />
    <Fingerprint class="print" />
    <Stamp v-if="stamp" class="stamp">{{ stamp }}</Stamp>
    <HudCorners class="title">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </HudCorners>
    <div class="contacts">
      <div v-for="(v, k) in contacts" :key="k" class="contact">
        <span class="label">{{ k }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.end {
  .print {
    position: absolute;
    left: 1180px;
    top: 180px;
  }

  .stamp {
    position: absolute;
    left: 1360px;
    top: 470px;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 260px;
    width: 1060px;
  }

  h1 {
    font-size: 140px;
    line-height: 1;
    margin: 0 0 28px;
  }

  .title p {
    font-size: 34px;
    color: var(--hud-muted);
    margin: 0;
  }

  .contacts {
    position: absolute;
    left: 168px;
    top: 820px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .contact {
    display: flex;
    gap: 24px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 28px;
  }

  .contact .label {
    width: 140px;
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
    align-self: center;
  }
}
</style>
