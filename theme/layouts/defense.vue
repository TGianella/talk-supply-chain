<script setup lang="ts">
import { computed } from 'vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import SeriesChain from '../components/SeriesChain.vue'

// One actor of a series (the defense advice, the platform changes…): title (h1) and a list of measures
// in the default slot. `series` names the themeConfig key that lists the actors (`defenses` by default),
// `label` prefixes the kicker ("Défense" by default). `actor` is the 1-based index in that list, which
// drives the kicker (its number) and the chain of actors at the top right (<SeriesChain>).
// Each list item is a measure, numbered M-01, M-02…, in bold; an optional line under it explains it. The list is centered in the space under the title.
// From five measures on, the gap between them gets smaller. Wrap it in <v-clicks> to stagger it.
//   - **La 2FA partout**
const props = withDefaults(defineProps<{
  status?: string
  series?: string
  label?: string
  actor?: number
  kicker?: string
}>(), {
  status: 'Protocole',
  series: 'defenses',
  label: 'Défense',
})

const pad = (n: number) => String(n).padStart(2, '0')
const kicker = computed(() => props.kicker ?? (props.actor ? `${props.label} ${pad(props.actor)}` : undefined))
</script>

<template>
  <div class="slidev-layout hud defense">
    <HudFrame :status="status" />
    <SeriesChain class="chain" :series="series" :actor="actor" />
    <div class="hud-body">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.defense {
  --hud-top: 110px;

  .hud-kicker {
    margin-bottom: 6px;
  }

  h1 {
    margin-bottom: 0;
  }

  .chain {
    position: absolute;
    top: 100px;
    right: var(--hud-gutter);
  }

  .hud-body ul:not(li ul) {
    counter-reset: hud-defense;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 104px;
    margin: 0;
  }

  .hud-body ul:not(li ul) > li {
    counter-increment: hud-defense;
    margin: 0;
    padding: 0 0 0 208px;
    font-size: 26px;
    line-height: 1.3;
    color: var(--hud-muted);
  }

  .hud-body ul:not(li ul) > li::before {
    content: 'M-' counter(hud-defense, decimal-leading-zero);
    left: 0;
    top: 50%;
    width: 160px;
    height: 76px;
    transform: translateY(-50%);
    display: grid;
    place-items: center;
    background: none;
    box-shadow: inset 0 0 0 3px var(--hud-accent);
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 30px;
    letter-spacing: 0.05em;
    color: var(--hud-accent);
  }

  .hud-body ul:not(li ul) > li p {
    margin: 0;
  }

  .hud-body ul:not(li ul) > li strong {
    display: block;
    font-size: 60px;
    line-height: 1.2;
    color: var(--hud-ink);
  }

  /* five measures: a smaller gap so they fit under the title */
  .hud-body ul:not(li ul):has(> li:nth-child(5)) {
    gap: 64px;
  }
}
</style>
