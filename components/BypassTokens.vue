<script setup lang="ts">
// What a granular npm token with "bypass 2FA" (the option made for the CI) can still do without 2FA:
// the token on the left, the actions on the right, each with what it requires.
// - at the opening: everything, without 2FA;
// - click 1: since 31.07.2026, the sensitive actions (tokens, access, maintainers, trusted publishing,
//   organization) require an interactive 2FA challenge;
// - click 2: publishing too, planned for January 2027: the CI moves to trusted or staged publishing.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <BypassTokens />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const sensitive = computed(() => step.value >= 1)
const publish = computed(() => step.value >= 2)

// the token: header bar, then rows every RS, a label then a value
const HB = 44
const RS = 40
const token = { x: 0, y: 40, w: 440, vx: 190, title: 'npm_•••• · granulaire', rows: [['droits', 'écriture'], ['bypass 2FA', 'oui'], ['expire', '90 j max']] }
const tokenH = HB + 18 + token.rows.length * RS
const ry = (i: number) => token.y + HB + 30 + i * RS

// the actions, one per row; `step`: the step that puts it behind 2FA, with its date
const AX = 560
const SX = 1130
const A0 = 70
const AS = 72
const actions = [
  { label: 'Publier une version', step: 2, date: 'janv. 2027' },
  { label: 'Créer, supprimer des tokens', step: 1, date: 'juil. 2026' },
  { label: 'Changer accès et mainteneurs', step: 1, date: 'juil. 2026' },
  { label: 'Modifier le trusted publishing', step: 1, date: 'juil. 2026' },
  { label: 'Gérer l’organisation, les équipes', step: 1, date: 'juil. 2026' },
]
const ay = (i: number) => A0 + 40 + i * AS
const locked = (a: { step: number }) => step.value >= a.step

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 520" class="bypass-tokens" fill="none">
    <!-- the token -->
    <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="tokenH + 3" class="card" />
    <rect :x="token.x - 1.5" :y="token.y - 1.5" :width="token.w + 3" :height="HB + 1.5" class="bar" />
    <text :x="token.x + 20" :y="token.y + HB / 2 + 1" class="bar-title" dominant-baseline="middle">{{ token.title }}</text>
    <template v-for="([label, value], i) in token.rows" :key="label">
      <text :x="token.x + 20" :y="ry(i)" class="label" dominant-baseline="middle">{{ label }}</text>
      <text :x="token.x + token.vx" :y="ry(i)" class="value" :class="{ hot: i === 1 }" dominant-baseline="middle">{{ value }}</text>
    </template>
    <rect :x="token.x" :y="token.y" :width="token.w" :height="tokenH" class="outline" />
    <text :x="token.x" :y="token.y + tokenH + 44" class="note">pour la CI : pas de code 2FA à saisir</text>

    <!-- the actions, and what each requires -->
    <text :x="AX" :y="A0 - 14" class="label">avec ce token</text>
    <text :x="SX" :y="A0 - 14" class="label">2FA</text>
    <path :d="`M${AX} ${A0}H1400`" class="rule" />
    <g v-for="(a, i) in actions" :key="a.label">
      <text :x="AX" :y="ay(i)" class="action" :data-locked="locked(a) ? '' : undefined" dominant-baseline="middle">{{ a.label }}</text>
      <text :x="SX" :y="ay(i)" class="status pop" :data-off="locked(a) ? '' : undefined" dominant-baseline="middle">✓ non demandée</text>
      <text :x="SX" :y="ay(i)" class="status hot pop" :data-off="off(locked(a))" :style="d(0.15 + 0.1 * i)" dominant-baseline="middle">requise</text>
      <text :x="SX + 120" :y="ay(i)" class="date pop" :data-off="off(locked(a))" :style="d(0.15 + 0.1 * i)" dominant-baseline="middle">{{ a.date }}</text>
    </g>

    <!-- click 2: what the CI publishes with instead -->
    <text :x="AX" :y="ay(actions.length) + 20" class="note hot pop" :data-off="off(publish)" :style="d(0.5)">→ la CI publie par trusted ou staged publishing</text>
  </svg>
</template>

<style scoped>
.bypass-tokens {
  display: block;
  width: 1400px;
  padding: 32px 40px 24px;
  overflow: visible;
}

/* fills reach under the whole stroke of the outline drawn over them (see TrustedPublishing) */
.card {
  fill: var(--hud-surface);
}

.bar {
  fill: var(--hud-ink);
}

.outline {
  stroke: var(--hud-ink);
  stroke-width: 3;
}

.bar-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.04em;
  fill: var(--hud-surface);
}

.label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.value {
  font-family: var(--hud-font-mono);
  font-size: 22px;
  fill: var(--hud-ink);
}

.rule {
  stroke: var(--hud-muted);
  stroke-width: 2;
}

.action {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 32px;
  fill: var(--hud-ink);
  transition: opacity 0.3s ease;
}

/* behind 2FA now: the action fades, its status turns red */
.action[data-locked] {
  opacity: 0.35;
}

.status {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 22px;
  fill: var(--hud-ink);
}

.date {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.note {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  fill: var(--hud-muted);
}

.hot,
.value.hot,
.note.hot {
  font-weight: 600;
  fill: var(--hud-accent);
}

/* steps fade in (--d orders what a step shows); going back hides them at once */
.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
