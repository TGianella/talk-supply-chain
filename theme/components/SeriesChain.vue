<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

// Chain of the actors of a series, the current one filled, those before it outlined in ink.
// `series` names the themeConfig key that lists the actors; `actor` is the 1-based current one.
// Used at the top right of the defense and cards layouts.
const props = withDefaults(defineProps<{
  series?: string
  actor?: number
}>(), {
  series: 'defenses',
})

const { $slidev } = useSlideContext()
const actors = computed(() => ($slidev?.themeConfigs?.[props.series] ?? []) as unknown as string[])
</script>

<template>
  <div v-if="actors.length" class="hud-chain">
    <template v-for="(a, i) in actors" :key="a">
      <i v-if="i" :class="{ done: actor && i < actor }" />
      <span class="step" :class="{ done: actor && i + 1 < actor, current: actor === i + 1 }">{{ a }}</span>
    </template>
  </div>
</template>

<style scoped>
.hud-chain {
  display: flex;
  align-items: center;
}

i {
  width: 32px;
  height: 2px;
  background: var(--hud-faint);
}

i.done {
  background: var(--hud-ink);
}

.step {
  padding: 10px 16px;
  background: var(--hud-surface);
  box-shadow: inset 0 0 0 2px var(--hud-faint);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  line-height: 1.2;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.step.done {
  box-shadow: inset 0 0 0 2px var(--hud-ink);
  color: var(--hud-ink);
}

.step.current {
  background: var(--hud-ink);
  box-shadow: none;
  color: var(--hud-surface);
}
</style>
