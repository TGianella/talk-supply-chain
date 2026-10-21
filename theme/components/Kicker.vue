<script setup lang="ts">
// Mono label in accent color, prefixed with ">": "> SUJET IDENTIFIÉ"
withDefaults(defineProps<{
  prompt?: boolean
}>(), {
  prompt: true,
})
</script>

<template>
  <div class="hud-kicker"><span v-if="prompt">&gt; </span><slot /></div>
</template>

<style scoped>
.hud-kicker {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 26px;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-accent);
  margin-bottom: 28px;
  white-space: pre-wrap;
}
</style>
