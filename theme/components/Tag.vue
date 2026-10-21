<script setup lang="ts">
// Small mono label: <Tag>MALVEILLANT</Tag>
withDefaults(defineProps<{
  variant?: 'accent' | 'ink' | 'outline'
}>(), {
  variant: 'accent',
})
</script>

<template>
  <span class="hud-tag" :class="variant"><slot /></span>
</template>

<style scoped>
.hud-tag {
  display: inline-block;
  padding: 4px 14px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  vertical-align: middle;
}

.accent { background: var(--hud-accent); color: var(--hud-surface); }
.ink { background: var(--hud-ink); color: var(--hud-accent-bright); }
.outline { box-shadow: inset 0 0 0 3px var(--hud-accent); color: var(--hud-accent); }
</style>
