<script setup lang="ts">
// One row of a countermeasure list. Stack several for a list.
// <Protocol id="P-01" code="minimumReleaseAge: 1440">Attendre avant d'installer</Protocol>
defineProps<{
  id?: string
  code?: string
}>()
</script>

<template>
  <div class="hud-protocol">
    <span v-if="id" class="id">{{ id }}</span>
    <div class="text"><slot /></div>
    <code v-if="code || $slots.code" class="config"><slot name="code">{{ code }}</slot></code>
  </div>
</template>

<style scoped>
.hud-protocol {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 32px 0;
  border-top: 2px solid var(--hud-grid);
}

.hud-protocol:last-child {
  border-bottom: 2px solid var(--hud-grid);
}

.id {
  flex: none;
  width: 120px;
  padding: 12px 0;
  text-align: center;
  box-shadow: inset 0 0 0 3px var(--hud-accent);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.05em;
  color: var(--hud-accent);
}

.text {
  flex: 1;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
}

.text :deep(p) {
  margin: 0;
}

.hud-protocol .config {
  flex: none;
  padding: 12px 20px;
  background: var(--hud-surface);
  box-shadow: inset 0 0 0 2px var(--hud-ink);
  font-family: var(--hud-font-mono);
  font-size: 24px;
  font-weight: 400;
}
</style>
