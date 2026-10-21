<script setup lang="ts">
// Redacted text: an ink bar that keeps the text width.
// <Redact>npm_AbC123</Redact>, or <Redact reveal> to show the text with a strikethrough bar.
defineProps<{
  reveal?: boolean
}>()
</script>

<template>
  <span class="hud-redact" :class="{ reveal }"><slot /></span>
</template>

<style scoped>
.hud-redact {
  background: var(--hud-ink);
  color: transparent;
  padding: 0 0.15em;
  user-select: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.hud-redact.reveal {
  background: var(--hud-accent-tint);
  color: inherit;
  text-decoration: line-through 3px var(--hud-accent);
}
</style>
