<script setup lang="ts">
import HudFrame from '../components/HudFrame.vue'

// Title on top (default slot), then ::left:: and ::right:: columns.
// `cols` sets the CSS grid columns, e.g. "1fr 1fr" or "760px 1fr".
withDefaults(defineProps<{
  status?: string
  cols?: string
  align?: 'start' | 'center' | 'end'
}>(), {
  cols: '1fr 1fr',
  align: 'start',
})
</script>

<template>
  <div class="slidev-layout hud two-cols">
    <HudFrame :status="status" />
    <div class="hud-body">
      <slot />
      <div class="cols" :style="{ gridTemplateColumns: cols, alignItems: align }">
        <div class="col">
          <slot name="left" />
        </div>
        <div class="col">
          <slot name="right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.two-cols .cols {
  flex: 1;
  display: grid;
  gap: 80px;
  min-height: 0;
}
</style>
