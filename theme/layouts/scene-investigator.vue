<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import InvestigatorBadge from '../components/InvestigatorBadge.vue'
import ScenePhoto from '../components/ScenePhoto.vue'
import Schematic from '../components/Schematic.vue'

// Introduction of the speaker. Name (h1), role (p) and a list in the default slot.
// The badge on the right takes `photo` (path in public/), `badge` (label → value) and `handle`.
const props = withDefaults(defineProps<{
  kicker?: string
  photo?: string
  badge?: Record<string, string>
  handle?: string
}>(), {
  kicker: 'Enquêteur sur place',
})

const { $slidev } = useSlideContext()
const fields = computed(() => {
  if (props.badge)
    return props.badge
  const c = ($slidev?.themeConfigs ?? {}) as Record<string, string>
  return Object.fromEntries(Object.entries({ Nom: c.speaker, Unité: c.org }).filter(([, v]) => v))
})
const number = computed(() => {
  const dossier = String($slidev?.themeConfigs?.dossier ?? '')
  const digits = dossier.match(/\d+/)?.[0]
  return digits ? `N° ${digits}` : undefined
})
</script>

<template>
  <div class="slidev-layout hud scene scene-investigator">
    <ScenePhoto />
    <Schematic type="table" class="sch" style="left: 1320px; top: 790px" :opacity="0.45" />
    <InvestigatorBadge class="badge" :photo="photo" :fields="fields" :handle="handle" :number="number" />
    <div class="intro">
      <div v-if="kicker" class="scene-kicker">{{ kicker }}</div>
      <slot />
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.scene-investigator {
  .sch,
  .badge {
    position: absolute;
  }

  .badge {
    left: 1200px;
    top: 250px;
  }

  .intro {
    position: absolute;
    left: 120px;
    top: 250px;
    width: 900px;
  }

  h1 {
    font-size: 120px;
    line-height: 1;
    margin: 0 0 24px;
  }

  .intro > p {
    font-size: 36px;
    margin: 0 0 48px;
  }
}
</style>
