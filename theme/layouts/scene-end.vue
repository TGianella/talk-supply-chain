<script setup lang="ts">
import ScenePhoto from '../components/ScenePhoto.vue'
import Schematic from '../components/Schematic.vue'
import Tape from '../components/Tape.vue'

// Closing slide at the scene. Title (h1) and subtitle (p) in the default slot.
// `contacts` is a label → value map.
withDefaults(defineProps<{
  kicker?: string
  contacts?: Record<string, string>
}>(), {
  kicker: 'Statut : ouvert',
  contacts: () => ({}),
})
</script>

<template>
  <div class="slidev-layout hud scene scene-end">
    <ScenePhoto variant="outline" />
    <Schematic type="geometry" class="sch" style="left: 1110px; top: -60px" :opacity="0.5" />
    <div class="title">
      <div v-if="kicker" class="scene-kicker">{{ kicker }}</div>
      <slot />
    </div>
    <div class="contacts">
      <div v-for="(v, k) in contacts" :key="k" class="contact">
        <span class="k">{{ k }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
    <Tape class="tape" style="left: 900px; top: 1120px" :rotate="-24" />
    <Tape class="tape" style="left: 1100px; top: -60px" :rotate="18" />
  </div>
</template>

<style>
.slidev-layout.hud.scene-end {
  .sch,
  .tape {
    position: absolute;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 330px;
    width: 1000px;
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

  .contacts {
    position: absolute;
    left: 120px;
    top: 820px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .contact {
    display: flex;
    align-items: center;
    gap: 24px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 28px;
  }

  .contact .k {
    width: 140px;
    font-size: 20px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--scene-chalk-muted);
  }
}
</style>
