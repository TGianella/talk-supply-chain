<script setup lang="ts">
// One row per package manager, revealed one per click: the package manager (version and date), a setting
// (and its file), and a value (and its note). `heads` titles the two last columns; `hot` puts a row in red,
// under a rule.
// - at the opening: the first row;
// - click n: the row n + 1.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <PmTable :heads="['réglage', 'par défaut']" :rows="[{ name: 'pnpm', when: 'v10 · janv. 2025', key: '…', file: '…', value: '…', note: '…' }]" />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

interface PmRow {
  name: string
  when: string
  key: string
  file: string
  value: string
  note: string
  hot?: boolean
}

const props = defineProps<{
  heads: [string, string]
  rows: PmRow[]
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))

// columns: the package manager, the setting, its value; one row every RS
const KX = 420
const VX = 1060
const R0 = 76
const RS = 100
const ry = (i: number) => R0 + i * RS
const height = computed(() => R0 + props.rows.length * RS - 14)

// hidden until its step
const off = (on: boolean) => on ? undefined : ''
</script>

<template>
  <svg :viewBox="`0 0 1400 ${height}`" class="pm-table" fill="none">
    <text :x="KX" y="30" class="label">{{ heads[0] }}</text>
    <text :x="VX" y="30" class="label">{{ heads[1] }}</text>
    <path d="M0 50H1400" class="rule" />

    <g v-for="(r, i) in rows" :key="r.name" class="pop" :data-off="off(step >= i)">
      <path v-if="r.hot" :d="`M0 ${ry(i) - 22}H1400`" class="rule faint" />
      <text x="0" :y="ry(i) + 30" class="name" :class="{ hot: r.hot }">{{ r.name }}</text>
      <text x="0" :y="ry(i) + 62" class="label">{{ r.when }}</text>
      <text :x="KX" :y="ry(i) + 28" class="key">{{ r.key }}</text>
      <text :x="KX" :y="ry(i) + 62" class="label">{{ r.file }}</text>
      <text :x="VX" :y="ry(i) + 30" class="name" :class="{ hot: r.hot }">{{ r.value }}</text>
      <text :x="VX" :y="ry(i) + 62" class="label" :class="{ hot: r.hot }">{{ r.note }}</text>
    </g>
  </svg>
</template>

<style scoped>
.pm-table {
  display: block;
  width: 1400px;
  padding: 32px 40px 24px;
  overflow: visible;
}

.rule {
  stroke: var(--hud-muted);
  stroke-width: 2;
}

.rule.faint {
  stroke: var(--hud-faint);
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 34px;
  fill: var(--hud-ink);
}

.key {
  font-family: var(--hud-font-mono);
  font-size: 26px;
  fill: var(--hud-ink);
}

.label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.name.hot,
.label.hot {
  fill: var(--hud-accent);
}

/* steps fade in; going back hides them at once */
.pop {
  transition: opacity 0.3s ease;
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
