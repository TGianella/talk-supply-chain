<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

// Status bar shared by every layout: "<dossier> // <status>" on the left,
// slide counter on the right. The dossier comes from `themeConfig.dossier`.
const props = defineProps<{
  status?: string
}>()

const { $slidev, $page, $nav } = useSlideContext()

const left = computed(() => {
  const dossier = $slidev?.themeConfigs?.dossier as string | undefined
  return [dossier, props.status].filter(Boolean).join('  //  ')
})

const pad = (n: number) => String(n).padStart(2, '0')

// Background grid, drawn as SVG lines rather than a repeating CSS gradient:
// once Slidev scales the canvas down, gradient lines snap to whole pixels and
// come out uneven, while SVG strokes are antialiased and keep the same weight.
const W = 1920
const H = 1080
const STEP = 80
const gridPath = [
  ...Array.from({ length: Math.ceil(W / STEP) }, (_, i) => `M${i * STEP + 0.5} 0V${H}`),
  ...Array.from({ length: Math.ceil(H / STEP) }, (_, i) => `M0 ${i * STEP + 0.5}H${W}`),
].join('')
</script>

<template>
  <svg class="hud-grid" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
    <path :d="gridPath" />
  </svg>
  <div class="hud-statusbar">
    <span>{{ left }}</span>
    <span>{{ pad($page) }} / {{ pad($nav.total) }}</span>
  </div>
  <slot />
</template>

<style scoped>
.hud-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.hud-grid path {
  fill: none;
  stroke: var(--hud-grid);
  stroke-width: 1;
}

.hud-statusbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--hud-statusbar);
  padding: 0 var(--hud-gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--hud-ink);
  color: var(--hud-surface);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: pre;
  z-index: 10;
}
</style>
