<script setup lang="ts">
import EvidenceMarker from '../components/EvidenceMarker.vue'
import ForensicScale from '../components/ForensicScale.vue'
import ScenePhoto from '../components/ScenePhoto.vue'
import Schematic from '../components/Schematic.vue'

// Evidence found at the scene. Title (h1) and text (p) in the default slot,
// the object in the ::evidence:: slot (e.g. <EvidenceSheet>), lying in the flashlight beam.
withDefaults(defineProps<{
  kicker?: string
  marker?: number | string | false
  scale?: boolean
}>(), {
  marker: false,
  scale: true,
})
</script>

<template>
  <div class="slidev-layout hud scene scene-evidence">
    <ScenePhoto />
    <Schematic type="table" class="sch" style="left: 120px; top: 720px" :opacity="0.3" />
    <div class="title">
      <div v-if="kicker" class="scene-kicker">{{ kicker }}</div>
      <slot />
    </div>
    <div class="evidence">
      <slot name="evidence" />
    </div>
    <ForensicScale v-if="scale" class="scale" :rotate="7" />
    <EvidenceMarker v-if="marker !== false" class="marker" :number="marker" />
  </div>
</template>

<style>
.slidev-layout.hud.scene-evidence {
  .sch,
  .scale,
  .marker,
  .evidence {
    position: absolute;
  }

  .evidence {
    left: 1180px;
    top: 330px;
  }

  .scale {
    left: 1320px;
    top: 860px;
  }

  .marker {
    left: 1040px;
    top: 690px;
  }

  .title {
    position: absolute;
    left: 120px;
    top: 360px;
    width: 860px;
  }

  h1 {
    font-size: 120px;
    line-height: 1;
    margin: 0 0 24px;
  }

  .title p {
    font-size: 36px;
    line-height: 1.3;
    margin: 0;
  }
}
</style>
