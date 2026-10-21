<script setup lang="ts">
// Profile card for a package, a maintainer, an account…
// <SubjectCard header="Sujet 01 / 18" name="debug" meta="v4.4.2 — 08 sept. 2025"
//   :fields="[{ label: 'Source', value: 'jeton npm (hameçonné)', alert: true }]" />
// The #mugshot slot replaces the default package icon (e.g. with an <img>).
// `compact` shrinks paddings and type, for a card sharing the slide with large visuals.
withDefaults(defineProps<{
  header?: string
  flag?: string
  name: string
  meta?: string
  fields?: { label: string, value: string, alert?: boolean }[]
  compact?: boolean
}>(), {
  header: 'Sujet 01',
  flag: '■ Signalé',
  fields: () => [],
})
</script>

<template>
  <div class="hud-subject" :class="{ compact }">
    <div class="bar">
      <span>{{ header }}</span>
      <span v-if="flag" class="flag">{{ flag }}</span>
    </div>
    <div class="body">
      <div class="identity">
        <div class="mugshot">
          <slot name="mugshot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true">
              <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.730zm1 .27V12" />
              <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15" />
            </svg>
          </slot>
        </div>
        <div>
          <div class="name">{{ name }}</div>
          <div v-if="meta" class="meta">{{ meta }}</div>
        </div>
      </div>
      <div v-for="f in fields" :key="f.label" class="field">
        <span class="label">{{ f.label }}</span>
        <span class="value" :class="{ alert: f.alert }">{{ f.value }}</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hud-subject {
  background: var(--hud-surface);
  border: 2px solid var(--hud-ink);
}

.bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--hud-ink);
  color: var(--hud-surface);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.flag {
  color: var(--hud-accent-bright);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 40px;
}

.identity {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 10px;
}

.mugshot {
  flex: none;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dce4ee;
  border: 2px solid var(--hud-ink);
  overflow: hidden;
}

.mugshot svg {
  width: 80px;
  height: 80px;
}

.mugshot :slotted(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 48px;
  line-height: 1.15;
}

.meta {
  font-family: var(--hud-font-mono);
  font-size: 24px;
  color: var(--hud-muted);
  margin-top: 8px;
}

.field {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  padding-top: 18px;
  border-top: 2px solid var(--hud-grid);
}

.label {
  font-family: var(--hud-font-mono);
  font-size: 22px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 26px;
  text-align: right;
}

.value.alert {
  color: var(--hud-accent);
}
.compact .bar {
  padding: 8px 16px;
  font-size: 16px;
}

.compact .body {
  gap: 12px;
  padding: 24px 28px;
}

.compact .identity {
  gap: 24px;
  margin-bottom: 4px;
}

.compact .mugshot {
  width: 100px;
  height: 100px;
}

.compact .mugshot svg {
  width: 56px;
  height: 56px;
}

.compact .name {
  font-size: 36px;
}

.compact .meta {
  font-size: 20px;
  margin-top: 4px;
}

.compact .field {
  padding-top: 12px;
}

.compact .label {
  font-size: 18px;
}

.compact .value {
  font-size: 22px;
}
</style>
