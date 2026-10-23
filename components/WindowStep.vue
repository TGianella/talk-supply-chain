<script setup lang="ts">
// A window nested in a window of the case layout: shown over its content, centered, from step `at[0]` to
// `at[1]` (excluded) of that window, counted from the click that opened it (see `clicks` in the case
// layout), with the open-center transition of the other windows. Inside the parent window, after its content:
// <AppWindow title="…"><StaleBranch :pauses="[0, 4]" /><WindowStep :at="[1, 2]"><AppWindow title="…">…</AppWindow></WindowStep></AppWindow>
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at: [number, number]
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (opened?.value ?? 0))
const shown = computed(() => step.value >= props.at[0] && step.value < props.at[1])
</script>

<template>
  <!-- the classes of v-click, which the open-center transition is written for -->
  <div class="window-step open-center slidev-vclick-target" :class="{ 'slidev-vclick-hidden': !shown }">
    <slot />
  </div>
</template>

<style scoped>
.window-step {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
}
</style>
