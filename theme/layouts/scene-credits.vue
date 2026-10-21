<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Schematic from '../components/Schematic.vue'

// Opening credits, three shots on a dark backdrop of schematics (G1–G3 in design.pen).
// `shot: investigator`: `role` above the speaker's name (themeConfig.speaker), `portrait` on the right.
// `shot: title`: title (h1) and subtitle (p) of the default slot, centered.
// `shot: venue`: `label` above the event, then city and date
// (themeConfig.event, themeConfig.city, themeConfig.date).
const props = withDefaults(defineProps<{
  shot?: 'investigator' | 'title' | 'venue'
  role?: string
  name?: string
  portrait?: string
  label?: string
  event?: string
  city?: string
  date?: string
}>(), {
  shot: 'title',
  role: 'Dans le rôle de l’enquêteur',
  label: 'Lieu des faits',
})

const { $slidev } = useSlideContext()
const config = computed(() => ($slidev?.themeConfigs ?? {}) as Record<string, string>)
const name = computed(() => props.name ?? config.value.speaker)
const event = computed(() => props.event ?? config.value.event)
const where = computed(() => [props.city ?? config.value.city, props.date ?? config.value.date].filter(Boolean).join('  ·  '))
const index = computed(() => ['investigator', 'title', 'venue'].indexOf(props.shot) + 1)

type Placed = { type: 'molecule' | 'geometry' | 'table', left: number, top: number, opacity: number }
const schematics: Record<string, Placed[]> = {
  investigator: [
    { type: 'molecule', left: 120, top: 90, opacity: 0.3 },
  ],
  title: [
    { type: 'geometry', left: 680, top: 260, opacity: 0.3 },
    { type: 'table', left: 120, top: 680, opacity: 0.3 },
    { type: 'molecule', left: 1300, top: 80, opacity: 0.25 },
  ],
  venue: [
    { type: 'table', left: 1240, top: 140, opacity: 0.35 },
    { type: 'geometry', left: 1180, top: 480, opacity: 0.25 },
    { type: 'molecule', left: 80, top: 60, opacity: 0.25 },
  ],
}
</script>

<template>
  <div class="slidev-layout hud scene scene-credits" :class="shot">
    <Schematic
      v-for="(s, i) in schematics[shot]" :key="i"
      :type="s.type" class="sch" :style="{ left: `${s.left}px`, top: `${s.top}px` }" :opacity="s.opacity"
    />
    <div class="shot-label">Générique {{ index }} / 3</div>

    <template v-if="shot === 'investigator'">
      <div class="portrait">
        <img v-if="portrait" :src="portrait" alt="">
        <template v-else>
          <svg class="silhouette" viewBox="0 0 560 640" aria-hidden="true">
            <circle cx="280" cy="230" r="110" />
            <path d="M60 640c0-150 100-250 220-250s220 100 220 250" />
          </svg>
          <span class="note">Portrait N&amp;B à fournir</span>
        </template>
      </div>
      <Schematic type="geometry" class="sch" style="left: 900px; top: 300px" :opacity="0.5" />
      <div class="credit">
        <div class="kicker">{{ role }}</div>
        <div class="big">{{ name }}</div>
      </div>
    </template>

    <div v-else-if="shot === 'title'" class="title">
      <slot />
    </div>

    <div v-else class="credit">
      <div class="kicker">{{ label }}</div>
      <div class="big">{{ event }}</div>
      <div v-if="where" class="where">{{ where }}</div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.scene-credits {
  background: radial-gradient(ellipse 75% 75% at 50% 50%, #222426 0%, #0a0a0b 100%);

  .sch {
    position: absolute;
  }

  .shot-label {
    position: absolute;
    top: 40px;
    right: 110px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 20px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6e7277;
  }

  .portrait {
    position: absolute;
    left: 1180px;
    top: 180px;
    width: 560px;
    height: 720px;
    overflow: hidden;
    background: #2a2c2e;
  }

  .portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
  }

  .silhouette {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 560px;
    height: 640px;
    fill: none;
    stroke: #4a4d51;
    stroke-width: 6;
  }

  .note {
    position: absolute;
    left: 24px;
    top: 24px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a8e93;
  }

  .credit {
    position: absolute;
    left: 120px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &.investigator .credit {
    top: 560px;
    gap: 16px;
  }

  &.venue .credit {
    top: 520px;
  }

  .kicker {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 24px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--scene-tape);
  }

  .big {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 110px;
    line-height: 1;
    text-transform: uppercase;
    color: var(--scene-chalk);
  }

  .where {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 36px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: pre;
    color: var(--scene-chalk);
  }

  .title {
    position: absolute;
    left: 0;
    right: 0;
    top: 400px;
    text-align: center;
  }

  .title h1 {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 180px;
    line-height: 1;
    letter-spacing: -3px;
    margin: 0 0 20px;
  }

  .title p {
    font-family: var(--hud-font-head);
    font-weight: 700;
    font-size: 80px;
    line-height: 1.3;
    color: var(--scene-tape);
    margin: 0;
  }
}
</style>
